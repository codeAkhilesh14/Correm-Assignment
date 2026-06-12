import os
import logging
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.responses import FileResponse
from bson import ObjectId
from typing import List, Dict, Any
from datetime import datetime

from app.db import get_db
from app.routes.auth import get_current_user
from app.services.storage_service import StorageService
from app.services.pdf_parser import PDFParserService
from app.services.parser_hdfc import HDFCParser
from app.services.categorization import CategorizationEngine
from app.services.analytics_engine import AnalyticsEngine
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/statements", tags=["Statements"])

@router.post("/upload", response_model=Dict[str, Any])
async def upload_statement(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db = Depends(get_db)
):
    # 1. Validation Checks
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF bank statements are accepted."
        )
    
    # Check File Size (20 MB limit)
    MAX_SIZE = 20 * 1024 * 1024  # 20MB in bytes
    # Read file size
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 20 MB limit."
        )
    
    # Reset file cursor for upload
    await file.seek(0)
    
    try:
        # 2. Upload file to local storage
        pdf_url = await StorageService.upload_file(file)
        
        # 3. Extract Text from PDF (text or OCR)
        raw_text = await PDFParserService.extract_raw_text(file_content)
        
        # 4. Parse HDFC Statement Layout & run balance chaining
        account_details, transactions, validation_report = HDFCParser.parse_statement(raw_text)
        account_details["validationReport"] = validation_report
        
        # 5. Categorize each transaction
        for tx in transactions:
            category, confidence = CategorizationEngine.categorize(tx["description"])
            tx["category"] = category
            tx["categoryConfidence"] = confidence
            
        # 6. Run Analytics Engine
        analytics = AnalyticsEngine.generate_analytics(transactions, account_details)
        
        # 7. Prepare Database Documents
        statement_doc = {
            "userId": current_user["id"],
            "fileName": file.filename,
            "pdfUrl": pdf_url,
            "accountDetails": account_details,
            "analytics": analytics,
            "createdAt": datetime.utcnow()
        }
        
        # Save Statement
        statement_result = await db["statements"].insert_one(statement_doc)
        statement_id = str(statement_result.inserted_id)
        statement_doc["id"] = statement_id
        statement_doc.pop("_id", None)
        
        # Save Transactions
        if transactions:
            for tx in transactions:
                tx["statementId"] = statement_id
                tx["userId"] = current_user["id"]
                tx["createdAt"] = datetime.utcnow()
                
            await db["transactions"].insert_many(transactions)
            
            # Map transaction MongoDB string IDs
            for tx in transactions:
                tx["id"] = str(tx["_id"])
                tx.pop("_id", None)
                tx.pop("createdAt", None)
        
        return {
            "statement": statement_doc,
            "transactions": transactions,
            "message": "Statement successfully processed and analyzed."
        }
        
    except Exception as e:
        logger.error(f"Error processing upload: {e}")
        # Clean up uploaded file if process failed halfway
        if 'pdf_url' in locals() and pdf_url:
            StorageService.delete_file(pdf_url)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Statement processing failed: {str(e)}"
        )

@router.get("", response_model=List[Dict[str, Any]])
async def list_statements(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db = Depends(get_db)
):
    cursor = db["statements"].find({"userId": current_user["id"]}).sort("createdAt", -1)
    statements = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        statements.append(doc)
    return statements

@router.get("/{id}", response_model=Dict[str, Any])
async def get_statement(
    id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db = Depends(get_db)
):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid Statement ID")
        
    statement_doc = await db["statements"].find_one({"_id": ObjectId(id), "userId": current_user["id"]})
    if not statement_doc:
        raise HTTPException(status_code=404, detail="Statement not found")
        
    statement_doc["id"] = str(statement_doc["_id"])
    statement_doc.pop("_id", None)
    
    # Retrieve all related transactions
    tx_cursor = db["transactions"].find({"statementId": id, "userId": current_user["id"]}).sort("date", 1)
    transactions = []
    async for tx_doc in tx_cursor:
        tx_doc["id"] = str(tx_doc["_id"])
        tx_doc.pop("_id", None)
        transactions.append(tx_doc)
        
    return {
        "statement": statement_doc,
        "transactions": transactions
    }

@router.delete("/{id}", response_model=Dict[str, str])
async def delete_statement(
    id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db = Depends(get_db)
):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid Statement ID")
        
    statement_doc = await db["statements"].find_one({"_id": ObjectId(id), "userId": current_user["id"]})
    if not statement_doc:
        raise HTTPException(status_code=404, detail="Statement not found")
        
    # Delete file from storage
    StorageService.delete_file(statement_doc.get("pdfUrl"))
    
    # Delete transactions from DB
    await db["transactions"].delete_many({"statementId": id, "userId": current_user["id"]})
    
    # Delete statement metadata from DB
    await db["statements"].delete_one({"_id": ObjectId(id)})
    
    return {"message": "Statement and associated transactions successfully deleted."}

@router.get("/files/{filename}")
async def get_local_file(filename: str):
    """Serve local files from the uploads directory as a fallback."""
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
