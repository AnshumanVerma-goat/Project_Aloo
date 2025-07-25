from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict
from app.models.orders import Order
from app.models.order_items import OrderItem
from app.models.product import Product

def get_vendor_orders(db: Session, vendor_id: int, skip: int = 0, limit: int = 10) -> List[Order]:
    return db.query(Order)\
        .join(OrderItem)\
        .join(Product)\
        .filter(Product.vendor_id == vendor_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_vendor_stats(db: Session, vendor_id: int):
    # Get total orders and revenue
    order_stats = db.query(
        func.count(Order.id).label('total_orders'),
        func.sum(Order.total_amount).label('total_revenue')
    )\
    .join(OrderItem)\
    .join(Product)\
    .filter(Product.vendor_id == vendor_id)\
    .first()

    # Get orders by status
    orders_by_status = db.query(
        Order.status,
        func.count(Order.id)
    )\
    .join(OrderItem)\
    .join(Product)\
    .filter(Product.vendor_id == vendor_id)\
    .group_by(Order.status)\
    .all()

    # Get top selling products
    top_products = db.query(
        Product.id,
        Product.name,
        func.sum(OrderItem.quantity).label('total_quantity'),
        func.sum(OrderItem.price * OrderItem.quantity).label('total_revenue')
    )\
    .join(OrderItem)\
    .filter(Product.vendor_id == vendor_id)\
    .group_by(Product.id, Product.name)\
    .order_by(func.sum(OrderItem.quantity).desc())\
    .limit(5)\
    .all()

    # Get revenue by day for the last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    daily_revenue = db.query(
        func.date(Order.created_at),
        func.sum(Order.total_amount)
    )\
    .join(OrderItem)\
    .join(Product)\
    .filter(
        Product.vendor_id == vendor_id,
        Order.created_at >= seven_days_ago
    )\
    .group_by(func.date(Order.created_at))\
    .all()

    return {
        "total_orders": order_stats[0] if order_stats else 0,
        "total_revenue": float(order_stats[1]) if order_stats[1] else 0.0,
        "orders_by_status": {status: count for status, count in orders_by_status},
        "top_products": [
            {
                "product_id": p_id,
                "product_name": name,
                "total_quantity": int(quantity),
                "total_revenue": float(revenue)
            }
            for p_id, name, quantity, revenue in top_products
        ],
        "revenue_by_day": {
            date.strftime("%Y-%m-%d"): float(amount)
            for date, amount in daily_revenue
        }
    }
