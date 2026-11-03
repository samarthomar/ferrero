"""
Procurement Calculation Engine
Documented formulas for all major procurement KPIs per BRD Section 8.
"""

def landed_cost(base_price_eur_kg: float, tariff_pct: float, logistics_eur_kg: float, fx_adjustment: float = 0.0) -> float:
    """Calculate total landed cost per kg."""
    return base_price_eur_kg * (1 + tariff_pct/100) + logistics_eur_kg + fx_adjustment

def procurement_exposure(contracts: list) -> float:
    """Total open-to-buy exposure in EUR."""
    # Volume in tons * 1000 = kg, multiplied by price per kg
    return sum(c.get('volume_tons', 0) * 1000 * c.get('price_per_kg_eur', 0) for c in contracts if c.get('status') == 'active')

def margin_on_sale(sell_price_eur_kg: float, landed_cost_eur_kg: float) -> float:
    """Margin percentage when selling processed hazelnuts B2B."""
    if sell_price_eur_kg <= 0:
        return 0.0
    return ((sell_price_eur_kg - landed_cost_eur_kg) / sell_price_eur_kg) * 100

def days_of_supply(total_inventory_tons: float, daily_consumption_tons: float) -> float:
    """Calculate remaining inventory duration."""
    if daily_consumption_tons <= 0:
        return 0.0
    return total_inventory_tons / daily_consumption_tons

def contract_coverage_pct(contracted_volume_tons: float, annual_demand_tons: float) -> float:
    """Percentage of annual demand covered by active contracts."""
    if annual_demand_tons <= 0:
        return 0.0
    return (contracted_volume_tons / annual_demand_tons) * 100
