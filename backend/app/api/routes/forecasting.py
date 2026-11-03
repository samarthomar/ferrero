from fastapi import APIRouter
from app.services import forecasting

router = APIRouter()

@router.get("/prices")
def get_prices_forecast(origin: str = "Turkey", horizon: int = 30):
    return forecasting.predict_prices(horizon)

@router.get("/costs")
def get_costs_forecast():
    prices = forecasting.predict_prices(30)
    # Simple derivation for demo
    costs = [p * 1000 for p in prices.get("forecast", [])]
    return {"cost_forecast": costs}

@router.get("/feature-importance")
def get_feature_importance():
    return forecasting.get_feature_importance()
