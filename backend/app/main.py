import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.db import connect_db, close_db
from app.routes import auth, statements, analytics, export

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Database Connection
    logger.info("Initializing application startup...")
    await connect_db()
    yield
    # Shutdown Database Connection
    logger.info("Cleaning up application resources...")
    await close_db()

app = FastAPI(
    title=settings.APP_NAME,
    description="FastAPI Backend for HDFC Bank Statement Analyzer with OCR & Categorization",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
# In production, specify exact domains. Using list of origins for development/production flexibility.
origins = [
    "http://localhost:5173",  # Local Vite React Dev
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routes
app.include_router(auth.router, prefix="/api")
app.include_router(statements.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(export.router, prefix="/api")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "env": settings.ENV
    }
