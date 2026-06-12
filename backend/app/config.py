import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv(override=True)

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Correm Bank Statement Analyzer"
    ENV: str = os.getenv("ENV", "development")
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # MongoDB Config
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "correm_analyzer")
    
    # Security/Auth Settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_correm_statement_analyzer_2026_jwt_token_key")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Local Upload Config
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    
    # OCR Config (Tesseract & Poppler paths for Windows environments)
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "")
    POPPLER_PATH: str = os.getenv("POPPLER_PATH", "")

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure local upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
