from fastapi import APIRouter
from app.services import unified_view

router = APIRouter()

@router.get("/unified")
def get_unified():
    return unified_view.get_unified_view()

@router.get("/kpis")
def get_kpis():
    return unified_view.get_kpis()

@router.get("/price-history")
def get_price_history(origin: str = None):
    return unified_view.get_price_history(origin)

@router.get("/risk-scores")
def get_risk_scores():
    return unified_view.get_risk_scores()
