from typing import Optional
from pydantic import BaseModel
import enum

class ApplicationStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class Application(BaseModel):
    id: Optional[str] = None
    shop_id: str
    user_id: str
    status: ApplicationStatus = ApplicationStatus.DRAFT
    requested_amount: float
    purpose: Optional[str] = None
