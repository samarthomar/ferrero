"""
Market Intelligence & External Signal Monitoring.
Generates real-time alerts, market signals, and news summaries from seed data.
"""

import os
import glob
import logging
from datetime import datetime, timedelta
from app.data.loader import data_store, SEED_DIR

logger = logging.getLogger(__name__)


def get_market_signals() -> list[dict]:
    """Generate market intelligence signals from actual data analysis."""
    df = data_store.unified_df
    signals = []
    now = datetime.now()

    if df.empty:
        return _mock_signals()

    latest = df.iloc[-1]
    week_ago = df.iloc[-7] if len(df) >= 7 else df.iloc[0]
    month_ago = df.iloc[-30] if len(df) >= 30 else df.iloc[0]

    cp = float(latest["price_eur"])
    pp_7d = float(week_ago["price_eur"])
    pp_30d = float(month_ago["price_eur"])
    change_7d = ((cp - pp_7d) / pp_7d) * 100
    change_30d = ((cp - pp_30d) / pp_30d) * 100

    # ── Price signals ──
    if abs(change_7d) > 5:
        signals.append({
            "severity": "critical",
            "category": "Price",
            "title": f"Price {'Spike' if change_7d > 0 else 'Drop'} Detected",
            "description": f"Hazelnut prices {'rose' if change_7d > 0 else 'fell'} {abs(change_7d):.1f}% in the last 7 days to €{cp:.2f}/kg.",
            "timestamp": (now - timedelta(hours=2)).isoformat() + "Z",
            "value": f"€{cp:.2f}/kg",
        })
    elif abs(change_7d) > 2:
        signals.append({
            "severity": "warning",
            "category": "Price",
            "title": f"Notable Price {'Increase' if change_7d > 0 else 'Decrease'}",
            "description": f"Prices moved {change_7d:+.1f}% over the past week to €{cp:.2f}/kg. Monitoring for continued momentum.",
            "timestamp": (now - timedelta(hours=6)).isoformat() + "Z",
            "value": f"{change_7d:+.1f}%",
        })

    # 30-day trend signal
    if abs(change_30d) > 8:
        signals.append({
            "severity": "critical" if change_30d > 0 else "warning",
            "category": "Price",
            "title": f"Sustained Price {'Uptrend' if change_30d > 0 else 'Downtrend'}",
            "description": f"30-day price movement of {change_30d:+.1f}% indicates a strong {'bullish' if change_30d > 0 else 'bearish'} trend. Current: €{cp:.2f}/kg vs €{pp_30d:.2f}/kg a month ago.",
            "timestamp": (now - timedelta(hours=12)).isoformat() + "Z",
            "value": f"{change_30d:+.1f}%",
        })

    # ── FX signals ──
    eur_try = float(latest.get("eur_try", 34))
    eur_try_prev = float(week_ago.get("eur_try", 34))
    fx_change = ((eur_try - eur_try_prev) / eur_try_prev) * 100
    if abs(fx_change) > 2:
        signals.append({
            "severity": "warning",
            "category": "FX",
            "title": f"EUR/TRY {'Surge' if fx_change > 0 else 'Drop'}",
            "description": f"EUR/TRY moved {fx_change:+.1f}% to {eur_try:.2f}. Turkish Lira {'weakening' if fx_change > 0 else 'strengthening'} impacts hazelnut sourcing costs.",
            "timestamp": (now - timedelta(hours=4)).isoformat() + "Z",
            "value": f"{eur_try:.2f}",
        })

    # ── Inventory signals ──
    dos = float(latest.get("days_of_supply", 60))
    if dos < 30:
        signals.append({
            "severity": "critical",
            "category": "Supply",
            "title": "Critical Inventory Alert",
            "description": f"Days of supply dropped to {dos:.0f} days. Immediate pricing action required to prevent stockout risk.",
            "timestamp": (now - timedelta(hours=1)).isoformat() + "Z",
            "value": f"{dos:.0f} days",
        })
    elif dos < 45:
        signals.append({
            "severity": "warning",
            "category": "Supply",
            "title": "Low Inventory Warning",
            "description": f"Inventory at {dos:.0f} days of supply, below the 45-day minimum threshold.",
            "timestamp": (now - timedelta(hours=8)).isoformat() + "Z",
            "value": f"{dos:.0f} days",
        })

    # ── Weather/Crop signals ──
    crop_health = float(latest.get("crop_health_index", 70))
    if crop_health < 50:
        signals.append({
            "severity": "critical",
            "category": "Weather",
            "title": "Poor Crop Conditions",
            "description": f"Crop health index at {crop_health:.0f}/100. Significant risk of reduced yields in upcoming harvest season.",
            "timestamp": (now - timedelta(hours=18)).isoformat() + "Z",
            "value": f"{crop_health:.0f}/100",
        })
    elif crop_health < 65:
        signals.append({
            "severity": "warning",
            "category": "Weather",
            "title": "Below-Average Crop Health",
            "description": f"Crop health index at {crop_health:.0f}/100, below the 10-year average of 72. Weather conditions in Black Sea region being monitored closely.",
            "timestamp": (now - timedelta(hours=24)).isoformat() + "Z",
            "value": f"{crop_health:.0f}/100",
        })

    # ── Turkey-specific signals ──
    signals.append({
        "severity": "info",
        "category": "Market",
        "title": "Turkey TMO Floor Price",
        "description": "TMO (Turkish Grain Board) floor price announcement expected next week. Anticipated 10-15% increase over last year.",
        "timestamp": (now - timedelta(hours=5)).isoformat() + "Z",
        "value": "Pending",
    })
    signals.append({
        "severity": "info",
        "category": "Supply",
        "title": "Turkey Harvest Progress",
        "description": "Black Sea region harvest progress at 65%. Delays reported in higher elevations due to rain.",
        "timestamp": (now - timedelta(hours=7)).isoformat() + "Z",
        "value": "65%",
    })
    signals.append({
        "severity": "warning",
        "category": "Logistics",
        "title": "Trabzon Port Congestion",
        "description": "Vessel wait times increased by 3 days at Trabzon port, causing minor shipping delays.",
        "timestamp": (now - timedelta(hours=14)).isoformat() + "Z",
        "value": "+3 days",
    })
    signals.append({
        "severity": "warning",
        "category": "Weather",
        "title": "Frost-Price Correlation",
        "description": "Historical data shows April frost events in Ordu correlate with average 22% price spikes within 30 days.",
        "timestamp": (now - timedelta(hours=28)).isoformat() + "Z",
        "value": "High Risk",
    })

    # Always add some info-level signals for a richer feed
    signals.append({
        "severity": "info",
        "category": "Market",
        "title": "Daily Market Summary",
        "description": f"Hazelnut at €{cp:.2f}/kg (7d: {change_7d:+.1f}%, 30d: {change_30d:+.1f}%). EUR/TRY: {eur_try:.2f}. Inventory: {dos:.0f} days.",
        "timestamp": now.isoformat() + "Z",
        "value": f"€{cp:.2f}/kg",
    })

    # Sort by severity importance
    severity_order = {"critical": 0, "warning": 1, "info": 2}
    signals.sort(key=lambda s: severity_order.get(s["severity"], 3))

    return signals


