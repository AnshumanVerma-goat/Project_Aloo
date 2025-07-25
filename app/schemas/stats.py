from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime

class TopProduct(BaseModel):
    product_id: int
    product_name: str
    total_quantity: int
    total_revenue: float

class VendorStats(BaseModel):
    total_orders: int
    total_revenue: float
    orders_by_status: Dict[str, int]
    top_products: List[TopProduct]
    revenue_by_day: Dict[str, float]

    class Config:
        orm_mode = True
