from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    avatar: Optional[str] = None
    role: str = "user"

class UserRegister(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    createdAt: datetime

    class Config:
        populate_by_name = True
        from_attributes = True

class UserDB(UserBase):
    hashed_password: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
