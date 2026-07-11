from typing import Dict, Any, List, Optional
from google.cloud.firestore import Client, SERVER_TIMESTAMP
import uuid

class AuditRepository:
    def __init__(self, db: Client):
        self.db = db
        self.collection = self.db.collection("audit_logs")

    def log_action(self, user_id: str, role: str, action: str, module: str, status: str = "success", metadata: Optional[Dict[str, Any]] = None, ip_address: str = "unknown", user_agent: str = "unknown") -> str:
        log_id = str(uuid.uuid4())
        data = {
            "id": log_id,
            "user_id": user_id,
            "role": role,
            "action": action,
            "module": module,
            "status": status,
            "metadata": metadata or {},
            "ip_address": ip_address,
            "user_agent": user_agent,
            "timestamp": SERVER_TIMESTAMP
        }
        self.collection.document(log_id).set(data)
        return log_id

    def get_logs(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        docs = self.collection.order_by("timestamp", direction="DESCENDING").offset(skip).limit(limit).get()
        
        result = []
        for doc in docs:
            data = doc.to_dict()
            if "timestamp" in data and data["timestamp"]:
                try:
                    data["timestamp"] = data["timestamp"].isoformat()
                except Exception:
                    data["timestamp"] = str(data["timestamp"])
            result.append({"id": doc.id, **data})
        return result
