from fastapi import APIRouter
from pydantic import BaseModel
from app.services import ai_advisor

router = APIRouter()


class AdvisorQuery(BaseModel):
    query: str


@router.post("/recommend")
async def get_recommendation(query: AdvisorQuery):
    return await ai_advisor.get_recommendation(query.query)


@router.get("/risks")
def get_risks():
    return ai_advisor.get_current_risks()


@router.get("/quick-actions")
def get_quick_actions():
    return ai_advisor.get_quick_actions()
