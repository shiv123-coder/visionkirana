import cloudinary
import cloudinary.uploader
from typing import BinaryIO, Dict, Any
from app.core.config import settings
from app.services.storage.base import StorageProvider
import logging

logger = logging.getLogger(__name__)

class CloudinaryStorage(StorageProvider):
    def __init__(self):
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )

    def upload_file(self, file_obj: BinaryIO, filename: str, content_type: str, folder: str) -> Dict[str, Any]:
        try:
            result = cloudinary.uploader.upload(
                file_obj,
                folder=folder,
                resource_type="auto"
            )
            return {
                "url": result.get("secure_url"),
                "public_id": result.get("public_id"),
                "size": result.get("bytes"),
                "format": result.get("format")
            }
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {str(e)}")
            raise e

    def delete_file(self, public_id: str) -> bool:
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get('result') == 'ok'
        except Exception as e:
            logger.error(f"Cloudinary delete failed: {str(e)}")
            return False
