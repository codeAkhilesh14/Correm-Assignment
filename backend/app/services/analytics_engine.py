import pandas as pd
import numpy as np
import re
from datetime import datetime
from typing import List, Dict, Any

class AnalyticsEngine:
    @staticmethod
    def clean_source(description: str) -> str:
        """Helper to simplify transaction description for grouping (removes IDs, dates, numbers)."""
        if not description:
            return ""
        desc = description.upper()
        # Remove standard transaction IDs, dates, cheque numbers
        desc = re.sub(r'\b\d{4,}\b', '', desc) # Remove long numbers
        desc = re.sub(r'\b\d{2}/\d{2}/\d{2,4}\b', '', desc) # Remove dates
        desc = re.sub(r'\bUPI-[A-Za-z0-9.-]+@[A-Za-z0-9.-]+\b', 'UPI', desc) # Simplify UPI handles
        desc = re.sub(r'\bIMPS/\d+\b', 'IMPS', desc) # Simplify IMPS
        # Replace multiple spaces with one
        desc = re.sub(r'\s+', ' ', desc).strip()
        # Truncate to first 30 characters for grouping
        return desc[:30]

    @classmethod
    def generate_analytics(cls, transactions: List[Dict[str, Any]], account_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates full analytical report from extracted transactions.
        """
        if not transactions:
            return {}

        df = pd.DataFrame(transactions)
        
        # Convert date to datetime for parsing
        df["datetime"] = pd.to_datetime(df["date"], format="%d/%m/%Y", errors="coerce")
        # For rows that failed parsing, drop or fill
        df["datetime"] = df["datetime"].ffill().bfill()
        
        df["month"] = df["datetime"].dt.to_period("M").astype(str)
        df["quarter"] = df["datetime"].dt.to_period("Q").astype(str)

        # Core Metrics
        total_credits = float(df["credit"].sum())
        total_debits = float(df["debit"].sum())
        net_flow = round(total_credits - total_debits, 2)
        tx_count = len(df)
        
        credits_only = df[df["credit"] > 0]
        debits_only = df[df["debit"] > 0]

        credit_count = int(len(credits_only))
        debit_count = int(len(debits_only))

        avg_credit = float(credits_only["credit"].mean()) if not credits_only.empty else 0.0
        avg_debit = float(debits_only["debit"].mean()) if not debits_only.empty else 0.0
        
        highest_credit = float(credits_only["credit"].max()) if not credits_only.empty else 0.0
        highest_debit = float(debits_only["debit"].max()) if not debits_only.empty else 0.0

        # Category Summary
        cat_group = df.groupby("category").agg(
            totalCredit=("credit", "sum"),
            totalDebit=("debit", "sum"),
            count=("date", "count")
        ).reset_index()
        
        category_summary = []
        for _, row in cat_group.iterrows():
            category_summary.append({
                "category": row["category"],
                "credit": float(row["totalCredit"]),
                "debit": float(row["totalDebit"]),
                "count": int(row["count"])
            })

        # Monthly Summary
        monthly_group = df.groupby("month").agg(
            totalCredit=("credit", "sum"),
            totalDebit=("debit", "sum"),
            count=("date", "count")
        ).reset_index()
        
        monthly_summary = []
        for _, row in monthly_group.iterrows():
            monthly_summary.append({
                "month": row["month"],
                "credit": float(row["totalCredit"]),
                "debit": float(row["totalDebit"]),
                "net": float(row["totalCredit"] - row["totalDebit"]),
                "count": int(row["count"])
            })

        # Quarterly Summary
        quarterly_group = df.groupby("quarter").agg(
            totalCredit=("credit", "sum"),
            totalDebit=("debit", "sum"),
            count=("date", "count")
        ).reset_index()
        
        quarterly_summary = []
        for _, row in quarterly_group.iterrows():
            quarterly_summary.append({
                "quarter": row["quarter"],
                "credit": float(row["totalCredit"]),
                "debit": float(row["totalDebit"]),
                "net": float(row["totalCredit"] - row["totalDebit"]),
                "count": int(row["count"])
            })

        # Top Transactions (Sorted by amount)
        top_credits_df = df[df["credit"] > 0].sort_values(by="credit", ascending=False).head(5)
        top_debits_df = df[df["debit"] > 0].sort_values(by="debit", ascending=False).head(5)
        
        top_transactions = {
            "credits": top_credits_df.drop(columns=["datetime", "month", "quarter"], errors="ignore").to_dict(orient="records"),
            "debits": top_debits_df.drop(columns=["datetime", "month", "quarter"], errors="ignore").to_dict(orient="records")
        }

        # Top 5 largest transactions by absolute amount (combined credit + debit)
        df["_abs_amount"] = df[["credit", "debit"]].max(axis=1)
        top5_df = df.nlargest(5, "_abs_amount").drop(columns=["datetime", "month", "quarter", "_abs_amount", "clean_desc"], errors="ignore")
        top5_transactions = top5_df.to_dict(orient="records")
        df.drop(columns=["_abs_amount"], inplace=True, errors="ignore")

        # Balance Trend
        balance_trend = df[["date", "balance"]].to_dict(orient="records")

        # Categorization Percentage
        non_other_count = len(df[df["category"] != "Other"])
        categorization_percentage = round((non_other_count / tx_count) * 100, 2) if tx_count > 0 else 0.0

        # Create groupings for Salary / EMI detection
        df["clean_desc"] = df["description"].apply(cls.clean_source)

        # -------------------------------------------------------------
        # Salary Detection
        # -------------------------------------------------------------
        salary_detected = []
        # Group credits by cleaned description
        if not credits_only.empty:
            credits_df = df[df["credit"] > 0].copy()
            credits_df["clean_desc"] = credits_df["description"].apply(cls.clean_source)
            
            for source, group in credits_df.groupby("clean_desc"):
                if len(group) >= 1:
                    months_active = group["month"].nunique()
                    total_amt = group["credit"].sum()
                    mean_amt = group["credit"].mean()
                    std_amt = group["credit"].std() if len(group) > 1 else 0.0
                    
                    # Compute similarity in amounts (coefficient of variation)
                    cv = (std_amt / mean_amt) if mean_amt > 0 and len(group) > 1 else 0.0
                    
                    # Heuristics for Salary
                    is_salary_keyword = any(kw in source.lower() for kw in [
                        "salary", "sal", "payroll", "paycheck", "wages", "epfo",
                        "reimbursement", "stipend", "net pay", "bonus", "incentive"
                    ])
                    
                    # If monthly recurring or has keyword
                    if (months_active >= 2 and cv < 0.15) or (is_salary_keyword and mean_amt > 10000):
                        confidence = 0.95 if is_salary_keyword else 0.80
                        if cv > 0.10:
                            confidence -= 0.10
                            
                        salary_detected.append({
                            "source": source,
                            "amount": float(round(mean_amt, 2)),
                            "frequency": "Monthly" if months_active >= 2 else "One-time",
                            "confidence": round(confidence, 2)
                        })

        # -------------------------------------------------------------
        # EMI Detection
        # -------------------------------------------------------------
        # Before EMI groupby, ensure clean_desc column is ready
        emi_detected = []
        if not debits_only.empty:
            debits_df = df[df["debit"] > 0].copy()
            debits_df["clean_desc"] = debits_df["description"].apply(cls.clean_source)
            
            for source, group in debits_df.groupby("clean_desc"):
                is_emi_keyword = any(kw in source.lower() for kw in [
                    "emi", "loan", "hdb", "bajaj", "finance", "credila",
                    "auto-debit", "nach", "ecs", "repay", "mortgage", "installment"
                ])
                if len(group) >= 2: # EMIs are recurring, so at least 2 occurrences
                    months_active = group["month"].nunique()
                    mean_amt = group["debit"].mean()
                    std_amt = group["debit"].std()
                    cv = std_amt / mean_amt if mean_amt > 0 else 0.0
                    
                    # Check if amounts are very close
                    if cv < 0.05 and months_active >= 2:
                        confidence = 0.95 if is_emi_keyword else 0.80
                        
                        emi_detected.append({
                            "source": source,
                            "amount": float(round(mean_amt, 2)),
                            "frequency": "Monthly",
                            "confidence": round(confidence, 2)
                        })
                elif len(group) == 1 and is_emi_keyword:
                    # Single transaction but with strong EMI/loan keywords
                    mean_amt = group["debit"].iloc[0]
                    emi_detected.append({
                        "source": source,
                        "amount": float(round(mean_amt, 2)),
                        "frequency": "One-time/Unconfirmed",
                        "confidence": 0.70
                    })

        return {
            "totalCredits": total_credits,
            "totalDebits": total_debits,
            "netFlow": net_flow,
            "transactionCount": tx_count,
            "creditCount": credit_count,
            "debitCount": debit_count,
            "averageCredit": round(avg_credit, 2),
            "averageDebit": round(avg_debit, 2),
            "highestCredit": highest_credit,
            "highestDebit": highest_debit,
            "categorySummary": category_summary,
            "monthlySummary": monthly_summary,
            "quarterlySummary": quarterly_summary,
            "topTransactions": top_transactions,
            "top5Transactions": top5_transactions,
            "balanceTrend": balance_trend,
            "salaryDetection": salary_detected,
            "emiDetection": emi_detected,
            "categorizationPercentage": categorization_percentage
        }
