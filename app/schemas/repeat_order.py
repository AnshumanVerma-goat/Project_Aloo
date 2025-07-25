from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional

class RepeatOrderBase(BaseModel):
    product_id: int
    quantity: float
    frequency: str  # daily, weekly, monthly
    next_delivery_date: datetime

    @validator('frequency')
    def validate_frequency(cls, v):
        if v not in ['daily', 'weekly', 'monthly']:
            raise ValueError('Frequency must be daily, weekly, or monthly')
        return v

class RepeatOrderCreate(RepeatOrderBase):
    farmer_id: int

class RepeatOrderUpdate(BaseModel):
    quantity: Optional[float] = None
    frequency: Optional[str] = None
    next_delivery_date: Optional[datetime] = None
    status: Optional[str] = None

    @validator('status')
    def validate_status(cls, v):
        if v not in ['active', 'paused', 'cancelled']:
            raise ValueError('Status must be active, paused, or cancelled')
        return v

class RepeatOrder(RepeatOrderBase):
    id: int
    vendor_id: int
    farmer_id: int
    status: str
    created_at: datetime

    class Config:
        orm_mode = True

class DistanceFilter(BaseModel):
    latitude: float
    longitude: float
    max_distance: float  # in kilometers
