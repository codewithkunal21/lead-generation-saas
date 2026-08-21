import uuid
from typing import List, Optional
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.models.lead import Lead
from src.app.schemas.lead import LeadCreate, LeadUpdate

async def get_lead(db: AsyncSession, lead_id: uuid.UUID) -> Optional[Lead]:
    """Retrieve a single lead by its UUID."""
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    return result.scalar_one_or_none()

async def get_lead_by_name_and_address(
    db: AsyncSession, name: str, address: Optional[str]
) -> Optional[Lead]:
    """Query a lead by matching business name and address for deduplication."""
    if not address:
        result = await db.execute(
            select(Lead).where(and_(Lead.name == name, Lead.address.is_(None)))
        )
        return result.scalar_one_or_none()
    result = await db.execute(
        select(Lead).where(and_(Lead.name == name, Lead.address == address))
    )
    return result.scalar_one_or_none()

async def create_lead(db: AsyncSession, obj_in: LeadCreate) -> Lead:
    """Create a new lead if it does not already exist (deduplicated by name and address)."""
    existing = await get_lead_by_name_and_address(db, name=obj_in.name, address=obj_in.address)
    if existing:
        # Return existing to prevent duplicates
        return existing

    db_obj = Lead(
        query=obj_in.query,
        name=obj_in.name,
        phone=obj_in.phone,
        email=obj_in.email,
        website=obj_in.website,
        address=obj_in.address,
        rating=obj_in.rating,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get_leads(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> List[Lead]:
    """Retrieve a paginated list of leads ordered by creation time."""
    result = await db.execute(
        select(Lead)
        .order_by(Lead.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())

async def get_leads_by_query(
    db: AsyncSession, query: str, skip: int = 0, limit: int = 100
) -> List[Lead]:
    """Search paginated leads matching search query terms (case-insensitive)."""
    result = await db.execute(
        select(Lead)
        .where(Lead.query.ilike(f"%{query}%"))
        .order_by(Lead.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())
