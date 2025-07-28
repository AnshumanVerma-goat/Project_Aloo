from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserType

def init_sample_data():
    db = SessionLocal()
    try:
        # Check if sample users already exist
        if db.query(User).count() == 0:
            # Create sample vendor
            vendor = User(
                email="vendor@example.com",
                full_name="Sample Vendor",
                hashed_password=get_password_hash("vendor123"),
                phone="+91-9876543210",
                address="123 Market Street, Delhi",
                user_type=UserType.vendor
            )
            db.add(vendor)

            # Create sample farmer
            farmer = User(
                email="farmer@example.com",
                full_name="Sample Farmer",
                hashed_password=get_password_hash("farmer123"),
                phone="+91-9876543211",
                address="456 Farm Road, Punjab",
                user_type=UserType.farmer
            )
            db.add(farmer)

            db.commit()
            print("Sample users created successfully!")
        else:
            print("Sample users already exist.")
            
    except Exception as e:
        print(f"Error creating sample users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_sample_data()
