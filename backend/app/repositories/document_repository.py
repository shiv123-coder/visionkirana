from typing import Dict, Any, Optional, List
from google.cloud.firestore import Client, SERVER_TIMESTAMP
import uuid

class DocumentRepository:
    def __init__(self, db: Client):
        self.db = db
        self.collection = self.db.collection("evidence_files")

    def create_document(self, doc_data: Dict[str, Any]) -> str:
        doc_id = str(uuid.uuid4())
        doc_data["id"] = doc_id
        doc_data["created_at"] = SERVER_TIMESTAMP
        self.collection.document(doc_id).set(doc_data)
        return doc_id

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        doc = self.collection.document(doc_id).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None

    def get_documents_by_application(self, application_id: str) -> List[Dict[str, Any]]:
        docs = self.collection.where("application_id", "==", application_id).get()
        return [{"id": doc.id, **doc.to_dict()} for doc in docs]
