from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class UserType(str, enum.Enum):
    farmer = "farmer"
    vendor = "vendor"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    phone = Column(String)
    address = Column(String)
    user_type = Column(Enum(UserType))

    # Relationships
    products = relationship("Product", back_populates="vendor")
    orders = relationship("Order", back_populates="customer")
