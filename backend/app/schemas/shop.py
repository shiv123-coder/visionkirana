from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class ApplicationStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class ShopRegistrationRequest(BaseModel):
    # Shop fields
    name: str = Field(..., min_length=2, max_length=100)
    owner_name: str = Field(..., min_length=2, max_length=100)
    mobile: str = Field(..., min_length=10, max_length=15)
    address: str = Field(..., min_length=5, max_length=255)
    city: str = Field(..., min_length=2, max_length=50)
    state: str = Field(..., min_length=2, max_length=50)
    category: str = Field(..., min_length=2, max_length=50)
    years_in_business: int = Field(..., ge=0)
    monthly_sales: float = Field(..., ge=0)
    
    # Application fields (optional initially, but required for this flow)
    requested_loan: float = Field(..., gt=0)
    loan_purpose: str = Field(..., min_length=5, max_length=500)

class ShopUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    owner_name: Optional[str] = Field(None, min_length=2, max_length=100)
    mobile: Optional[str] = Field(None, min_length=10, max_length=15)
    address: Optional[str] = Field(None, min_length=5, max_length=255)
    city: Optional[str] = Field(None, min_length=2, max_length=50)
    state: Optional[str] = Field(None, min_length=2, max_length=50)
    category: Optional[str] = Field(None, min_length=2, max_length=50)
    years_in_business: Optional[int] = Field(None, ge=0)
    monthly_sales: Optional[float] = Field(None, ge=0)
    
    # Optional application update if draft
    requested_loan: Optional[float] = Field(None, gt=0)
    loan_purpose: Optional[str] = Field(None, min_length=5, max_length=500)

class ApplicationResponse(BaseModel):
    id: int
    status: ApplicationStatus
    requested_amount: float
    purpose: Optional[str] = None
    
    class Config:
        from_attributes = True

class ShopResponse(BaseModel):
    id: int
    name: str
    owner_name: str
    mobile: str
    address: str
    city: str
    state: str
    category: str
    years_in_business: int
    monthly_sales: float
    
    class Config:
        from_attributes = True

class ShopDetailResponse(ShopResponse):
    applications: List[ApplicationResponse] = []
    
    class Config:
        from_attributes = True

class RegistrationResponse(BaseModel):
    shop: ShopResponse
    application_id: int
