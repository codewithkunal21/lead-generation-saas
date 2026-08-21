import uuid
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.api.deps import get_current_active_user, get_db
from src.app.crud import lead as crud_lead
from src.app.models.user import User
from src.app.schemas.lead import LeadResponse
from src.app.services.scraper.google_maps_scraper import GoogleMapsScraper
from src.app.services.scraper.google_search_scraper import GoogleSearchScraper

router = APIRouter()

@router.post("/scrape", response_model=List[LeadResponse], status_code=status.HTTP_201_CREATED)
async def scrape_leads(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    query: str = Query(..., description="Search query terms, e.g. 'Gym Delhi'"),
    engine: str = Query("maps", description="Scraper engine to run: 'maps', 'search', or 'all'"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of items to scrape per engine"),
) -> Any:
    """Trigger local scraper pipelines to fetch business listings, deduplicate, and record leads."""
    if engine not in ["maps", "search", "all"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scraper engine specified. Choose from 'maps', 'search', or 'all'."
        )

    scraped_data = []

    try:
        # Run Google Maps Scraper Pipeline
        if engine in ["maps", "all"]:
            maps_scraper = GoogleMapsScraper()
            maps_results = await maps_scraper.scrape(query=query, limit=limit)
            scraped_data.extend(maps_results)

        # Run Google Search Website Crawler Pipeline
        if engine in ["search", "all"]:
            search_scraper = GoogleSearchScraper()
            search_results = await search_scraper.scrape(query=query, limit=limit)
            scraped_data.extend(search_results)

        # Commit scraped results to PostgreSQL and verify duplicates
        saved_leads = []
        for lead_in in scraped_data:
            lead = await crud_lead.create_lead(db, obj_in=lead_in)
            saved_leads.append(lead)

        return saved_leads

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scraper execution error encountered: {str(e)}"
        )

@router.get("/", response_model=List[LeadResponse])
async def read_leads(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    query: Optional[str] = Query(None, description="Filter leads by matching query terms"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """Retrieve paginated scraped leads list, optionally filtered by query terms."""
    if query:
        return await crud_lead.get_leads_by_query(db, query=query, skip=skip, limit=limit)
    return await crud_lead.get_leads(db, skip=skip, limit=limit)

@router.get("/{lead_id}", response_model=LeadResponse)
async def read_lead(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    lead_id: uuid.UUID,
) -> Any:
    """Retrieve details of a single lead by its UUID."""
    lead = await crud_lead.get_lead(db, lead_id=lead_id)
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    return lead
