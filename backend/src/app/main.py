from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.app.core.config import settings

# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="LeadPulse — Lead Generation & Business Scraping SaaS API",
    # OpenAPI docs available in all environments; restrict via reverse proxy if needed
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# ---------------------------------------------------------------------------
# CORS Middleware
# All allowed origins come exclusively from the BACKEND_CORS_ORIGINS env var.
# localhost origins are allowed via regex for local development.
# DO NOT hardcode Vercel preview URLs here — change BACKEND_CORS_ORIGINS instead.
# ---------------------------------------------------------------------------
allowed_origins = [
    str(origin).rstrip("/")
    for origin in settings.BACKEND_CORS_ORIGINS
    if origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # Also allow any localhost / 127.0.0.1 origin for local development
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Content-Disposition"],
    max_age=600,
)

# ---------------------------------------------------------------------------
# Root / health endpoints (unauthenticated)
# ---------------------------------------------------------------------------

@app.get("/", tags=["status"])
async def root():
    """Service liveness indicator."""
    return {
        "service": settings.PROJECT_NAME,
        "status": "running",
        "version": "1.0.0",
        "docs": f"{settings.API_V1_STR}/docs",
    }


@app.get("/health", status_code=200, tags=["status"])
async def health():
    """Health check endpoint — used by Docker, Render, Railway, and load balancers."""
    return {"status": "healthy"}


# ---------------------------------------------------------------------------
# API Router — V1
# ---------------------------------------------------------------------------
from src.app.api.v1.api import api_router  # noqa: E402
app.include_router(api_router, prefix=settings.API_V1_STR)
