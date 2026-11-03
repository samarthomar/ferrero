"""
What-If Scenario Simulation Engine.
Models the financial impact of market variable changes on Ferrero's hazelnut pricing.
"""

from app.data.loader import data_store
import logging

logger = logging.getLogger(__name__)


def _get_baseline() -> dict:
    """Calculate baseline pricing metrics from actual data."""
    df = data_store.unified_df
    contracts = data_store.supplier_contracts

    if not df.empty:
        latest = df.iloc[-1]
        current_price = float(latest["price_eur"])
        inventory = float(latest.get("inventory_tons", 40000))
        eur_try = float(latest.get("eur_try", 34))
        demand = float(latest.get("demand_tons", 8500))
    else:
        current_price = 8.45
        inventory = 40000
        eur_try = 34.5
        demand = 8500

    # Annual pricing volume estimate (tons)
    annual_volume = demand * 12

    # Supplier mix from contracts
    supplier_mix = {}
    if contracts:
        total_vol = sum(c.get("volume_tons", 0) for c in contracts)
        for c in contracts:
            origin = c.get("origin_country", "Unknown")
            vol = c.get("volume_tons", 0)
            if origin in supplier_mix:
                supplier_mix[origin] += vol
            else:
                supplier_mix[origin] = vol
        # Convert to percentages
        if total_vol > 0:
            supplier_mix = {k: round(v / total_vol * 100, 1) for k, v in supplier_mix.items()}
    else:
        supplier_mix = {"Turkey": 55, "Italy": 25, "Oregon": 20}

    # Annual cost in EUR (volume in tons × price in EUR/kg × 1000 kg/ton)
    annual_cost = annual_volume * current_price * 1000

    return {
        "current_price_eur": round(current_price, 2),
        "annual_volume_tons": round(annual_volume),
        "annual_cost_eur": round(annual_cost),
        "annual_cost_m": round(annual_cost / 1_000_000, 2),
        "inventory_tons": round(inventory),
        "eur_try": round(eur_try, 2),
        "monthly_demand_tons": round(demand),
        "supplier_mix": supplier_mix,
        "margin_pct": 32.0,  # Assumed gross margin
    }


