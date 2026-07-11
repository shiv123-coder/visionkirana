from typing import Optional
from pydantic import BaseModel
import enum
from datetime import datetime

class FileTypeEnum(str, enum.Enum):
    SHOP_FRONT = "shop_front"
    INVENTORY = "inventory"
    INVOICE = "invoice"
    RECEIPT = "receipt"
    OTHER = "other"

class EvidenceFile(BaseModel):
    id: Optional[str] = None
    shop_id: Optional[str] = None
    application_id: Optional[str] = None
    uploaded_by: Optional[str] = None
    
    file_name: Optional[str] = None
    file_type: FileTypeEnum
    storage_provider: str = "cloudinary"
    storage_url: str
    storage_public_id: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    processing_status: str = "pending"
    created_at: Optional[datetime] = None
