from fastapi import APIRouter
from pydantic import BaseModel
from app.services import scenario_engine

router = APIRouter()

class ScenarioParams(BaseModel):
    tariff_change_pct: float = 0
    fx_rate_change_pct: float = 0
    supply_disruption_pct: float = 0
    demand_change_pct: float = 0
    logistics_cost_change_pct: float = 0
    weather_impact_pct: float = 0
    inventory_change_pct: float = 0

@router.post("/simulate")
def simulate_scenario(params: ScenarioParams):
    return scenario_engine.run_scenario(params.dict())

@router.get("/presets")
def get_presets():
    return scenario_engine.get_presets()

@router.post("/compare")
def compare_scenarios(scenarios: list[ScenarioParams]):
    results = [scenario_engine.run_scenario(s.dict()) for s in scenarios]
    return {"comparisons": results}
