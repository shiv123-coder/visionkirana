from typing import Dict, Any, List, Optional
from google.cloud.firestore import Client, SERVER_TIMESTAMP
import uuid

class ReportRepository:
    def __init__(self, db: Client):
        self.db = db
        self.collection = self.db.collection("reports")

    def get_report_by_application(self, application_id: str) -> Optional[Dict[str, Any]]:
        docs = self.collection.where("application_id", "==", application_id).limit(1).get()
        if docs:
            data = docs[0].to_dict()
            data["id"] = docs[0].id
            return data
        return None
