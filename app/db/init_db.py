from sqlalchemy.orm import Session
from app.crud.user import create_user
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def init_db(db: Session) -> None:
    # Create sample farmers
    sample_farmers = [
        {
            "email": "farmer1@example.com",
            "password": "farmer123",
            "full_name": "Raj Kumar",
            "phone": "9876543210",
            "address": "Village Mehrauli, Delhi",
            "user_type": "farmer"
        },
        {
            "email": "farmer2@example.com",
            "password": "farmer456",
            "full_name": "Amit Singh",
            "phone": "9876543211",
            "address": "Village Najafgarh, Delhi",
            "user_type": "farmer"
        }
    ]

    # Create sample vendors
    sample_vendors = [
        {
            "email": "vendor1@example.com",
            "password": "vendor123",
            "full_name": "Mohan Traders",
            "phone": "9876543212",
            "address": "Chandni Chowk, Delhi",
            "user_type": "vendor"
        },
        {
            "email": "vendor2@example.com",
            "password": "vendor456",
            "full_name": "Delhi Vegetables",
            "phone": "9876543213",
            "address": "Lajpat Nagar, Delhi",
            "user_type": "vendor"
        }
    ]

    # Add farmers to database
    for farmer in sample_farmers:
        user_in = UserCreate(
            email=farmer["email"],
            password=farmer["password"],
            full_name=farmer["full_name"],
            phone=farmer["phone"],
            address=farmer["address"],
            user_type=farmer["user_type"]
        )
        create_user(db, user_in)

    # Add vendors to database
    for vendor in sample_vendors:
        user_in = UserCreate(
            email=vendor["email"],
            password=vendor["password"],
            full_name=vendor["full_name"],
            phone=vendor["phone"],
            address=vendor["address"],
            user_type=vendor["user_type"]
        )
        create_user(db, user_in)
