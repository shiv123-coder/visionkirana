from typing import Dict, Any
from google.cloud.firestore import Client, SERVER_TIMESTAMP
import uuid

class DemoRequestRepository:
    def __init__(self, db: Client):
        self.db = db
        self.collection = self.db.collection("demo_requests")

    def create_request(self, data: Dict[str, Any]) -> str:
        req_id = str(uuid.uuid4())
        data["id"] = req_id
        data["created_at"] = SERVER_TIMESTAMP
        self.collection.document(req_id).set(data)
        return req_id

    def get_all_requests(self, skip: int = 0, limit: int = 50) -> list:
        docs = self.collection.get()
        result = []
        for doc in docs:
            data = doc.to_dict()
            if "created_at" in data and data["created_at"]:
                try:
                    data["created_at"] = data["created_at"].isoformat()
                except Exception:
                    data["created_at"] = str(data["created_at"])
            else:
                data["created_at"] = ""
            result.append({"id": doc.id, **data})
            
        result.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return result[skip:skip+limit]

    def update_request_status(self, req_id: str, status: str) -> bool:
        doc_ref = self.collection.document(req_id)
        doc = doc_ref.get()
        if doc.exists:
            doc_ref.update({"status": status})
            return True
        return False

    def delete_request(self, req_id: str) -> bool:
        doc_ref = self.collection.document(req_id)
        if doc_ref.get().exists:
            doc_ref.delete()
            return True
        return False
