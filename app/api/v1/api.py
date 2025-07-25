from fastapi import APIRouter
from app.api.v1.endpoints import auth, farmers, vendors, products, reviews, orders, repeat_orders, cart, websocket

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(farmers.router, prefix="/farmers", tags=["farmers"])
api_router.include_router(vendors.router, prefix="/vendors", tags=["vendors"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(repeat_orders.router, prefix="/repeat-orders", tags=["repeat-orders"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(websocket.router, tags=["websocket"])
