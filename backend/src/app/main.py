import importlib
import sys

# Support imports when Vercel loads this module as backend.src.app.main.
if __package__.startswith("backend."):
    sys.modules.setdefault("src", importlib.import_module("backend.src"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.app.core.config import settings

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    # Disable OpenAPI schema docs in production if preferred for security
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.ENVIRONMENT != "production" else None,
)

# Enable CORS using settings configured origins and local development regex fallback
allowed_origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS] if settings.BACKEND_CORS_ORIGINS else []
allowed_origins.append("https://lead-generation-saas-kzzm.vercel.app")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root status endpoint
@app.get("/")
async def root():
    return {"message": "FastAPI SaaS Backend is running"}

# Healthcheck endpoint (used by Docker and Orchestrators)
@app.get("/health", status_code=200)
async def health():
    return {"status": "healthy"}

# Include API Router dynamically to keep app runnable during incremental building
try:
    from src.app.api.v1.api import api_router
    app.include_router(api_router, prefix=settings.API_V1_STR)
except ImportError:
    pass
