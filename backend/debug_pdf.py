"""Diagnostic: show PDF transaction lines, ASCII safe."""
import sys, os
sys.path.insert(0, ".")
import pdfplumber
from pathlib import Path

UPLOADS = Path("uploads")

for pdf_file in sorted(UPLOADS.glob("*.pdf"), key=lambda f: f.stat().st_size, reverse=True)[:1]:
    print(f"FILE: {pdf_file.name} ({pdf_file.stat().st_size} bytes)")
    with pdfplumber.open(pdf_file) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                lines = text.split('\n')
                print(f"\n--- Page {i+1} ({len(lines)} lines) ---")
                for j, line in enumerate(lines):
                    safe = line.encode('ascii', errors='replace').decode('ascii')
                    print(f"  L{j+1:03d}: {safe!r}")
