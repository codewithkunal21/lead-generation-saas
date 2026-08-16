import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class LeadBase(BaseModel):
    query: str = Field(..., min_length=1, max_length=255)
    name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=512)
    address: Optional[str] = Field(None, max_length=512)
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    query: Optional[str] = Field(None, min_length=1, max_length=255)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=512)
    address: Optional[str] = Field(None, max_length=512)
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)

class LeadResponse(LeadBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
