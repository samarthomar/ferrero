"""
Weather Intelligence and Crop Monitoring Service.
"""

import logging
from datetime import datetime
from app.data.loader import data_store

logger = logging.getLogger(__name__)


def get_current_conditions():
    """Return latest weather per region as an array."""
    df = data_store.df_weather
    regions_meta = [
        {"key": "Turkey", "flag": "🇹🇷", "label": "Turkey Black Sea", "chillingTarget": 1200},
        {"key": "Italy", "flag": "🇮🇹", "label": "Italy Piedmont", "chillingTarget": 1000},
        {"key": "Oregon", "flag": "🇺🇸", "label": "Oregon Willamette", "chillingTarget": 800},
    ]
    results = []
    for meta in regions_meta:
        rk = meta["key"]
        if not df.empty and "region" in df.columns:
            rdf = df[df["region"] == rk].sort_values("month")
            if len(rdf) > 0:
                latest = rdf.iloc[-1]
                temp = round(float(latest.get("avg_temp_c", 20)), 1)
                rainfall = round(float(latest.get("rainfall_mm", 50)), 0)
                crop_health = round(float(latest.get("crop_health_index", 75)), 0)
                chilling = round(float(latest.get("chilling_hours", 0)), 0) if "chilling_hours" in latest.index else 0
                frost_events = int(latest.get("frost_events", 0)) if "frost_events" in latest.index else 0
                min_temp = round(float(latest.get("min_temp_c", 5)), 1) if "min_temp_c" in latest.index else 5.0
                now_month = datetime.now().month
                if frost_events > 0 or (now_month in [3, 4] and min_temp < 2):
                    frost_risk = "HIGH"
                elif now_month in [3, 4, 5] and min_temp < 5:
                    frost_risk = "MEDIUM"
                else:
                    frost_risk = "LOW"
                results.append({
                    "flag": meta["flag"], "region": meta["label"],
                    "temp": f"{temp}\u00b0C", "rainfall": int(rainfall),
                    "cropHealth": int(crop_health), "frostRisk": frost_risk,
                    "chillingHours": int(chilling), "chillingTarget": meta["chillingTarget"],
                })
                continue
        # Fallback
        fb_data = {
            "Turkey": {"temp": "22.3\u00b0C", "rainfall": 48, "cropHealth": 78, "frostRisk": "LOW", "chillingHours": 1150},
            "Italy": {"temp": "24.1\u00b0C", "rainfall": 35, "cropHealth": 82, "frostRisk": "LOW", "chillingHours": 920},
            "Oregon": {"temp": "19.7\u00b0C", "rainfall": 28, "cropHealth": 85, "frostRisk": "LOW", "chillingHours": 780},
        }
        fb = fb_data[rk]
        results.append({
            "flag": meta["flag"], "region": meta["label"],
            "temp": fb["temp"], "rainfall": fb["rainfall"],
            "cropHealth": fb["cropHealth"], "frostRisk": fb["frostRisk"],
            "chillingHours": fb["chillingHours"], "chillingTarget": meta["chillingTarget"],
        })
    return results


def get_weather_timeline():
    """Return monthly weather for the last 12 months."""
    df = data_store.df_weather
    months_data = []
    if not df.empty and "region" in df.columns:
        turkey = df[df["region"] == "Turkey"].sort_values("month").tail(12)
        for _, row in turkey.iterrows():
            m = row["month"]
            month_str = m.strftime("%Y-%m") if hasattr(m, "strftime") else str(m)[:7]
            months_data.append({
                "month": month_str,
                "avg_temp_c": round(float(row.get("avg_temp_c", 15)), 1),
                "rainfall_mm": round(float(row.get("rainfall_mm", 50)), 0),
                "crop_health_index": round(float(row.get("crop_health_index", 70)), 0),
            })
    return {"months": months_data, "currentMonth": datetime.now().month - 1}


def get_frost_risk_assessment():
    """Historical frost events with crop and price impact."""
    return [
        {"event": "April 2025 - Turkey Black Sea Late Frost", "cropLoss": "50% crop destroyed (Ordu), 90% in Giresun highlands", "priceImpact": "+35% price spike within 6 weeks"},
        {"event": "March 2014 - Turkey Severe Frost", "cropLoss": "Major crop failure across Black Sea belt", "priceImpact": "Prices doubled from 4.50 to 9.00 EUR/kg"},
        {"event": "Spring 2004 - Late Frost + Drought", "cropLoss": "30% yield reduction in Eastern Turkey", "priceImpact": "+28% price increase over 3 months"},
    ]


def get_harvest_calendar():
    """Harvest windows by region."""
    return [
        {"region": "Turkey", "window": "Aug 15 - Sep 30"},
        {"region": "Italy", "window": "Aug 25 - Nov 15"},
        {"region": "Oregon", "window": "Sep 15 - Oct 31"},
    ]
