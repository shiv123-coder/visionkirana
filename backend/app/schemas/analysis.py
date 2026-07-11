from pydantic import BaseModel
from typing import Optional, Any, List

class ImageAnalysisResponse(BaseModel):
    id: int
    evidence_file_id: int
    shelf_density_score: Optional[float]
    brand_diversity_score: Optional[float]
    analysis_metadata: Optional[Any]
    
    class Config:
        from_attributes = True

class OcrResultResponse(BaseModel):
    id: int
    evidence_file_id: int
    extracted_text: Optional[str]
    total_amount_found: Optional[float]
    merchant_name_found: Optional[str]
    confidence_score: Optional[float]
    invoice_activity_score: Optional[float]
    transaction_consistency_score: Optional[float]
    
    class Config:
        from_attributes = True

class VoiceTranscriptResponse(BaseModel):
    id: int
    file_url: str
    transcript_text: Optional[str]
    sentiment_score: Optional[str]
    business_summary: Optional[str]
    loan_purpose: Optional[str]
    challenges: Optional[str]
    future_plans: Optional[str]

    class Config:
        from_attributes = True

class ApplicationAnalysisResponse(BaseModel):
    application_id: int
    image_analyses: List[ImageAnalysisResponse]
    ocr_results: List[OcrResultResponse]
    voice_transcripts: List[VoiceTranscriptResponse]
