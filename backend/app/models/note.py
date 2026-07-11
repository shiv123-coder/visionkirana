from typing import Optional
from pydantic import BaseModel

class OfficerNote(BaseModel):
    id: Optional[str] = None
    application_id: str
    officer_id: str
    note_text: str
