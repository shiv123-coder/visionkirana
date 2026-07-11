from typing import Dict, Any, List, Optional
from google.cloud.firestore import Client, SERVER_TIMESTAMP
import uuid
from app.utils.encryption import encrypt_pii, decrypt_pii

def _decrypt_shop_data(data: Dict[str, Any]) -> Dict[str, Any]:
    if "mobile" in data:
        data["mobile"] = decrypt_pii(data["mobile"])
    if "address" in data:
        data["address"] = decrypt_pii(data["address"])
    
    if "created_at" in data and data["created_at"]:
        try:
            data["created_at"] = data["created_at"].isoformat()
        except Exception:
            data["created_at"] = str(data["created_at"])
            
    return data

class ShopRepository:
    def __init__(self, db: Client):
        self.db = db
        self.collection = self.db.collection("shops")

    def create_shop(self, shop_data: Dict[str, Any]) -> str:
        shop_id = str(uuid.uuid4())
        shop_data["id"] = shop_id
        shop_data["created_at"] = SERVER_TIMESTAMP
        
        if "mobile" in shop_data:
            shop_data["mobile"] = encrypt_pii(shop_data["mobile"])
        if "address" in shop_data:
            shop_data["address"] = encrypt_pii(shop_data["address"])
            
        self.collection.document(shop_id).set(shop_data)
        return shop_id

    def get_shop(self, shop_id: str) -> Optional[Dict[str, Any]]:
        doc = self.collection.document(shop_id).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            return _decrypt_shop_data(data)
        return None

    def get_all_shops(self, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        query = self.collection.order_by("created_at").offset(skip).limit(limit)
        docs = query.get()
        return [_decrypt_shop_data({"id": doc.id, **doc.to_dict()}) for doc in docs]

    def get_shops_by_owner(self, owner_id: str, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        query = self.collection.where("owner_id", "==", owner_id)
        docs = list(query.stream())
        
        # Sort in memory to avoid requiring a Firestore composite index
        sorted_docs = sorted(docs, key=lambda doc: doc.to_dict().get("created_at") or 0)
        
        # Apply skip and limit
        paginated_docs = sorted_docs[skip : skip + limit] if limit else sorted_docs[skip:]
        
        return [_decrypt_shop_data({"id": doc.id, **doc.to_dict()}) for doc in paginated_docs]

    def update_shop(self, shop_id: str, updates: Dict[str, Any]) -> bool:
        doc_ref = self.collection.document(shop_id)
        if doc_ref.get().exists:
            if "mobile" in updates:
                updates["mobile"] = encrypt_pii(updates["mobile"])
            if "address" in updates:
                updates["address"] = encrypt_pii(updates["address"])
            doc_ref.update(updates)
            return True
        return False

    def delete_shop(self, shop_id: str) -> bool:
        doc_ref = self.collection.document(shop_id)
        if doc_ref.get().exists:
            doc_ref.delete()
            return True
        return False
