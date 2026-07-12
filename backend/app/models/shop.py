from typing import Optional, List
from pydantic import BaseModel

class Shop(BaseModel):
    id: Optional[str] = None
    owner_id: str
    name: str
    owner_name: str
    mobile: str
    address: str
    city: str
    state: str
    category: str
    years_in_business: int
    monthly_sales: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gst_number: Optional[str] = None
    
    # In Firestore, we generally handle relations by queries, not nested objects
    # but we can store ID arrays if needed.
    # application_ids: List[str] = []
