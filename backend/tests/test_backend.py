import pytest
from app.services.parser_hdfc import HDFCParser
from app.services.categorization import CategorizationEngine
from app.services.analytics_engine import AnalyticsEngine

def test_hdfc_parser_metadata_extraction():
    sample_text = """
    HDFC BANK
    Branch Name: KANJURMARG EAST
    Account Name : JOHN ALBERT DOE
    Account No : 50100123456789
    RTGS/NEFT IFSC : HDFC0001234
    Statement Period: 01/01/2026 To 31/01/2026
    Opening Balance : 10,000.00
    Closing Balance : 15,500.00
    """
    lines = HDFCParser.clean_text(sample_text)
    metadata = HDFCParser.extract_metadata(lines)
    
    assert metadata["accountNumber"] == "50100123456789"
    assert metadata["ifsc"] == "HDFC0001234"
    assert metadata["branchName"] == "KANJURMARG EAST"
    assert metadata["startDate"] == "01/01/2026"
    assert metadata["endDate"] == "31/01/2026"
    assert metadata["openingBalance"] == 10000.0
    assert metadata["closingBalance"] == 15500.0
    assert metadata["accountHolderName"] == "JOHN ALBERT DOE"

def test_hdfc_transaction_parsing_and_reconciliation():
    statement_text = """
    Opening Balance: 1000.00
    01/01/26 UPI-SWIGGY-123 123456 01/01/26 250.00 0.00 750.00
    02/01/26 NEFT-COMPANY-SALARY 02/01/26 0.00 5000.00 5750.00
    03/01/26 CASH-WITHDRAWAL 03/01/26 1000.00 0.00 4750.00
    Closing Balance: 4750.00
    """
    details, txs, val_report = HDFCParser.parse_statement(statement_text)
    
    assert len(txs) == 3
    assert val_report["reconciliationStatus"] == "SUCCESS"
    assert val_report["mismatchCount"] == 0
    assert txs[0]["debit"] == 250.0
    assert txs[0]["credit"] == 0.0
    assert txs[0]["balance"] == 750.0
    
    assert txs[1]["debit"] == 0.0
    assert txs[1]["credit"] == 5000.0
    assert txs[1]["balance"] == 5750.0

def test_hdfc_reconciliation_mismatch():
    # Intentionally corrupt the balance of the last row to test discrepancy detection
    corrupt_text = """
    Opening Balance: 1000.00
    01/01/26 UPI-SWIGGY-123 123456 01/01/26 250.00 0.00 750.00
    02/01/26 NEFT-COMPANY-SALARY 02/01/26 0.00 5000.00 9999.00
    Closing Balance: 9999.00
    """
    details, txs, val_report = HDFCParser.parse_statement(corrupt_text)
    
    assert val_report["reconciliationStatus"] == "FAILED"
    assert val_report["mismatchCount"] > 0
    assert len(val_report["mismatches"]) > 0

def test_categorization_engine():
    # Test SWIGGY (Food & Dining)
    cat1, conf1 = CategorizationEngine.categorize("UPI-SWIGGY-DELIVERY-BANGALORE")
    assert cat1 == "Food & Dining"
    assert conf1 > 0.7
    
    # Test SALARY (Salary)
    cat2, conf2 = CategorizationEngine.categorize("ACH DEBIT INTEL PAYROLL SALARY JAN")
    assert cat2 == "Salary"
    
    # Test EMI (EMI / Loan)
    cat3, conf3 = CategorizationEngine.categorize("HDFC HOME LOAN EMI DEBIT")
    assert cat3 == "EMI / Loan"

def test_analytics_engine():
    mock_transactions = [
        {"date": "01/01/2026", "valueDate": "01/01/2026", "description": "SWIGGY FOOD ORDER", "reference": "123", "debit": 500.0, "credit": 0.0, "balance": 9500.0, "category": "Food & Dining"},
        {"date": "02/01/2026", "valueDate": "02/01/2026", "description": "ACH CRED SALARY PAYCHECK", "reference": "456", "debit": 0.0, "credit": 50000.0, "balance": 59500.0, "category": "Salary"},
        {"date": "03/01/2026", "valueDate": "03/01/2026", "description": "HDFC HOME LOAN EMI AUTO", "reference": "789", "debit": 20000.0, "credit": 0.0, "balance": 39500.0, "category": "EMI / Loan"}
    ]
    mock_details = {"openingBalance": 10000.0, "closingBalance": 39500.0}
    
    analytics = AnalyticsEngine.generate_analytics(mock_transactions, mock_details)
    
    assert analytics["totalCredits"] == 50000.0
    assert analytics["totalDebits"] == 20500.0
    assert analytics["netFlow"] == 29500.0
    assert analytics["transactionCount"] == 3
    assert len(analytics["salaryDetection"]) > 0
    assert len(analytics["emiDetection"]) > 0
