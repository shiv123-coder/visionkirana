from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from app.api.deps import get_current_active_user
from app.api.deps_db import get_notification_repo, NotificationRepository
from app.core.firebase import get_firestore_client
from firebase_admin import auth as firebase_auth
import logging

router = APIRouter()
@router.get("/me/notifications")
def get_user_notifications(
    skip: int = 0,
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    notif_repo: NotificationRepository = Depends(get_notification_repo)
):
    uid = current_user.get("uid") or current_user.get("id")
    if not uid:
        raise HTTPException(status_code=400, detail="User ID not found")
        
    notifications = notif_repo.get_notifications(user_id=uid, skip=skip, limit=limit)
    
    # Format times similarly to admin notifications
    for notif_data in notifications:
        created_at = notif_data.get("created_at")
        if created_at:
            if hasattr(created_at, "strftime"):
                notif_data["time"] = created_at.strftime("%Y-%m-%d %H:%M")
            else:
                notif_data["time"] = str(created_at)
        else:
            notif_data["time"] = "Just now"
            
    return notifications

@router.post("/me/notifications/{notif_id}/read")
def mark_user_notification_as_read(
    notif_id: str, 
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    notif_repo: NotificationRepository = Depends(get_notification_repo)
):
    uid = current_user.get("uid") or current_user.get("id")
    if not uid:
        raise HTTPException(status_code=400, detail="User ID not found")
        
    notif_repo.mark_as_read(notif_id, user_id=uid)
    return {"status": "success", "message": "Notification marked as read"}

@router.post("/me/notifications/read-all")
def mark_all_user_notifications_as_read(
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    notif_repo: NotificationRepository = Depends(get_notification_repo)
):
    uid = current_user.get("uid") or current_user.get("id")
    if not uid:
        raise HTTPException(status_code=400, detail="User ID not found")
        
    notif_repo.mark_all_as_read(user_id=uid)
    return {"status": "success", "message": "Notifications marked as read"}

@router.delete("/me")
def delete_user_account(
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    uid = current_user.get("uid") or current_user.get("id")
    if not uid:
        raise HTTPException(status_code=400, detail="User ID not found")
        
    try:
        db = get_firestore_client()
        
        # 1. Delete user from Firestore
        db.collection("users").document(uid).delete()
        
        # 2. Delete user from Firebase Auth
        firebase_auth.delete_user(uid)
        
        return {"status": "success", "message": "Account deleted successfully"}
    except Exception as e:
        logging.error(f"Error deleting user {uid}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
