from sqlalchemy import Column, Integer, String, Enum
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
