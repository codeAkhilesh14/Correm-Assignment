import os
import shutil
import uuid
import logging
from fastapi import UploadFile
from app.config import settings

logger = logging.getLogger(__name__)

class StorageService:
    @staticmethod
    async def upload_file(file: UploadFile) -> str:
        """
        Uploads a PDF file strictly to the local uploads directory.
        Returns a relative API endpoint path that our FastAPI server serves.
        """
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        local_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        try:
            # Ensure folder exists
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            
            # Reset file cursor and copy stream
            await file.seek(0)
            with open(local_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            logger.info(f"Saved statement locally to {local_path}.")
            return f"/api/statements/files/{unique_filename}"
        except Exception as e:
            logger.error(f"Failed to save file locally: {e}")
            raise RuntimeError(f"Local storage upload failure: {e}")

    @staticmethod
    def delete_file(file_url: str):
        """
        Deletes the statement file from local storage.
        """
        if not file_url:
            return
            
        if "/api/statements/files/" in file_url:
            filename = file_url.split("/")[-1]
            local_path = os.path.join(settings.UPLOAD_DIR, filename)
            if os.path.exists(local_path):
                try:
                    os.remove(local_path)
                    logger.info(f"Deleted local file: {local_path}")
                except Exception as e:
                    logger.error(f"Failed to delete local file {local_path}: {e}")
        else:
            # Fallback path parsing in case absolute disk path was stored
            if os.path.exists(file_url):
                try:
                    os.remove(file_url)
                    logger.info(f"Deleted local file: {file_url}")
                except Exception as e:
                    logger.error(f"Failed to delete local file {file_url}: {e}")
