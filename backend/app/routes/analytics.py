from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from typing import Dict, Any

from app.db import get_db
from app.routes.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/{id}", response_model=Dict[str, Any])
async def get_statement_analytics(
    id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db = Depends(get_db)
):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid Statement ID")
        
    statement = await db["statements"].find_one({"_id": ObjectId(id), "userId": current_user["id"]})
    if not statement:
        raise HTTPException(status_code=404, detail="Statement not found")
        
    return statement.get("analytics", {})
