from fastapi import APIRouter
from app.services import weather_intel

router = APIRouter()

@router.get("/conditions")
def get_conditions():
    return weather_intel.get_current_conditions()

@router.get("/timeline")
def get_timeline():
    return weather_intel.get_weather_timeline()

@router.get("/frost-risk")
def get_frost_risk():
    return weather_intel.get_frost_risk_assessment()

@router.get("/harvest-calendar")
def get_harvest_calendar():
    return weather_intel.get_harvest_calendar()
