import json
import os
import logging
import numpy as np
from app.data.loader import data_store, SEED_DIR

logger = logging.getLogger(__name__)


def get_kpis() -> dict:
    """Calculate key performance indicators from the unified dataset."""
    df = data_store.unified_df
    if df.empty:
        return _mock_kpis()

    try:
        latest = df.iloc[-1]
        month_ago = df.iloc[-30] if len(df) >= 30 else df.iloc[0]

        # Current weighted average price (EUR/kg)
        current_price = round(float(latest["price_eur"]), 2)
        past_price = float(month_ago["price_eur"])
        price_change_pct = round(((current_price - past_price) / past_price) * 100, 2)

        # Total exposure = total inventory (tons) × current price (EUR/kg) × 1000 (kg/ton) / 1,000,000
        inventory = float(latest.get("inventory_tons", 40000))
        total_exposure_m = round(inventory * current_price * 1000 / 1_000_000, 2)

        # Days of supply
        days_of_supply = round(float(latest.get("days_of_supply", 60)), 1)

        # FX rates
        eur_usd = round(float(latest.get("eur_usd", 1.08)), 4)
        eur_try = round(float(latest.get("eur_try", 34.5)), 2)

        # Active contracts from JSON
        contracts = data_store.supplier_contracts
        if isinstance(contracts, list):
            active = sum(1 for c in contracts if c.get("status", "").lower() == "active")
        else:
            active = 6

        # Inventory utilization
        capacity = float(latest.get("capacity_tons", 50000))
        inv_util = round((inventory / capacity) * 100, 1) if capacity > 0 else 0

        # Contract coverage
        contracted_volume = 0
        if isinstance(contracts, list):
            contracted_volume = sum(c.get("volume_tons", 0) for c in contracts if c.get("status", "").lower() == "active")
        else:
            contracted_volume = 60000
        contract_coverage_pct = round((contracted_volume / 250000) * 100, 2)

        return {
            "current_price_eur": current_price,
            "price_change_30d_pct": price_change_pct,
            "inventory_tons": inventory,
            "total_exposure_m": total_exposure_m,
            "days_of_supply": days_of_supply,
            "eur_usd": eur_usd,
            "eur_try": eur_try,
            "active_contracts": active,
            "contract_coverage_pct": contract_coverage_pct,
        }
    except Exception as e:
        logger.error(f"Error calculating KPIs: {e}", exc_info=True)
        return _mock_kpis()


def _mock_kpis() -> dict:
    """Fallback KPIs if data is not loaded."""
    return {
        "current_price_eur": 8.45,
        "price_change_30d_pct": 3.2,
        "inventory_tons": 38500,
        "total_exposure_m": 850.5,
        "days_of_supply": 58.4,
        "eur_usd": 1.0850,
        "eur_try": 35.12,
        "active_contracts": 6,
        "contract_coverage_pct": 45.5,
    }


def get_unified_view() -> dict:
    """Return complete unified dashboard payload."""
    return {
        "kpis": get_kpis(),
        "charts": get_time_series_data(),
        "risk_scores": get_risk_scores(),
        "suppliers": get_supplier_summary(),
    }


def get_time_series_data() -> list[dict]:
    """Return last 180 days of unified time-series data for charting."""
    df = data_store.unified_df
    if df.empty:
        return []

    recent = df.tail(180).copy()
    recent["date"] = recent["date"].dt.strftime("%Y-%m-%d")
    # Round numeric columns for cleaner JSON
    numeric_cols = recent.select_dtypes(include=[np.number]).columns
    recent[numeric_cols] = recent[numeric_cols].round(4)
    return recent.to_dict(orient="records")


def get_price_history(origin: str | None = None) -> list[dict]:
    """Return price history, optionally filtered by origin."""
    df = data_store.df_prices
    if df.empty:
        return []

    if origin:
        df = df[df["origin"].str.lower() == origin.lower()]

    df = df.copy()
    df["date"] = df["date"].dt.strftime("%Y-%m-%d")
    return df.to_dict(orient="records")


