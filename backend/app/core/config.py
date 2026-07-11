from typing import List, Union, Any
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "VisionKirana"
    API_V1_STR: str = "/api/v1"
    
    # --- Secrets & Core Config (Strictly loaded from .env) ---
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    ML_API_BASE_URL: str
    FRONTEND_URL: str
    FIREBASE_CREDENTIALS_PATH: str = "backend/firebase-adminsdk.json"
    # ---------------------------------------------------------
    
    # We default to empty list, but the validator will automatically append FRONTEND_URL to it!
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] | List[str] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]], values: dict[str, Any]) -> Union[List[str], str]:
        origins = []
        if isinstance(v, str) and not v.startswith("["):
            origins = [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            origins = v
            
        frontend_url = values.get("FRONTEND_URL")
        if frontend_url and frontend_url not in origins:
            origins.append(frontend_url)
            
        return origins

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
