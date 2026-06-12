import os
import sys
import logging
from PIL import Image, ImageEnhance, ImageOps
from pdf2image import convert_from_bytes
import pytesseract
from app.config import settings

logger = logging.getLogger(__name__)

# Auto-discover Tesseract on Windows
def configure_tesseract():
    if settings.TESSERACT_CMD:
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
        logger.info(f"Tesseract configured from settings: {settings.TESSERACT_CMD}")
        return

    if sys.platform.startswith("win"):
        standard_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Tesseract-OCR\tesseract.exe")
        ]
        for path in standard_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                logger.info(f"Auto-discovered Tesseract at: {path}")
                return
        logger.warning("Tesseract binary not found in standard Windows paths. OCR may fail unless configured in environment.")

configure_tesseract()

class OCRService:
    @staticmethod
    def preprocess_image(img: Image.Image) -> Image.Image:
        """
        Enhance image quality for better OCR accuracy.
        - Converts to Grayscale.
        - Resizes to increase DPI if needed.
        - Boosts Contrast and Sharpness.
        """
        try:
            # Step 1: Grayscale
            gray_img = ImageOps.grayscale(img)
            
            # Step 2: Resize for higher DPI (Upscale 2x for clearer character boundaries)
            w, h = gray_img.size
            resized_img = gray_img.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
            
            # Step 3: Enhance Contrast
            contrast_enhancer = ImageEnhance.Contrast(resized_img)
            high_contrast = contrast_enhancer.enhance(2.0)
            
            # Step 4: Enhance Sharpness
            sharpness_enhancer = ImageEnhance.Sharpness(high_contrast)
            sharpened = sharpness_enhancer.enhance(2.0)
            
            return sharpened
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}. Returning original.")
            return img

    @staticmethod
    async def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        """
        Converts PDF pages into images, processes each page, performs OCR, and returns concatenated text.
        """
        try:
            # Configure Poppler path if available
            poppler_kwargs = {}
            if settings.POPPLER_PATH and os.path.exists(settings.POPPLER_PATH):
                poppler_kwargs["poppler_path"] = settings.POPPLER_PATH
            elif sys.platform.startswith("win"):
                # Check standard local paths
                local_popplers = [r"C:\poppler\bin", r"C:\Program Files\poppler\bin", r"C:\poppler-0.68.0\bin"]
                for p in local_popplers:
                    if os.path.exists(p):
                        poppler_kwargs["poppler_path"] = p
                        logger.info(f"Auto-discovered Poppler at: {p}")
                        break
            
            logger.info("Converting PDF pages to images...")
            pages = convert_from_bytes(pdf_bytes, dpi=200, **poppler_kwargs)
            logger.info(f"Converted {len(pages)} pages to images.")
            
            extracted_pages_text = []
            for i, page_img in enumerate(pages):
                logger.info(f"Processing page {i+1}/{len(pages)}...")
                processed_img = OCRService.preprocess_image(page_img)
                
                # Perform OCR on processed image
                # HDFC statements are primarily English, so we enforce English language
                page_text = pytesseract.image_to_string(processed_img, lang="eng", config="--psm 6")
                extracted_pages_text.append(f"--- Page {i+1} ---\n{page_text}")
                
            return "\n\n".join(extracted_pages_text)
            
        except Exception as e:
            logger.error(f"OCR Pipeline failed: {e}")
            raise RuntimeError(f"OCR Extraction failure: {e}. Please ensure Tesseract and Poppler are installed.")
