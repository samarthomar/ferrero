from fastapi import APIRouter
from app.services import market_intel

router = APIRouter()


@router.get("/signals")
def get_signals():
    return market_intel.get_market_signals()


@router.get("/alerts")
def get_alerts():
    return market_intel.get_alerts()


@router.get("/news")
def get_news():
    return market_intel.get_news()


@router.get("/trends")
def get_trends():
    return market_intel.get_trends()
