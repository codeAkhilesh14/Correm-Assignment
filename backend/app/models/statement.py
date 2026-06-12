from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class AccountDetails(BaseModel):
    accountHolderName: Optional[str] = None
    accountNumber: Optional[str] = None
    branchName: Optional[str] = None
    bankName: str = "HDFC Bank"
    ifsc: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    openingBalance: float = 0.0
    closingBalance: float = 0.0
    reconciliationStatus: str = "PENDING"  # SUCCESS, FAILED, PENDING
    validationReport: Dict[str, Any] = Field(default_factory=dict) # Reports balance chain checks

class StatementBase(BaseModel):
    fileName: str
    pdfUrl: str

class StatementCreate(StatementBase):
    userId: str

class StatementResponse(StatementBase):
    id: str
    userId: str
    accountDetails: AccountDetails
    analytics: Dict[str, Any] = Field(default_factory=dict)
    createdAt: datetime

    class Config:
        populate_by_name = True
        from_attributes = True

class StatementDB(StatementBase):
    userId: str
    accountDetails: AccountDetails
    analytics: Dict[str, Any] = Field(default_factory=dict)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