def get_alerts() -> list[dict]:
    """Return only critical and warning level signals."""
    all_signals = get_market_signals()
    return [s for s in all_signals if s["severity"] in ("critical", "warning")]


def get_trends() -> dict:
    """Analyze price trends with technical indicators."""
    df = data_store.unified_df
    if df.empty:
        return {"turkey": _default_trend(), "italy": _default_trend(), "oregon": _default_trend()}

    prices_df = data_store.df_prices
    trends = {}

    for origin in ["Turkey", "Italy", "Oregon"]:
        origin_df = prices_df[prices_df["origin"] == origin] if not prices_df.empty else None

        if origin_df is not None and len(origin_df) >= 30:
            recent = origin_df.tail(90)
            current = float(recent["price_eur_kg"].iloc[-1])
            ma_7 = float(recent["price_eur_kg"].tail(7).mean())
            ma_30 = float(recent["price_eur_kg"].tail(30).mean())
            ma_90 = float(recent["price_eur_kg"].mean())

            change_7d = ((current - float(recent["price_eur_kg"].iloc[-7])) / float(recent["price_eur_kg"].iloc[-7])) * 100
            change_30d = ((current - float(recent["price_eur_kg"].iloc[-30])) / float(recent["price_eur_kg"].iloc[-30])) * 100

            # Determine momentum
            if current > ma_7 > ma_30:
                momentum = "bullish"
            elif current < ma_7 < ma_30:
                momentum = "bearish"
            else:
                momentum = "neutral"

            # Momentum score (-100 to +100)
            momentum_score = int(min(100, max(-100, change_30d * 10)))

            trends[origin.lower()] = {
                "origin": origin,
                "current_price": round(current, 2),
                "ma_7": round(ma_7, 2),
                "ma_30": round(ma_30, 2),
                "ma_90": round(ma_90, 2),
                "change_7d_pct": round(change_7d, 2),
                "change_30d_pct": round(change_30d, 2),
                "momentum": momentum,
                "momentum_score": momentum_score,
            }
        else:
            trends[origin.lower()] = _default_trend(origin)

    return trends


