from sqlalchemy import Float, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from src.app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class Lead(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Lead database model representing a scraped business lead."""
    __tablename__ = "leads"

    query: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), default=None, nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), default=None, nullable=True)
    website: Mapped[str | None] = mapped_column(String(512), default=None, nullable=True)
    address: Mapped[str | None] = mapped_column(String(512), default=None, nullable=True)
    rating: Mapped[float | None] = mapped_column(Float, default=None, nullable=True)

    __table_args__ = (
        # Ensure we don't store duplicate leads for the same business name at the same address
        UniqueConstraint("name", "address", name="uq_lead_name_address"),
    )
