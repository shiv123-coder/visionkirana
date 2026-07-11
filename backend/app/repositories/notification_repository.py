from typing import Dict, Any, List
from google.cloud.firestore import Client, SERVER_TIMESTAMP
import uuid

class NotificationRepository:
    def __init__(self, db: Client):
        self.db = db
        self.collection = self.db.collection("admin_notifications")

    def create_notification(self, type: str, title: str, message: str, user_id: str = "admin") -> str:
        notif_id = str(uuid.uuid4())
        data = {
            "id": notif_id,
            "type": type,
            "title": title,
            "message": message,
            "read": False,
            "created_at": SERVER_TIMESTAMP,
            "user_id": user_id
        }
        self.collection.document(notif_id).set(data)
        return notif_id

    def get_notifications(self, user_id: str = "admin", skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        docs = self.collection.where("user_id", "==", user_id).get()
        
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

    def mark_as_read(self, notif_id: str, user_id: str = "admin") -> bool:
        doc_ref = self.collection.document(notif_id)
        doc = doc_ref.get()
        if doc.exists and doc.to_dict().get("user_id") == user_id:
            doc_ref.update({"read": True})
            return True
        return False

    def mark_all_as_read(self, user_id: str = "admin"):
        docs = self.collection.where("user_id", "==", user_id).where("read", "==", False).get()
        batch = self.db.batch()
        for doc in docs:
            batch.update(doc.reference, {"read": True})
        batch.commit()

    def delete_notification(self, notif_id: str, user_id: str = "admin") -> bool:
        doc_ref = self.collection.document(notif_id)
        doc = doc_ref.get()
        if doc.exists and doc.to_dict().get("user_id") == user_id:
            doc_ref.delete()
            return True
        return False