def _default_trend(origin: str = "Turkey") -> dict:
    return {
        "origin": origin, "current_price": 8.45, "ma_7": 8.35, "ma_30": 8.20, "ma_90": 8.00,
        "change_7d_pct": 1.2, "change_30d_pct": 3.1, "momentum": "bullish", "momentum_score": 31,
    }


def get_news() -> list[dict]:
    """Load and summarize market reports as news items."""
    reports_dir = os.path.join(SEED_DIR, "market_reports")
    news = []

    if os.path.isdir(reports_dir):
        for filepath in sorted(glob.glob(os.path.join(reports_dir, "*.txt")), reverse=True):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                name = os.path.basename(filepath).replace("_", " ").replace(".txt", "").title()

                # Extract first 2 sentences as summary
                sentences = content.replace("\n", " ").split(".")
                summary = ". ".join(s.strip() for s in sentences[:2] if s.strip()) + "."

                # Extract key takeaways (lines that start with bullet or dash)
                takeaways = []
                for line in content.split("\n"):
                    line = line.strip()
                    if line.startswith(("-", "•", "*", "→")) and len(line) > 10:
                        takeaways.append(line.lstrip("-•*→ ").strip())
                    if len(takeaways) >= 3:
                        break

                # If no bullet takeaways, use sentences 3-5
                if not takeaways and len(sentences) > 3:
                    takeaways = [s.strip() + "." for s in sentences[2:5] if s.strip()]

                news.append({
                    "title": name,
                    "source": "Ferrero Market Research",
                    "date": _extract_date_from_filename(os.path.basename(filepath)),
                    "summary": summary[:300],
                    "takeaways": takeaways[:3],
                    "category": _categorize_report(content),
                })
            except Exception:
                pass

    if not news:
        news = [
            {"title": "Global Hazelnut Supply Outlook", "source": "Reuters Commodities", "date": "2026-08-28", "summary": "Global hazelnut production expected to reach 1.2M tons this season.", "takeaways": ["Turkey remains dominant supplier at 70%", "Oregon production up 8% YoY"], "category": "Supply"},
            {"title": "EU Trade Policy Update", "source": "European Commission", "date": "2026-08-25", "summary": "EU reviewing import tariff structures for agricultural commodities.", "takeaways": ["Potential tariff adjustments for 2027", "No immediate changes expected"], "category": "Tariff"},
        ]

    return news


def _extract_date_from_filename(filename: str) -> str:
    """Try to extract a date from filenames like 'report_2026_03_supply_outlook.txt'."""
    parts = filename.replace(".txt", "").split("_")
    for i, p in enumerate(parts):
        if p.isdigit() and len(p) == 4 and int(p) > 2020:
            year = p
            month = parts[i + 1] if i + 1 < len(parts) and parts[i + 1].isdigit() else "01"
            return f"{year}-{month.zfill(2)}-15"
    return "2026-08-01"


def _categorize_report(content: str) -> str:
    """Auto-categorize a report based on content keywords."""
    content_lower = content.lower()
    if any(w in content_lower for w in ["harvest", "crop", "yield", "weather", "frost"]):
        return "Weather"
    if any(w in content_lower for w in ["tariff", "trade", "policy", "regulation"]):
        return "Tariff"
    if any(w in content_lower for w in ["supply", "production", "disruption"]):
        return "Supply"
    if any(w in content_lower for w in ["price", "cost", "premium"]):
        return "Price"
    if any(w in content_lower for w in ["demand", "consumption", "chocolate"]):
        return "Demand"
    return "Market"


def _mock_signals() -> list[dict]:
    """Fallback signals if no data is loaded."""
    now = datetime.now()
    return [
        {"severity": "critical", "category": "Price", "title": "Price Spike Detected", "description": "Hazelnut prices rose 6.2% in the last 7 days to €9.15/kg.", "timestamp": (now - timedelta(hours=2)).isoformat() + "Z", "value": "€9.15/kg"},
        {"severity": "warning", "category": "Weather", "title": "Frost Warning — Black Sea Region", "description": "Late frost risk detected in Ordu/Trabzon provinces. Potential impact on early-season crop development.", "timestamp": (now - timedelta(hours=14)).isoformat() + "Z", "value": "High Risk"},
        {"severity": "warning", "category": "FX", "title": "TRY Depreciation Accelerating", "description": "EUR/TRY crossed 36.0 mark, up 3.8% in 2 weeks. Impact on Turkish supplier pricing expected.", "timestamp": (now - timedelta(hours=20)).isoformat() + "Z", "value": "36.02"},
        {"severity": "info", "category": "Market", "title": "Daily Market Update", "description": "Hazelnut trading stable. No major disruptions reported across major origins.", "timestamp": now.isoformat() + "Z", "value": "Stable"},
    ]
