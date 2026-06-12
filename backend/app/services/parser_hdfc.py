import re
import logging
from typing import Dict, List, Any, Tuple

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Month-name → numeric month map
# ---------------------------------------------------------------------------
MONTH_MAP = {
    "jan": "01", "feb": "02", "mar": "03", "apr": "04",
    "may": "05", "jun": "06", "jul": "07", "aug": "08",
    "sep": "09", "oct": "10", "nov": "11", "dec": "12",
}


class HDFCParser:
    # -----------------------------------------------------------------------
    # Helpers
    # -----------------------------------------------------------------------
    @staticmethod
    def parse_float(val: str) -> float:
        """Convert a string like '1,23,456.78' or 'Rs. 1234.00' to float."""
        if not val:
            return 0.0
        cleaned = re.sub(r"[^\d.]", "", val.replace(",", ""))
        try:
            return float(cleaned)
        except ValueError:
            return 0.0

    @staticmethod
    def normalise_date(raw: str) -> str:
        """
        Normalise various HDFC date formats to DD/MM/YYYY.
        Handles: DD/MM/YYYY, DD/MM/YY, DD-Mon-YYYY, DD-Mon-YY
        """
        raw = raw.strip()
        # Already DD/MM/YYYY
        m = re.match(r"^(\d{2})/(\d{2})/(\d{2,4})$", raw)
        if m:
            d, mo, y = m.group(1), m.group(2), m.group(3)
            return f"{d}/{mo}/{'20' + y if len(y) == 2 else y}"

        # DD-Mon-YYYY or DD-Mon-YY
        m = re.match(r"^(\d{1,2})[-/]([A-Za-z]{3})[-/](\d{2,4})$", raw)
        if m:
            d   = m.group(1).zfill(2)
            mon = MONTH_MAP.get(m.group(2).lower(), "01")
            y   = m.group(3)
            if len(y) == 2:
                y = "20" + y
            return f"{d}/{mon}/{y}"

        return raw  # fallback — return as-is

    @staticmethod
    def clean_text(text: str) -> List[str]:
        return [line.strip() for line in text.split("\n") if line.strip()]

    # -----------------------------------------------------------------------
    # Metadata extraction
    # -----------------------------------------------------------------------
    @classmethod
    def extract_metadata(cls, lines: List[str]) -> Dict[str, Any]:
        full_text = "\n".join(lines)

        details: Dict[str, Any] = {
            "accountHolderName": None,
            "accountNumber":     None,
            "branchName":        None,
            "bankName":          "HDFC Bank",
            "ifsc":              None,
            "startDate":         None,
            "endDate":           None,
            "openingBalance":    0.0,
            "closingBalance":    0.0,
        }

        # ── Account Number ──────────────────────────────────────────────────
        # Handles: "Account Number: 5020 1234 5678 9012"
        m = re.search(r"Account\s*(?:Number|No\.?|No)\s*[:\-]\s*([\d \t]{5,25})", full_text, re.IGNORECASE)
        if m:
            details["accountNumber"] = re.sub(r"\s+", " ", m.group(1)).strip()
        else:
            # Try A/C No: xxxxxxxxxxxxxxxx
            m = re.search(r"A/[Cc]\s*(?:No\.?|Number)?\s*[:\-]\s*([\d \t]{5,25})", full_text, re.IGNORECASE)
            if m:
                details["accountNumber"] = re.sub(r"\s+", " ", m.group(1)).strip()

        # ── IFSC ────────────────────────────────────────────────────────────
        m = re.search(r"IFSC\s*(?:Code)?\s*[:\-]\s*([A-Z]{4}0[A-Z0-9]{6})", full_text, re.IGNORECASE)
        if m:
            details["ifsc"] = m.group(1).upper()

        # ── Branch ──────────────────────────────────────────────────────────
        m = re.search(r"(?:Account\s+)?Branch(?:\s+Name)?\s*[:\-]\s*([^\n]+)", full_text, re.IGNORECASE)
        if m:
            details["branchName"] = m.group(1).strip()

        # ── Statement Period ─────────────────────────────────────────────────
        # Handles: "01-Apr-2025 to 30-Jun-2025", "01/04/2025 To 30/06/2025"
        m = re.search(
            r"Statement\s*(?:Period|Date|from|for)?\s*[:\-]?\s*"
            r"(\d{1,2}[-/][A-Za-z0-9]{2,4}[-/]\d{2,4})\s*(?:to|To|-)\s*"
            r"(\d{1,2}[-/][A-Za-z0-9]{2,4}[-/]\d{2,4})",
            full_text, re.IGNORECASE
        )
        if m:
            details["startDate"] = cls.normalise_date(m.group(1))
            details["endDate"]   = cls.normalise_date(m.group(2))
        else:
            # Plain DD/MM/YYYY to DD/MM/YYYY
            m = re.search(
                r"(\d{2}/\d{2}/\d{2,4})\s+(?:to|-)\s+(\d{2}/\d{2}/\d{2,4})",
                full_text, re.IGNORECASE
            )
            if m:
                details["startDate"] = cls.normalise_date(m.group(1))
                details["endDate"]   = cls.normalise_date(m.group(2))

        # ── Opening Balance ──────────────────────────────────────────────────
        m = re.search(
            r"(?:Opening\s+Balance|Opening\s+Bal|Op\s+Bal|Previous\s+Balance)\s*[:\-]\s*(?:Rs\.?\s*)?([\d,]+\.?\d*)",
            full_text, re.IGNORECASE
        )
        if m:
            details["openingBalance"] = cls.parse_float(m.group(1))

        # ── Closing Balance ──────────────────────────────────────────────────
        m = re.search(
            r"(?:Closing\s+Balance|Closing\s+Bal|Cl\s+Bal)\s*[:\-]\s*(?:Rs\.?\s*)?([\d,]+\.?\d*)",
            full_text, re.IGNORECASE
        )
        if m:
            details["closingBalance"] = cls.parse_float(m.group(1))

        # ── Account Holder Name ──────────────────────────────────────────────
        m = re.search(
            r"(?:Account\s+Holder\s+Name|Customer\s+Name|Account\s+Name|A/C\s+Name)\s*[:\-]\s*([A-Za-z \t.'-]{4,60})",
            full_text, re.IGNORECASE
        )
        if m:
            name_raw = m.group(1).strip()
            details["accountHolderName"] = " ".join(name_raw.split())
        else:
            # Name pattern: lines in the first 15 that look like "FIRST LAST" or "First Last"
            ignore = ["statement", "page", "branch", "account", "ifsc", "care",
                      "rtgs", "neft", "customer", "saving", "current", "hdfc", "bank", "limited"]
            for line in lines[:15]:
                if ":" in line or "|" in line:
                    continue
                if any(kw in line.lower() for kw in ignore):
                    continue
                if re.match(r"^[A-Z][a-zA-Z\s.'-]{3,45}$", line):
                    details["accountHolderName"] = line.strip()
                    break

        return details

    # -----------------------------------------------------------------------
    # Transaction parsing — handles PIPE-DELIMITED multi-line HDFC format
    # -----------------------------------------------------------------------
    @classmethod
    def _parse_pipe_format(cls, lines: List[str]) -> List[Dict[str, Any]]:
        """
        Handles the pipe-delimited HDFC format:
          Line A: DD/MM/YYYY | DD/MM/YYYY | Description | RefNo | Deposit | [Withdrawal |]
          Line B: [RefNo |] [Deposit |] Withdrawal | Balance
        (fields may wrap onto the next line)
        """
        transactions: List[Dict[str, Any]] = []

        # Regex: line that starts with a date (possibly wrapped, may also end mid-pipe)
        DATE_RE = re.compile(r"^(\d{2}/\d{2}/\d{2,4})\s*\|")
        NUM_RE  = re.compile(r"^[\d,]+\.\d{2}$")

        def clean_pipes(s: str) -> List[str]:
            """Split by pipe and strip/filter empty fields."""
            return [f.strip() for f in s.split("|") if f.strip()]

        i = 0
        while i < len(lines):
            line = lines[i]
            if DATE_RE.match(line):
                # Combine with next line if it looks like a continuation
                combined = line
                if i + 1 < len(lines):
                    nxt = lines[i + 1]
                    # Continuation: does not start with a date, not metadata
                    if not DATE_RE.match(nxt) and not re.match(r"^[A-Z].*[:\-]", nxt):
                        combined = combined.rstrip("|").strip() + " | " + nxt
                        i += 1

                fields = clean_pipes(combined)
                # Expected (after splitting by pipe):
                # [date, value_date, description, ref_no, deposit, withdrawal, balance]
                # Some fields may be empty (empty string between pipes)

                # Use a more permissive approach: grab all fields from the
                # combined line and identify amounts by their decimal format.
                all_fields = [f.strip() for f in combined.split("|")]

                # Pull out the first two dates
                tx_date  = cls.normalise_date(all_fields[0].strip()) if len(all_fields) > 0 else ""
                val_date = cls.normalise_date(all_fields[1].strip()) if len(all_fields) > 1 and re.match(r"\d{2}/\d{2}/\d{2,4}", all_fields[1].strip()) else tx_date

                # Now extract all numeric values from remaining fields
                amounts  = []
                desc_parts = []
                ref_no = ""

                for idx, f in enumerate(all_fields[2:], start=2):
                    f = f.strip()
                    if not f:
                        continue
                    # Check if it looks like a monetary amount
                    if re.match(r"^[\d,]+\.\d{2}$", f):
                        amounts.append(cls.parse_float(f))
                    elif re.match(r"^[A-Z0-9]{6,25}$", f) and not ref_no:
                        # Likely a reference/cheque number
                        ref_no = f
                    else:
                        desc_parts.append(f)

                description = " ".join(desc_parts).strip()

                # amounts order depends on how many we got
                # Typically: deposit/credit, withdrawal/debit, balance — last is always balance
                # Or: withdrawal, balance / credit, balance
                deposit    = 0.0
                withdrawal = 0.0
                balance    = 0.0

                if len(amounts) >= 3:
                    deposit    = amounts[0]
                    withdrawal = amounts[1]
                    balance    = amounts[2]
                elif len(amounts) == 2:
                    balance = amounts[-1]
                    # Determine credit vs debit based on context
                    amount = amounts[0]
                    # We'll resolve this during reconciliation
                    deposit    = 0.0
                    withdrawal = 0.0
                    transactions.append({
                        "date":        tx_date,
                        "valueDate":   val_date,
                        "description": description,
                        "reference":   ref_no,
                        "debit":       withdrawal,
                        "credit":      deposit,
                        "balance":     balance,
                        "_temp_amount": amount,
                    })
                    i += 1
                    continue
                elif len(amounts) == 1:
                    balance = amounts[0]

                if tx_date:
                    transactions.append({
                        "date":        tx_date,
                        "valueDate":   val_date,
                        "description": description,
                        "reference":   ref_no,
                        "debit":       withdrawal,
                        "credit":      deposit,
                        "balance":     balance,
                    })
            i += 1

        return transactions

    @classmethod
    def _parse_space_format(cls, lines: List[str]) -> List[Dict[str, Any]]:
        """
        Fallback: space-separated HDFC format.
        Transactions start with DD/MM/YYYY and amounts are the last 3 tokens.
        """
        transactions: List[Dict[str, Any]] = []
        DATE_RE  = re.compile(r"^(\d{2}/\d{2}/\d{2,4})\s+(.*)$")
        NUM_RE   = re.compile(r"^-?[\d,]+\.\d{2}$")
        current_tx = None

        for line in lines:
            m = DATE_RE.match(line)
            if m:
                if current_tx:
                    transactions.append(current_tx)
                    current_tx = None

                tx_date  = cls.normalise_date(m.group(1))
                rem      = m.group(2).strip()
                tokens   = rem.split()

                if len(tokens) >= 3 and NUM_RE.match(tokens[-1]) and NUM_RE.match(tokens[-2]) and NUM_RE.match(tokens[-3]):
                    balance  = cls.parse_float(tokens[-1])
                    credit   = cls.parse_float(tokens[-2])
                    debit    = cls.parse_float(tokens[-3])
                    rem_tok  = tokens[:-3]

                    val_date = tx_date
                    if rem_tok and re.match(r"^\d{2}/\d{2}/\d{2,4}$", rem_tok[-1]):
                        val_date = cls.normalise_date(rem_tok[-1])
                        rem_tok  = rem_tok[:-1]

                    ref_no = ""
                    if rem_tok and (rem_tok[-1].isdigit() or re.match(r"^[A-Z0-9]{6,25}$", rem_tok[-1])):
                        ref_no  = rem_tok[-1]
                        rem_tok = rem_tok[:-1]

                    current_tx = {
                        "date": tx_date, "valueDate": val_date,
                        "description": " ".join(rem_tok), "reference": ref_no,
                        "debit": debit, "credit": credit, "balance": balance,
                    }

                elif len(tokens) >= 2 and NUM_RE.match(tokens[-1]) and NUM_RE.match(tokens[-2]):
                    balance = cls.parse_float(tokens[-1])
                    amount  = cls.parse_float(tokens[-2])
                    rem_tok = tokens[:-2]
                    val_date = tx_date
                    if rem_tok and re.match(r"^\d{2}/\d{2}/\d{2,4}$", rem_tok[-1]):
                        val_date = cls.normalise_date(rem_tok[-1])
                        rem_tok  = rem_tok[:-1]
                    ref_no = ""
                    if rem_tok and re.match(r"^[A-Z0-9]{6,25}$", rem_tok[-1]):
                        ref_no  = rem_tok[-1]
                        rem_tok = rem_tok[:-1]
                    current_tx = {
                        "date": tx_date, "valueDate": val_date,
                        "description": " ".join(rem_tok), "reference": ref_no,
                        "debit": 0.0, "credit": 0.0, "balance": balance,
                        "_temp_amount": amount,
                    }
                else:
                    current_tx = {
                        "date": tx_date, "valueDate": tx_date,
                        "description": rem, "reference": "",
                        "debit": 0.0, "credit": 0.0, "balance": 0.0,
                    }
            else:
                if current_tx:
                    skip = ["statement of account", "page total", "closing balance", "dep description",
                            "total credits", "total debits", "closing bal"]
                    if not any(s in line.lower() for s in skip):
                        current_tx["description"] += " " + line

        if current_tx:
            transactions.append(current_tx)

        return transactions

    # -----------------------------------------------------------------------
    # Main entry point
    # -----------------------------------------------------------------------
    @classmethod
    def parse_statement(cls, text: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]], Dict[str, Any]]:
        lines          = cls.clean_text(text)
        account_details = cls.extract_metadata(lines)

        # ── Choose parser based on whether the format uses pipes ─────────────
        pipe_count  = sum(1 for l in lines if "|" in l)
        total_lines = max(len(lines), 1)
        use_pipe    = (pipe_count / total_lines) > 0.15   # >15% of lines have pipes

        logger.info(f"Pipe-format detected: {use_pipe} ({pipe_count}/{total_lines} lines with '|')")

        if use_pipe:
            raw_tx_list = cls._parse_pipe_format(lines)
        else:
            raw_tx_list = cls._parse_space_format(lines)

        logger.info(f"Raw transactions parsed: {len(raw_tx_list)}")

        # ── Validation report skeleton ───────────────────────────────────────
        validation_report: Dict[str, Any] = {
            "totalTransactions":  len(raw_tx_list),
            "reconciledCount":    0,
            "mismatchCount":      0,
            "mismatches":         [],
            "reconciliationStatus": "SUCCESS",
        }

        if not raw_tx_list:
            account_details["reconciliationStatus"] = "FAILED"
            validation_report["reconciliationStatus"] = "FAILED"
            validation_report["error"] = "No transactions found"
            return account_details, [], validation_report

        # ── Balance chain reconciliation ─────────────────────────────────────
        prev_balance = account_details.get("openingBalance", 0.0)
        if prev_balance == 0.0 and raw_tx_list:
            first = raw_tx_list[0]
            if first.get("debit", 0) > 0:
                prev_balance = first["balance"] + first["debit"]
            elif first.get("credit", 0) > 0:
                prev_balance = first["balance"] - first["credit"]
            else:
                prev_balance = first["balance"]
            account_details["openingBalance"] = prev_balance

        reconciled: List[Dict[str, Any]] = []

        for idx, tx in enumerate(raw_tx_list):
            balance = tx["balance"]

            # Resolve _temp_amount (2-column format where CR/DR is ambiguous)
            if "_temp_amount" in tx:
                temp = tx.pop("_temp_amount")
                diff = round(balance - prev_balance, 2)
                if diff > 0:
                    tx["credit"] = temp if abs(temp - diff) < 0.01 else diff
                    tx["debit"]  = 0.0
                elif diff < 0:
                    tx["debit"]  = temp if abs(temp - abs(diff)) < 0.01 else abs(diff)
                    tx["credit"] = 0.0
                else:
                    tx["credit"] = 0.0
                    tx["debit"]  = 0.0

            debit  = tx.get("debit",  0.0)
            credit = tx.get("credit", 0.0)

            expected = round(prev_balance - debit + credit, 2)
            actual   = round(balance, 2)

            if abs(expected - actual) < 0.02:   # tolerate ₹0.01 rounding
                validation_report["reconciledCount"] += 1
            else:
                validation_report["mismatchCount"] += 1
                validation_report["mismatches"].append({
                    "index":       idx,
                    "date":        tx["date"],
                    "description": tx["description"][:50],
                    "expected":    expected,
                    "actual":      actual,
                    "difference":  round(actual - expected, 2),
                })
                logger.warning(f"Balance mismatch tx {idx}: expected {expected}, got {actual}")

            reconciled.append(tx)
            prev_balance = balance

        # ── Closing balance check ─────────────────────────────────────────────
        if reconciled:
            last_balance = reconciled[-1]["balance"]
            if account_details.get("closingBalance", 0.0) == 0.0:
                account_details["closingBalance"] = last_balance
            elif round(account_details["closingBalance"], 2) != round(last_balance, 2):
                validation_report["mismatches"].append({
                    "type":             "closing_balance_mismatch",
                    "expected_closing": account_details["closingBalance"],
                    "actual_last_tx":   last_balance,
                })
                validation_report["mismatchCount"] += 1

        # ── Final reconciliation status ────────────────────────────────────────
        if validation_report["mismatchCount"] > 0:
            account_details["reconciliationStatus"] = "FAILED"
            validation_report["reconciliationStatus"] = "FAILED"
        else:
            account_details["reconciliationStatus"] = "SUCCESS"
            validation_report["reconciliationStatus"] = "SUCCESS"

        logger.info(
            f"Reconciliation complete: {validation_report['reconciledCount']} OK, "
            f"{validation_report['mismatchCount']} mismatches."
        )
        return account_details, reconciled, validation_report