def run_scenario(params: dict) -> dict:
    """Run a what-if simulation with the given parameter adjustments."""
    baseline = _get_baseline()

    tariff = params.get("tariff_change_pct", 0)
    fx = params.get("fx_rate_change_pct", 0)
    supply = params.get("supply_disruption_pct", 0)
    demand = params.get("demand_change_pct", 0)
    logistics = params.get("logistics_cost_change_pct", 0)
    weather = params.get("weather_impact_pct", 0)

    base_cost = baseline["annual_cost_eur"]
    base_price = baseline["current_price_eur"]

    # ── Price impact model ──
    # Tariff: direct cost increase
    tariff_impact = base_cost * (tariff / 100)

    # FX: affects Turkish sourcing (largest origin typically ~55%)
    turkey_share = baseline["supplier_mix"].get("Turkey", 55) / 100
    fx_impact = base_cost * turkey_share * (fx / 100) * 0.6  # 60% pass-through

    # Supply disruption & Weather: reduces available volume → price increase
    supply_price_multiplier = 1 + (abs(supply) / 100 * 1.5) if supply > 0 else 1 - (abs(supply) / 100 * 0.3)
    supply_impact = base_cost * (supply_price_multiplier - 1) * 0.4
    weather_impact = base_cost * (abs(weather) / 100 * 1.2) if weather < 0 else 0

    # Logistics: typically 5-8% of total cost
    logistics_share = 0.07
    logistics_impact = base_cost * logistics_share * (logistics / 100)

    # Calculate initial price impact to drive elasticity
    price_driven_impact = tariff_impact + fx_impact + supply_impact + weather_impact + logistics_impact
    price_increase_pct = (price_driven_impact / base_cost) * 100 if base_cost > 0 else 0

    # Elasticity: For every 10% price increase, Ferrero trims demand by 2% (-0.2 coefficient)
    elasticity_coefficient = -0.2
    induced_demand_pct = price_increase_pct * elasticity_coefficient
    
    # Total demand = user slider + induced
    total_demand_pct = demand + induced_demand_pct
    
    # Demand: more demand = more spend
    demand_impact = base_cost * (total_demand_pct / 100)

    # Inventory Buffer: Building a buffer requires purchasing extra volume (capital cost)
    inventory = params.get("inventory_change_pct", 0)
    inventory_cost_impact = base_cost * (inventory / 100)

    total_impact = price_driven_impact + demand_impact + inventory_cost_impact
    scenario_cost = base_cost + total_impact
    new_effective_price = base_price * (scenario_cost / base_cost)

    # ── Supplier mix rebalancing ──
    scenario_mix = dict(baseline["supplier_mix"])
    if supply > 10:
        # If supply disruption is high, diversify away from Turkey
        turkey_reduction = min(scenario_mix.get("Turkey", 55), supply * 0.8)
        scenario_mix["Turkey"] = round(scenario_mix.get("Turkey", 55) - turkey_reduction, 1)
        scenario_mix["Italy"] = round(scenario_mix.get("Italy", 25) + turkey_reduction * 0.6, 1)
        scenario_mix["Oregon"] = round(scenario_mix.get("Oregon", 20) + turkey_reduction * 0.4, 1)

    if fx > 10:
        # High FX volatility, shift to non-Turkish sources
        shift = min(scenario_mix.get("Turkey", 55) * 0.15, 10)
        scenario_mix["Turkey"] = round(scenario_mix.get("Turkey", 55) - shift, 1)
        scenario_mix["Italy"] = round(scenario_mix.get("Italy", 25) + shift * 0.5, 1)
        scenario_mix["Oregon"] = round(scenario_mix.get("Oregon", 20) + shift * 0.5, 1)

    # ── Risk score changes ──
    risk_changes = {
        "supply": f"{'+' if supply > 0 else ''}{int(supply * 0.8)}" if supply != 0 else "0",
        "fx": f"{'+' if fx > 0 else ''}{int(fx * 0.6)}" if fx != 0 else "0",
        "tariff": f"+{int(tariff * 0.7)}" if tariff > 0 else "0",
        "demand": f"{'+' if demand > 0 else ''}{int(demand * 0.4)}" if demand != 0 else "0",
        "logistics": f"+{int(logistics * 0.3)}" if logistics > 0 else "0",
    }

    # ── Margin impact ──
    delta_pct = (total_impact / base_cost) * 100
    margin_impact = -delta_pct * 0.4  # Pricing cost is ~40% of COGS

    # ── Determine recommended action & rich AI reasoning ──
    
    # 1. Determine base action
    if delta_pct > 8: action = "BUY NOW"
    elif delta_pct > 3: action = "HEDGE & BUY"
    elif delta_pct > 0: action = "HOLD"
    else: action = "WAIT / DEFER"

    # 2. Build 3-4 line meaningful recommendation
    rec_lines = []
    
    # Line 1: Summary of impact
    if delta_pct > 0:
        rec_lines.append(f"• IMPACT: This scenario triggers a severe {delta_pct:.1f}% surge in pricing costs, eroding gross margins by {abs(margin_impact):.1f}%." if delta_pct > 5 else f"• IMPACT: This scenario causes a moderate {delta_pct:.1f}% cost increase.")
    elif delta_pct < 0:
        rec_lines.append(f"• IMPACT: This scenario creates a highly favorable {abs(delta_pct):.1f}% cost reduction, improving gross margins by {abs(margin_impact):.1f}%.")
    else:
        rec_lines.append("• IMPACT: This baseline scenario maintains current market equilibrium with zero immediate cost deviation.")

    # Line 2: Identify primary drivers and specific mitigations
    drivers = []
    if tariff > 5: drivers.append("new EU-Turkey tariffs")
    if fx > 5: drivers.append("TRY currency depreciation")
    if weather < -10: drivers.append("severe Black Sea frost damage")
    if supply > 10: drivers.append("geopolitical supply chain shocks")
    if logistics > 10: drivers.append("freight rate spikes")
    
    if drivers:
        rec_lines.append(f"• STRATEGY: The primary cost drivers are {', and '.join(drivers)}. To mitigate this, immediately execute forward FX hedging and aggressively rebalance the supplier mix towards Oregon and Italy to bypass Black Sea exposure.")
    elif delta_pct < 0:
        rec_lines.append("• STRATEGY: Favorable macro conditions provide an opportunity to build strategic reserves at a discount. We advise securing long-term contracts now before market sentiment shifts.")
    else:
        rec_lines.append("• STRATEGY: Market conditions are stable. Maintain current long-term supplier agreements and continue routine monitoring of Black Sea weather patterns.")

    # Line 3: Inventory strategy (incorporating the new inventory slider)
    if inventory > 0:
        rec_lines.append(f"• INVENTORY: Your simulated {inventory}% increase in strategic inventory provides a strong physical buffer against these shocks, ensuring Nutella production lines remain uninterrupted despite the volatility.")
    elif inventory < 0:
        rec_lines.append(f"• INVENTORY: WARNING! Simulating a {abs(inventory)}% drawdown in inventory leaves production dangerously exposed. Rebuild the buffer immediately.")
    else:
        if delta_pct > 5:
            rec_lines.append("• INVENTORY: We strongly recommend temporarily increasing the Alba and Istanbul warehouse inventory buffers by 15-20% to weather the incoming price storm.")
        else:
            rec_lines.append("• INVENTORY: Current physical inventory buffers (approx. 60 days of supply) remain adequate for this scenario. No immediate adjustments to warehouse capacity are required.")

    action_detail = "\n\n".join(rec_lines)

    total_volume_pct = total_demand_pct + inventory

    return {
        "baseline": {
            "total_cost_eur": round(base_cost),
            "total_cost_m": round(base_cost / 1_000_000, 2),
            "price_per_kg": baseline["current_price_eur"],
            "supplier_mix": baseline["supplier_mix"],
            "margin_pct": baseline["margin_pct"],
            "annual_volume_tons": baseline["annual_volume_tons"],
        },
        "scenario": {
            "total_cost_eur": round(scenario_cost),
            "total_cost_m": round(scenario_cost / 1_000_000, 2),
            "price_per_kg": round(new_effective_price, 2),
            "supplier_mix": scenario_mix,
            "margin_pct": round(baseline["margin_pct"] + margin_impact, 2),
        },
        "impact": {
            "cost_delta_eur": round(total_impact),
            "cost_delta_m": round(total_impact / 1_000_000, 2),
            "cost_delta_pct": round(delta_pct, 2),
            "price_delta_eur_kg": round(new_effective_price - base_price, 2),
            "demand_volume_delta_tons": round(baseline["annual_volume_tons"] * (total_volume_pct / 100)),
            "breakdown": {
                "tariff_impact_m": round(tariff_impact / 1_000_000, 2),
                "fx_impact_m": round(fx_impact / 1_000_000, 2),
                "supply_impact_m": round(supply_impact / 1_000_000, 2),
                "demand_impact_m": round(demand_impact / 1_000_000, 2),
                "logistics_impact_m": round(logistics_impact / 1_000_000, 2),
            },
            "margin_impact_pct": round(margin_impact, 2),
        },
        "recommendation": {
            "action": action,
            "detail": action_detail,
            "inventory_buffer": f"{'Increase by 20%' if delta_pct > 5 else 'Increase by 10%' if delta_pct > 0 else 'Maintain current levels'}",
            "risk_changes": risk_changes,
        },
    }


