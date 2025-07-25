from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.crud import crud_repeat_order
from app.schemas.repeat_order import (
    RepeatOrder,
    RepeatOrderCreate,
    RepeatOrderUpdate,
    DistanceFilter
)
from app.schemas.farmer import Farmer
from app.db.session import get_db
from app.api.deps import get_current_vendor

router = APIRouter()

@router.post("/", response_model=RepeatOrder)
def create_repeat_order(
    *,
    db: Session = Depends(get_db),
    order_in: RepeatOrderCreate,
    current_vendor = Depends(get_current_vendor)
):
    """
    Create new repeat order.
    """
    return crud_repeat_order.repeat_order.create_with_vendor(
        db=db,
        obj_in=order_in,
        vendor_id=current_vendor.id
    )

@router.get("/vendor", response_model=List[RepeatOrder])
def get_vendor_repeat_orders(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_vendor = Depends(get_current_vendor)
):
    """
    Get all repeat orders for current vendor.
    """
    return crud_repeat_order.repeat_order.get_vendor_orders(
        db=db,
        vendor_id=current_vendor.id,
        skip=skip,
        limit=limit
    )

@router.put("/{order_id}", response_model=RepeatOrder)
def update_repeat_order(
    *,
    db: Session = Depends(get_db),
    order_id: int,
    order_in: RepeatOrderUpdate,
    current_vendor = Depends(get_current_vendor)
):
    """
    Update repeat order.
    """
    order = crud_repeat_order.repeat_order.get(db=db, id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.vendor_id != current_vendor.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud_repeat_order.repeat_order.update(
        db=db,
        db_obj=order,
        obj_in=order_in
    )

@router.post("/farmers/distance", response_model=List[Farmer])
def get_farmers_by_distance(
    *,
    db: Session = Depends(get_db),
    filter_data: DistanceFilter,
    current_vendor = Depends(get_current_vendor),
    skip: int = 0,
    limit: int = 100
):
    """
    Get farmers within specified distance.
    """
    return crud_repeat_order.repeat_order.get_farmers_by_distance(
        db=db,
        latitude=filter_data.latitude,
        longitude=filter_data.longitude,
        max_distance=filter_data.max_distance,
        skip=skip,
        limit=limit
    )
