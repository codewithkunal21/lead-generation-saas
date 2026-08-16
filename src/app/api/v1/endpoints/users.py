import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.api.deps import get_current_active_superuser, get_current_active_user, get_db
from src.app.models.user import User
from src.app.schemas.user import UserResponse

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Retrieve the profile details of the currently authenticated active user."""
    return current_user

@router.get("/", response_model=List[UserResponse])
async def read_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
    skip: int = 0,
    limit: int = 100,
) -> List[User]:
    """Retrieve list of users (Admin only privilege)."""
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return list(users)
