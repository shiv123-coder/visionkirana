from typing import Optional
from pydantic import BaseModel

class VoiceTranscript(BaseModel):
    id: Optional[str] = None
    application_id: str
    file_url: str
    transcript_text: Optional[str] = None
    sentiment_score: Optional[str] = None
    business_summary: Optional[str] = None
    loan_purpose: Optional[str] = None
    challenges: Optional[str] = None
    future_plans: Optional[str] = None
