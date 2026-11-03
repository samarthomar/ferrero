import os
from pydantic import BaseModel


class Settings(BaseModel):
    PROJECT_NAME: str = "Ferrero Commodity Intelligence"
    API_V1_STR: str = "/api"
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "seed")

    # Ollama Cloud API
    OLLAMA_CLOUD_URL: str = os.getenv("OLLAMA_CLOUD_URL", "https://ollama.com/api")
    OLLAMA_API_KEY: str = os.getenv("OLLAMA_API_KEY", "7088ebb46ff148049ee0d0d879fc2fcf.YgUWWeAeVxHk4SyfHKzYX79E")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "gemma2:27b")

    # Feature flags
    USE_LLM: bool = True
    USE_ML_MODELS: bool = True


settings = Settings()
