from typing import Optional, Dict, Any
from pydantic import BaseModel

class ImageAnalysisResult(BaseModel):
    id: Optional[str] = None
    evidence_file_id: str
    shelf_density_score: Optional[float] = None
    brand_diversity_score: Optional[float] = None
    analysis_metadata: Optional[Dict[str, Any]] = None

class OcrResult(BaseModel):
    id: Optional[str] = None
    evidence_file_id: str
    extracted_text: Optional[str] = None
    total_amount_found: Optional[float] = None
    merchant_name_found: Optional[str] = None
    confidence_score: Optional[float] = None
    invoice_activity_score: Optional[float] = None
    transaction_consistency_score: Optional[float] = None
