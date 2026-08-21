from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column
from src.app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """User database model representing a registered user/admin in the SaaS system."""
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    username: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    full_name: Mapped[str | None] = mapped_column(
        String(255), default=None, nullable=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true", nullable=False
    )
    is_superuser: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )
