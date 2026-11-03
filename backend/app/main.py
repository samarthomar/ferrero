from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import dashboard, forecasting, scenarios, advisor, market, weather
from app.data.loader import data_store
from app.data.vector_store import vector_store

app = FastAPI(title="Ferrero Commodity Intelligence API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("Starting up Ferrero AI Backend...")
    data_store.load_all_data()
    vector_store.initialize()

# Include routers
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(forecasting.router, prefix="/api/forecast", tags=["forecasting"])
app.include_router(scenarios.router, prefix="/api/scenarios", tags=["scenarios"])
app.include_router(advisor.router, prefix="/api/advisor", tags=["advisor"])
app.include_router(market.router, prefix="/api/market", tags=["market"])
app.include_router(weather.router, prefix='/api/weather', tags=['weather'])

@app.get("/health")
def health_check():
    return {"status": "ok"}
