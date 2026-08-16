import uuid
from typing import Optional
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.core.security import get_password_hash, verify_password
from src.app.models.user import User
from src.app.schemas.user import UserCreate, UserUpdate

async def get_user(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    """Retrieve a user by their UUID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Retrieve a user by their email address."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Retrieve a user by their username."""
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, obj_in: UserCreate) -> User:
    """Create a new user with hashed password in the database."""
    db_obj = User(
        email=obj_in.email,
        username=obj_in.username,
        hashed_password=get_password_hash(obj_in.password),
        full_name=obj_in.full_name,
        is_active=True,
        is_superuser=False,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def authenticate_user(
    db: AsyncSession, username_or_email: str, password: str
) -> Optional[User]:
    """Authenticate a user by matching their username/email and verifying the password."""
    result = await db.execute(
        select(User).where(
            or_(
                User.username == username_or_email,
                User.email == username_or_email,
            )
        )
    )
    user = result.scalar_one_or_none()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
