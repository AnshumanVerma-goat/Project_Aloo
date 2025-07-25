from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from app.models.user import UserType

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str
    address: str
    user_type: UserType

class UserCreate(UserBase):
    password: str

    @validator("password")
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

class User(UserBase):
    id: int

    class Config:
        orm_mode = True
