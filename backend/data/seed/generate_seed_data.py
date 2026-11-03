import os
import json
import csv
import math
import numpy as np
from datetime import datetime, timedelta

SEED_DIR = r"c:\Users\samar\OneDrive\Desktop\Ferrero\backend\data\seed"
REPORTS_DIR = os.path.join(SEED_DIR, "market_reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

np.random.seed(42)

start_date = datetime(2024, 1, 1)
end_date = datetime(2026, 8, 31)
num_days = (end_date - start_date).days + 1
dates = [start_date + timedelta(days=i) for i in range(num_days)]

# Helper for seasonality
def get_seasonality(date, is_price=True):
    month = date.month
    if is_price:
        # Prices DIP after harvest (Sep-Nov), RISE before harvest (Apr-Jul)
        if month in [9, 10, 11]:
            return -0.4
        elif month in [4, 5, 6, 7]:
            return 0.4
        return 0.0
    return 0.0

# Exchange rates & Prices
exchange_rates = []
hazelnut_prices = []

# EUR/TRY progression roughly:
# Jan 2024: 32, End 2024 (day 365): 36, Mid 2025 (day 545): 39, Mid 2026 (day 910): 42
def get_eur_try(day_index):
    if day_index <= 365:
        return 32 + (4 * (day_index / 365))
    elif day_index <= 545:
        return 36 + (3 * ((day_index - 365) / 180))
    else:
        return 39 + (3 * ((day_index - 545) / 365))

def get_eur_usd():
    return np.random.uniform(1.05, 1.12)

turkey_base = 7.0
italy_base = 8.0
oregon_base = 7.5

for i, date in enumerate(dates):
    eur_usd = get_eur_usd()
    eur_try = get_eur_try(i) + np.random.normal(0, 0.1)
    
    exchange_rates.append({
        "date": date.strftime("%Y-%m-%d"),
        "eur_usd": round(eur_usd, 4),
        "eur_try": round(eur_try, 4)
    })
    
    # Prices
    turkey_price = turkey_base + get_seasonality(date) + np.random.normal(0, 0.1)
    italy_price = italy_base + get_seasonality(date) + np.random.normal(0, 0.1)
    oregon_price = oregon_base + get_seasonality(date) + np.random.normal(0, 0.1)
    
    # Frost in Turkey, April 2025: +35% spike
    if date >= datetime(2025, 4, 1):
        turkey_price *= 1.35
        italy_price *= 1.15
        oregon_price *= 1.10
        
    turkey_price = max(6.0, min(9.5, turkey_price))
    italy_price = max(6.0, min(9.5, italy_price))
    oregon_price = max(6.0, min(9.5, oregon_price))
    
    # Volumes
    vol_turkey = 700000 / 365
    if date.year == 2025:
        vol_turkey = 500000 / 365
    vol_italy = 95000 / 365
    vol_oregon = 50000 / 365
    
    for origin, p, v in [("Turkey", turkey_price, vol_turkey), ("Italy", italy_price, vol_italy), ("Oregon", oregon_price, vol_oregon)]:
        hazelnut_prices.append({
            "date": date.strftime("%Y-%m-%d"),
            "origin": origin,
            "price_eur_kg": round(p, 2),
            "price_usd_kg": round(p * eur_usd, 2),
            "volume_tons": int(v + np.random.normal(0, v*0.1))
        })

with open(os.path.join(SEED_DIR, "exchange_rates.csv"), "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["date", "eur_usd", "eur_try"])
    writer.writeheader()
    writer.writerows(exchange_rates)

with open(os.path.join(SEED_DIR, "hazelnut_prices.csv"), "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["date", "origin", "price_eur_kg", "price_usd_kg", "volume_tons"])
    writer.writeheader()
    writer.writerows(hazelnut_prices)


# 3. Tariffs
tariffs = [
    {
        "origin_country": "Turkey",
        "destination_region": "EU",
        "effective_date": "2024-01-01",
        "rate_percent": 3.2,
        "notes": "Standard import tariff"
    },
    {
        "origin_country": "USA",
        "destination_region": "EU",
        "effective_date": "2024-01-01",
        "rate_percent": 5.1,
        "notes": "Standard import tariff"
    },
    {
        "origin_country": "USA",
        "destination_region": "EU",
        "effective_date": "2025-01-01",
        "rate_percent": 3.2,
        "notes": "Reduced rate post-negotiation"
    }
]
with open(os.path.join(SEED_DIR, "tariffs.json"), "w") as f:
    json.dump(tariffs, f, indent=4)


# 4. Supplier Contracts
contracts = [
    {"supplier_id": "SUP-001", "supplier_name": "Olam Hazelnut", "origin_country": "Turkey", "contract_start": "2024-01-01", "contract_end": "2025-12-31", "price_per_kg_eur": 6.50, "volume_tons": 50000, "min_volume": 40000, "max_volume": 60000, "quality_grade": "Premium 11-13mm", "payment_terms": "Net 60", "delivery_terms": "FOB Istanbul", "status": "Active"},
    {"supplier_id": "SUP-002", "supplier_name": "Balsu Gıda", "origin_country": "Turkey", "contract_start": "2024-01-01", "contract_end": "2025-12-31", "price_per_kg_eur": 6.80, "volume_tons": 45000, "min_volume": 40000, "max_volume": 50000, "quality_grade": "Standard 13-15mm", "payment_terms": "Net 30", "delivery_terms": "CIF Genoa", "status": "Active"},
    {"supplier_id": "SUP-003", "supplier_name": "Progıda", "origin_country": "Turkey", "contract_start": "2024-06-01", "contract_end": "2026-05-31", "price_per_kg_eur": 7.10, "volume_tons": 30000, "min_volume": 25000, "max_volume": 35000, "quality_grade": "Premium 13-15mm", "payment_terms": "Net 45", "delivery_terms": "FOB Trabzon", "status": "Active"},
    {"supplier_id": "SUP-004", "supplier_name": "Özstar", "origin_country": "Turkey", "contract_start": "2024-01-01", "contract_end": "2026-12-31", "price_per_kg_eur": 6.90, "volume_tons": 25000, "min_volume": 20000, "max_volume": 30000, "quality_grade": "Standard 11-13mm", "payment_terms": "Net 30", "delivery_terms": "FOB Ordu", "status": "Active"},
    {"supplier_id": "SUP-005", "supplier_name": "Sagra", "origin_country": "Turkey", "contract_start": "2024-09-01", "contract_end": "2026-08-31", "price_per_kg_eur": 7.00, "volume_tons": 20000, "min_volume": 15000, "max_volume": 25000, "quality_grade": "Premium", "payment_terms": "Net 60", "delivery_terms": "FOB Istanbul", "status": "Active"},
    {"supplier_id": "SUP-006", "supplier_name": "Ferrero Agrifarming", "origin_country": "Italy", "contract_start": "2024-01-01", "contract_end": "2029-12-31", "price_per_kg_eur": 7.50, "volume_tons": 40000, "min_volume": 35000, "max_volume": 45000, "quality_grade": "Tonda Gentile", "payment_terms": "Intercompany", "delivery_terms": "EXW Alba", "status": "Active"},
    {"supplier_id": "SUP-007", "supplier_name": "Oregon Hazelnut Co", "origin_country": "USA", "contract_start": "2025-01-01", "contract_end": "2026-12-31", "price_per_kg_eur": 7.20, "volume_tons": 20000, "min_volume": 15000, "max_volume": 25000, "quality_grade": "Barcelona", "payment_terms": "Net 45", "delivery_terms": "FOB Portland", "status": "Active"}
]
with open(os.path.join(SEED_DIR, "supplier_contracts.json"), "w") as f:
    json.dump(contracts, f, indent=4)


# 5. Demand Forecasts
months = []
d = datetime(2024, 1, 1)
while d <= datetime(2026, 12, 1):
    months.append(d.strftime("%Y-%m"))
    d_month = d.month + 1
    d_year = d.year
    if d_month > 12:
        d_month = 1
        d_year += 1
    d = datetime(d_year, d_month, 1)

demand_data = []
for m in months:
    dt = datetime.strptime(m, "%Y-%m")
    # Base ~21K/month. Seasonality: peaks in Oct-Nov (higher demand for holidays)
    base = 21000
    if dt.month in [10, 11, 12]:
        base = 25000
    elif dt.month in [6, 7, 8]:
        base = 17000
        
    forecast = int(base * np.random.uniform(0.95, 1.05))
    actual = int(forecast * np.random.uniform(0.95, 1.05)) if dt <= datetime(2026, 8, 1) else None
    
    demand_data.append({
        "month": m,
        "product_line": "Total",
        "forecast_tons": forecast,
        "actual_tons": actual if actual is not None else ""
    })

with open(os.path.join(SEED_DIR, "demand_forecasts.csv"), "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["month", "product_line", "forecast_tons", "actual_tons"])
    writer.writeheader()
    writer.writerows(demand_data)


# 6. Inventory Levels
inventory_data = []
d = datetime(2024, 1, 1)
while d <= datetime(2026, 8, 31):
    if d.weekday() == 0:
        for wh in ["Ordu", "Alba", "Frankfurt"]:
            # Safety stock: 45-60 days. Daily consumption ~685 tonnes across network.
            # Say network target is 685 * 50 = ~34,250 tons total
            # Distribute: Ordu 15000, Alba 12000, Frankfurt 7250
            if wh == "Ordu": cap = 20000; qty = np.random.uniform(12000, 18000)
            elif wh == "Alba": cap = 15000; qty = np.random.uniform(9000, 14000)
            else: cap = 10000; qty = np.random.uniform(5000, 9000)
            
            days = int(qty / (685 / 3)) # rough estimate per wh
            
            inventory_data.append({
                "week_start": d.strftime("%Y-%m-%d"),
                "warehouse": wh,
                "quantity_tons": int(qty),
                "capacity_tons": cap,
                "days_of_supply": days
            })
    d += timedelta(days=1)

with open(os.path.join(SEED_DIR, "inventory_levels.csv"), "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["week_start", "warehouse", "quantity_tons", "capacity_tons", "days_of_supply"])
    writer.writeheader()
    writer.writerows(inventory_data)


# 7. Logistics Costs
logistics_data = []
routes = [
    ("Turkey_to_Italy", 80, 10, "sea"),
    ("Turkey_to_Germany", 100, 14, "sea"),
    ("Oregon_to_Germany", 250, 28, "sea")
]
for m in months:
    dt = datetime.strptime(m, "%Y-%m")
    if dt > datetime(2026, 8, 31): continue
    for r, base_cost, transit, mode in routes:
        logistics_data.append({
            "month": m,
            "route": r,
            "cost_per_ton_eur": round(base_cost * np.random.uniform(0.95, 1.05), 2),
            "transit_days": int(transit + np.random.normal(0, 1)),
            "mode": mode
        })

with open(os.path.join(SEED_DIR, "logistics_costs.csv"), "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["month", "route", "cost_per_ton_eur", "transit_days", "mode"])
    writer.writeheader()
    writer.writerows(logistics_data)


# 8. Weather Crop Data
weather_data = []
for m in months:
    dt = datetime.strptime(m, "%Y-%m")
    if dt > datetime(2026, 8, 31): continue
    
    regions = ["Turkey", "Italy", "Oregon"]
    for reg in regions:
        # Base values
        temp = 15 + math.sin((dt.month - 4) * (2 * math.pi / 12)) * 10 + np.random.normal(0, 2)
        rain = 80 + math.cos((dt.month - 1) * (2 * math.pi / 12)) * 30 + np.random.normal(0, 15)
        chilling = np.random.uniform(100, 1500) if dt.month in [11,12,1,2] else 0
        
        health = np.random.uniform(70, 85)
        frost = 0
        
        if reg == "Turkey" and dt.year == 2025 and dt.month == 4:
            frost = 1
            health = np.random.uniform(35, 45) # Frost impact
        elif reg == "Turkey" and dt.year == 2025 and dt.month > 4:
            health = np.random.uniform(35, 45) # sustained low health
        
        yield_f = (health / 100) * 1.5
        
        weather_data.append({
            "month": m,
            "region": reg,
            "chilling_hours": int(chilling),
            "frost_events": frost,
            "min_temp_c": round(temp - 5, 1),
            "max_temp_c": round(temp + 5, 1),
            "avg_temp_c": round(temp, 1),
            "rainfall_mm": int(max(0, rain)),
            "crop_health_index": int(health),
            "yield_forecast_tons_per_hectare": round(yield_f, 2)
        })

with open(os.path.join(SEED_DIR, "weather_crop_data.csv"), "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["month", "region", "chilling_hours", "frost_events", "min_temp_c", "max_temp_c", "avg_temp_c", "rainfall_mm", "crop_health_index", "yield_forecast_tons_per_hectare"])
    writer.writeheader()
    writer.writerows(weather_data)


# 9. Macro Indicators
macro_data = []
for m in months:
    dt = datetime.strptime(m, "%Y-%m")
    if dt > datetime(2026, 8, 31): continue
    
    cpi = np.random.uniform(40, 70)
    gdp = np.random.uniform(3, 5)
    
    macro_data.append({"month": m, "indicator": "Turkey_CPI", "value": round(cpi, 1)})
    macro_data.append({"month": m, "indicator": "Turkey_GDP_Growth", "value": round(gdp, 1)})

with open(os.path.join(SEED_DIR, "macro_indicators.csv"), "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["month", "indicator", "value"])
    writer.writeheader()
    writer.writerows(macro_data)


# 10. Market Reports
reports = {
    "report_2024_08_turkish_harvest_outlook.txt": "August 2024: Turkey harvest looks promising, expected to hit normal 700K tonnes.",
    "report_2024_11_post_harvest_analysis.txt": "November 2024: Post-harvest prices dipped as expected. Procurement volume is steady.",
    "report_2025_01_seasonal_buying_strategy.txt": "January 2025: Advising early buys to beat the pre-harvest price increases.",
    "report_2025_04_turkey_frost_crisis.txt": "CRITICAL: April 2025. Severe frost has destroyed an estimated 50% of the Turkish hazelnut crop. Prices have spiked dramatically by 35% across the board. The expected 700K ton yield will likely plummet to 450K-609K tons. We need to secure remaining stocks globally.",
    "report_2025_07_supply_outlook_post_frost.txt": "July 2025: The market is still reeling from the April frost. Prices remain at historic highs near 9 EUR/kg.",
    "report_2025_10_global_market_update.txt": "October 2025: With Turkey's low yield confirmed around 550K tons, Italian and US crops are heavily relied upon.",
    "report_2026_03_2026_crop_outlook.txt": "March 2026: Early signs show the 2026 crop in Turkey is recovering. Prices stabilizing.",
    "report_2026_08_harvest_progress.txt": "August 2026: Harvesting underway. Volumes look back to normal."
}

for filename, content in reports.items():
    with open(os.path.join(REPORTS_DIR, filename), "w") as f:
        f.write(content)

print("Seed data generation complete.")
