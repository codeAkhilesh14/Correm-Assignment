from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TransactionBase(BaseModel):
    date: str              # Transaction date (string format DD/MM/YYYY)
    valueDate: str         # Value date (string format DD/MM/YYYY)
    description: str       # Narration / Description
    reference: str         # Ref number or cheque number
    debit: float           # Withdrawal amount (debit)
    credit: float          # Deposit amount (credit)
    balance: float         # Closing balance after transaction
    category: str = "Other"# Auto-categorized class
    categoryConfidence: float = 1.0

class TransactionCreate(TransactionBase):
    statementId: str
    userId: str

class TransactionResponse(TransactionBase):
    id: str
    statementId: str
    userId: str

    class Config:
        populate_by_name = True
        from_attributes = True

class TransactionDB(TransactionBase):
    statementId: str
    userId: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
