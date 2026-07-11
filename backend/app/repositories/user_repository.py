from typing import Dict, Any, List, Optional
from google.cloud.firestore import Client, SERVER_TIMESTAMP

class UserRepository:
    def __init__(self, db: Client):
        self.db = db
        self.collection = self.db.collection("users")

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        doc = self.collection.document(user_id).get()
        if doc.exists:
            data = doc.to_dict()
            data["uid"] = doc.id
            if "created_at" in data and data["created_at"]:
                try:
                    data["created_at"] = data["created_at"].isoformat()
                except Exception:
                    data["created_at"] = str(data["created_at"])
            return data
        return None

    def get_all_users(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        docs = self.collection.offset(skip).limit(limit).get()
        result = []
        for doc in docs:
            data = doc.to_dict()
            if "created_at" in data and data["created_at"]:
                try:
                    data["created_at"] = data["created_at"].isoformat()
                except Exception:
                    data["created_at"] = str(data["created_at"])
            result.append({"uid": doc.id, **data})
        return result

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> bool:
        doc_ref = self.collection.document(user_id)
        if doc_ref.get().exists:
            doc_ref.update(updates)
            return True
        return False
