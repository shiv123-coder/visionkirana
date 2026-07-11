import logging
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import Request
from app.core.firebase import get_firestore_client
from firebase_admin import firestore

def log_audit_action(
    request: Request,
    user_id: str,
    role: str,
    action: str,
    module: str,
    status: str = "success",
    metadata: Optional[Dict[str, Any]] = None
):
    """
    Logs an audit action to Firestore.
    """
    try:
        db = get_firestore_client()
        if not db:
            logging.error("Firestore client not available for audit logging")
            return

        client_ip = getattr(request.client, 'host', 'unknown') if getattr(request, 'client', None) else 'unknown'
        user_agent = request.headers.get('user-agent', 'unknown')

        audit_doc = {
            "user_id": user_id,
            "role": role,
            "action": action,
            "module": module,
            "status": status,
            "ip_address": client_ip,
            "user_agent": user_agent,
            "timestamp": firestore.SERVER_TIMESTAMP,
            "metadata": metadata or {}
        }
        
        db.collection("audit_logs").add(audit_doc)
        
    except Exception as e:
        logging.error(f"Failed to write audit log: {str(e)}")
