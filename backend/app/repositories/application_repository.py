from typing import Dict, Any, List, Optional
from google.cloud.firestore import Client, SERVER_TIMESTAMP
import uuid

class ApplicationRepository:
    def __init__(self, db: Client):
        self.db = db
        self.collection = self.db.collection("applications")

    def create_application(self, app_data: Dict[str, Any]) -> str:
        app_id = str(uuid.uuid4())
        app_data["id"] = app_id
        app_data["created_at"] = SERVER_TIMESTAMP
        self.collection.document(app_id).set(app_data)
        return app_id

    def get_application(self, app_id: str) -> Optional[Dict[str, Any]]:
        doc = self.collection.document(app_id).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            if "created_at" in data and data["created_at"]:
                try:
                    data["created_at"] = data["created_at"].isoformat()
                except Exception:
                    data["created_at"] = str(data["created_at"])
            return data
        return None

    def get_all_applications(self, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        docs = self.collection.order_by("created_at", direction="DESCENDING").offset(skip).limit(limit).get()
        result = []
        for doc in docs:
            data = doc.to_dict()
            if "created_at" in data and data["created_at"]:
                try:
                    data["created_at"] = data["created_at"].isoformat()
                except Exception:
                    data["created_at"] = str(data["created_at"])
            result.append({"id": doc.id, **data})
        return result

    def update_application(self, app_id: str, updates: Dict[str, Any]) -> bool:
        doc_ref = self.collection.document(app_id)
        if doc_ref.get().exists:
            doc_ref.update(updates)
            return True
        return False

    def update_application_status(self, app_id: str, status: str) -> bool:
        return self.update_application(app_id, {"status": status})

    def get_pending_applications_count(self) -> int:
        docs = self.collection.where("status", "==", "under_review").get()
        return len(docs)

    def count_by_status(self) -> Dict[str, int]:
        docs = self.collection.get()
        counts = {"approved": 0, "rejected": 0, "under_review": 0}
        for doc in docs:
            status = doc.to_dict().get("status")
            if status in counts:
                counts[status] += 1
        return counts
