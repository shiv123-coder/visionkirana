from app.worker import celery_app
from app.core.firebase import get_firestore_client
from app.repositories.audit_repository import AuditRepository
from typing import Optional, Dict, Any

@celery_app.task(name="log_audit_action_task")
def log_audit_action_task(
    user_id: str, 
    role: str, 
    action: str, 
    module: str, 
    metadata: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """
    Asynchronously creates an audit log in Firestore.
    """
    db = get_firestore_client()
    repo = AuditRepository(db)
    
    repo.log_action(
        user_id=user_id,
        role=role,
        action=action,
        module=module,
        metadata=metadata,
        ip_address=ip_address,
        user_agent=user_agent
    )
    return {"status": "success", "message": f"Audit log for {action} created."}
