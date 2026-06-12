from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from bson import ObjectId
from typing import Dict, Any

from app.db import get_db
from app.routes.auth import get_current_user
from app.utils.excel_generator import ExcelReportGenerator

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/excel/{id}")
async def export_excel_report(
    id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db = Depends(get_db)
):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid Statement ID")
        
    statement = await db["statements"].find_one({"_id": ObjectId(id), "userId": current_user["id"]})
    if not statement:
        raise HTTPException(status_code=404, detail="Statement not found")
        
    statement["id"] = str(statement["_id"])
    
    # Retrieve all related transactions
    tx_cursor = db["transactions"].find({"statementId": id, "userId": current_user["id"]}).sort("date", 1)
    transactions = []
    async for tx_doc in tx_cursor:
        tx_doc["id"] = str(tx_doc["_id"])
        transactions.append(tx_doc)
        
    try:
        # Generate Excel Report using the openpyxl helper
        excel_stream = ExcelReportGenerator.create_report(statement, transactions)
        
        filename = f"Correm_HDFC_Report_{id[:8]}.xlsx"
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
        
        return StreamingResponse(
            excel_stream,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers=headers
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Excel report: {str(e)}")
