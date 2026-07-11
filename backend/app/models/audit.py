from typing import Optional
from pydantic import BaseModel

class AuditLog(BaseModel):
    id: Optional[str] = None
    user_id: str
    action: str
    target_resource: str
    target_id: Optional[str] = None
    ip_address: Optional[str] = None