def get_risk_scores() -> dict:
    """Calculate risk scores (0-100) across 6 dimensions using actual data signals."""
    df = data_store.unified_df
    if df.empty:
        return {
            "supply": {"score": 50, "detail": "Data unavailable"},
            "fx": {"score": 50, "detail": "Data unavailable"},
            "tariff": {"score": 40, "detail": "Data unavailable"},
            "weather": {"score": 50, "detail": "Data unavailable"},
            "demand": {"score": 30, "detail": "Data unavailable"},
            "logistics": {"score": 40, "detail": "Data unavailable"},
        }

    try:
        latest = df.iloc[-1]
        week_ago = df.iloc[-7] if len(df) >= 7 else df.iloc[0]

        # Supply risk: low inventory + high demand = high risk
        dos = float(latest.get("days_of_supply", 60))
        supply_risk = max(0, min(100, int(100 - dos)))  # <30 days = >70 risk

        # FX risk: high TRY volatility = high risk
        if len(df) >= 30:
            fx_volatility = df["eur_try"].tail(30).pct_change().std() * 100
            fx_risk = max(0, min(100, int(fx_volatility * 50)))
        else:
            fx_risk = 45

        # Weather risk: low crop health = high risk
        crop_health = float(latest.get("crop_health_index", 70))
        weather_risk = max(0, min(100, int(100 - crop_health)))

        # Demand risk: increasing demand trend
        if len(df) >= 30:
            demand_trend = (float(latest.get("demand_tons", 8000)) - float(df.iloc[-30].get("demand_tons", 8000)))
            demand_risk = max(0, min(100, int(30 + demand_trend / 100)))
        else:
            demand_risk = 30

        # Tariff risk (moderate baseline)
        tariff_risk = 35

        # Logistics risk: based on price trend
        price_change_7d = ((float(latest["price_eur"]) - float(week_ago["price_eur"])) / float(week_ago["price_eur"])) * 100
        logistics_risk = max(0, min(100, int(40 + price_change_7d * 5)))

        return {
            "supply": {
                "score": supply_risk,
                "detail": f"Inventory at {dos:.0f} days of supply. (Critical < 30)"
            },
            "fx": {
                "score": fx_risk,
                "detail": "High TRY volatility over last 30 days." if fx_risk > 60 else "Stable EUR/TRY exchange rates."
            },
            "tariff": {
                "score": tariff_risk,
                "detail": "No immediate changes to EU-Turkey agricultural tariffs expected."
            },
            "weather": {
                "score": weather_risk,
                "detail": f"Crop health index at {crop_health:.0f}/100."
            },
            "demand": {
                "score": demand_risk,
                "detail": "Stable B2B demand forecasts." if demand_risk < 50 else "Spike in near-term demand."
            },
            "logistics": {
                "score": logistics_risk,
                "detail": f"7-day price momentum is {price_change_7d:+.1f}%, indicating {'potential supply chain friction' if price_change_7d > 2 else 'stable freight availability'}."
            },
        }
    except Exception as e:
        logger.error(f"Error calculating risk scores: {e}")
        return {
            "supply": {"score": 50, "detail": "Data unavailable"},
            "fx": {"score": 50, "detail": "Data unavailable"},
            "tariff": {"score": 40, "detail": "Data unavailable"},
            "weather": {"score": 50, "detail": "Data unavailable"},
            "demand": {"score": 30, "detail": "Data unavailable"},
            "logistics": {"score": 40, "detail": "Data unavailable"},
        }


def get_supplier_summary() -> list[dict]:
    """Return supplier contract summary for the dashboard."""
    contracts = data_store.supplier_contracts
    if not contracts:
        return []

    result = []
    for c in contracts:
        result.append({
            "supplier_id": c.get("supplier_id", ""),
            "supplier_name": c.get("supplier_name", ""),
            "origin": c.get("origin_country", ""),
            "price_per_kg": c.get("price_per_kg_eur", 0),
            "volume_tons": c.get("volume_tons", 0),
            "utilization_pct": round(
                c.get("volume_tons", 0) / c.get("max_volume", 1) * 100, 1
            ) if c.get("max_volume", 0) > 0 else 0,
            "quality": c.get("quality_grade", ""),
            "status": c.get("status", ""),
            "delivery_terms": c.get("delivery_terms", ""),
        })
    return result
