from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.orders import Order
from app.schemas.order import OrderResponse
from app.schemas.stats import VendorStats
from app.crud.orders import get_vendor_orders, get_vendor_stats

router = APIRouter()

@router.get("/me/stats", response_model=VendorStats)
def get_dashboard_stats(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Get vendor dashboard statistics including:
    - Total orders
    - Total revenue
    - Orders by status
    - Top selling products
    """
    if current_user.user_type != "vendor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access vendor dashboard"
        )
    
    return get_vendor_stats(db, vendor_id=current_user.id)

@router.get("/me/orders", response_model=List[OrderResponse])
def get_my_orders(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Get list of orders for the current vendor
    """
    if current_user.user_type != "vendor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access vendor orders"
        )
    
    orders = get_vendor_orders(db, vendor_id=current_user.id, skip=skip, limit=limit)
    return orders