def get_presets() -> list[dict]:
    """Return pre-built scenario templates."""
    return [
        {
            "name": "2025 Turkey Frost Replay",
            "description": "Historical frost event with massive crop loss.",
            "icon": "❄️",
            "params": {"tariff_change_pct": 0, "fx_rate_change_pct": 8, "supply_disruption_pct": 40, "demand_change_pct": 0, "logistics_cost_change_pct": 15, "weather_impact_pct": -45},
        },
        {
            "name": "Drought Season",
            "description": "Prolonged drought affecting crop yields.",
            "icon": "☀️",
            "params": {"tariff_change_pct": 0, "fx_rate_change_pct": 0, "supply_disruption_pct": 15, "demand_change_pct": 0, "logistics_cost_change_pct": 5, "weather_impact_pct": -25},
        },
        {
            "name": "Perfect Harvest",
            "description": "Ideal weather conditions leading to surplus.",
            "icon": "🌱",
            "params": {"tariff_change_pct": 0, "fx_rate_change_pct": 0, "supply_disruption_pct": -10, "demand_change_pct": 5, "logistics_cost_change_pct": 0, "weather_impact_pct": 0},
        },
        {
            "name": "Turkish Supply Shock",
            "description": "20% supply disruption from Turkey due to severe weather or geopolitical event",
            "icon": "🌪️",
            "params": {"tariff_change_pct": 0, "fx_rate_change_pct": 5, "supply_disruption_pct": 20, "demand_change_pct": 0, "logistics_cost_change_pct": 10, "weather_impact_pct": -20},
        },
        {
            "name": "EUR/TRY Crisis",
            "description": "Sharp Turkish Lira depreciation with moderate supply impact",
            "icon": "💱",
            "params": {"tariff_change_pct": 0, "fx_rate_change_pct": 25, "supply_disruption_pct": 5, "demand_change_pct": 0, "logistics_cost_change_pct": 5, "weather_impact_pct": 0},
        },
    ]
