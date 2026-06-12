import logging
import fitz  # PyMuPDF
import pdfplumber
from io import BytesIO
from app.services.ocr_service import OCRService

logger = logging.getLogger(__name__)

class PDFParserService:
    @staticmethod
    async def extract_raw_text(pdf_bytes: bytes) -> str:
        """
        Extracts text from PDF bytes.
        First tries text-based extraction via pdfplumber and fitz.
        Falls back to OCR if the extracted text is empty or too short (scanned PDF).
        """
        logger.info("Initiating PDF text extraction...")
        
        # Try digital text extraction first
        digital_text = ""
        try:
            with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
                pages_text = []
                for i, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    if text:
                        pages_text.append(f"--- Page {i+1} ---\n{text}")
                digital_text = "\n\n".join(pages_text)
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed: {e}. Trying PyMuPDF.")
            
        # Try PyMuPDF if pdfplumber extracted nothing
        if not digital_text.strip():
            try:
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                pages_text = []
                for i, page in enumerate(doc):
                    text = page.get_text()
                    if text:
                        pages_text.append(f"--- Page {i+1} ---\n{text}")
                digital_text = "\n\n".join(pages_text)
            except Exception as e:
                logger.error(f"PyMuPDF extraction failed: {e}")
        
        # Check text length to determine if it is scanned
        char_count = len(digital_text.strip())
        logger.info(f"Digitally extracted text length: {char_count} characters.")
        
        # If text is too short or non-existent, run OCR
        # Standard bank statements contain thousands of characters. Anything less than 150 chars overall is likely scanned.
        if char_count < 150:
            logger.info("PDF detected as scanned or image-only. Routing to OCR Pipeline.")
            ocr_text = await OCRService.extract_text_from_pdf(pdf_bytes)
            return ocr_text
            
        logger.info("PDF successfully parsed as a machine-readable (digital) text PDF.")
        return digital_text
