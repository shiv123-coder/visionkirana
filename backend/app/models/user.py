import enum
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class RoleEnum(str, enum.Enum):
    ADMIN = "admin"
    LOAN_OFFICER = "loan_officer"
    SHOP_OWNER = "shop_owner"
    USER = "user"

class User(BaseModel):
    id: Optional[str] = None # Firestore document ID
    email: EmailStr
    full_name: Optional[str] = None
    role: RoleEnum = RoleEnum.SHOP_OWNER
    is_active: bool = True
    
    # Relationships in NoSQL are usually handled by ID references or subcollections,
    # so we don't declare them as nested objects by default.
    # shop_ids: List[str] = Field(default_factory=list)
