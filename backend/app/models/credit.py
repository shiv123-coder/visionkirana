from typing import Optional, Dict, Any
from pydantic import BaseModel

class CreditScore(BaseModel):
    id: Optional[str] = None
    application_id: str
    final_score: float
    risk_category: str
    features_used: Optional[Dict[str, Any]] = None
