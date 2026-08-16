from fastapi import APIRouter
from src.app.api.v1.endpoints import auth, leads, users

# Main V1 API router linking individual modules
api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
