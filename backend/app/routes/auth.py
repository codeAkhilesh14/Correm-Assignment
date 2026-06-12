from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from bson import ObjectId
from datetime import datetime
from typing import Dict, Any

from app.db import get_db
from app.models.user import UserRegister, UserLogin, UserResponse, UserDB
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_exception
        
    try:
        user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
        if user_doc is None:
            raise credentials_exception
            
        user_doc["id"] = str(user_doc["_id"])
        return user_doc
    except Exception:
        raise credentials_exception

@router.post("/register", response_model=Dict[str, Any])
async def register(user_data: UserRegister, db = Depends(get_db)):
    # Check if user email already exists
    existing_user = await db["users"].find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
        
    hashed_pwd = hash_password(user_data.password)
    user_db = UserDB(
        name=user_data.name,
        email=user_data.email.lower(),
        avatar=user_data.avatar or f"https://api.dicebear.com/7.x/adventurer/svg?seed={user_data.name}",
        role=user_data.role,
        hashed_password=hashed_pwd
    )
    
    # Save user to database
    result = await db["users"].insert_one(user_db.model_dump())
    
    # Retrieve created user
    created_user = await db["users"].find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user["_id"])
    
    # Create token
    access_token = create_access_token(subject=created_user["id"])
    
    # Format user response
    user_resp = UserResponse(
        id=created_user["id"],
        name=created_user["name"],
        email=created_user["email"],
        avatar=created_user["avatar"],
        role=created_user["role"],
        createdAt=created_user["createdAt"]
    )
    
    return {
        "user": user_resp.model_dump(),
        "token": access_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=Dict[str, Any])
async def login(credentials: UserLogin, db = Depends(get_db)):
    user_doc = await db["users"].find_one({"email": credentials.email.lower()})
    if not user_doc or not verify_password(credentials.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    user_doc["id"] = str(user_doc["_id"])
    access_token = create_access_token(subject=user_doc["id"])
    
    user_resp = UserResponse(
        id=user_doc["id"],
        name=user_doc["name"],
        email=user_doc["email"],
        avatar=user_doc["avatar"],
        role=user_doc["role"],
        createdAt=user_doc["createdAt"]
    )
    
    return {
        "user": user_resp.model_dump(),
        "token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        avatar=current_user["avatar"],
        role=current_user["role"],
        createdAt=current_user["createdAt"]
    )

@router.post("/forgot-password")
async def forgot_password(data: Dict[str, str], db = Depends(get_db)):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    user = await db["users"].find_one({"email": email.lower()})
    # For security reasons, don't confirm if the email is registered, just return a generic response
    return {"message": "If this email is registered, reset instructions have been sent."}

@router.post("/reset-password")
async def reset_password(data: Dict[str, str], db = Depends(get_db)):
    email = data.get("email")
    new_password = data.get("password")
    
    if not email or not new_password:
        raise HTTPException(status_code=400, detail="Email and new password are required")
        
    user = await db["users"].find_one({"email": email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    hashed_pwd = hash_password(new_password)
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"hashed_password": hashed_pwd}}
    )
    
    return {"message": "Password successfully updated."}
