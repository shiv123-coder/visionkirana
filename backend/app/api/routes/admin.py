from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
import firebase_admin.auth as auth
from typing import Dict, Any, List
from app.api.deps import RoleChecker
from app.models.user import RoleEnum
from app.api.deps_db import (
    get_user_repo,
    get_shop_repo,
    get_application_repo,
    get_audit_repo,
    get_notification_repo,
    get_demo_request_repo,
    UserRepository,
    ShopRepository,
    ApplicationRepository,
    AuditRepository,
    NotificationRepository,
    DemoRequestRepository
)

router = APIRouter()
require_admin = RoleChecker([RoleEnum.ADMIN])
require_admin_or_officer = RoleChecker([RoleEnum.ADMIN, RoleEnum.LOAN_OFFICER])

@router.get("/dashboard-stats")
def get_dashboard_stats(
    current_user: Dict[str, Any] = Depends(require_admin_or_officer),
    user_repo: UserRepository = Depends(get_user_repo),
    shop_repo: ShopRepository = Depends(get_shop_repo),
    app_repo: ApplicationRepository = Depends(get_application_repo)
):
    """
    Returns KPIs for the Admin Dashboard.
    """
    users = user_repo.get_all_users(limit=1000)
    shops = shop_repo.get_all_shops()
    apps = app_repo.get_all_applications(limit=1000)
    
    total_users = len(users)
    total_shops = len(shops)
    
    high_risk = 0
    total_disbursed = 0
    pending_queue = 0
    approved_this_week = 0
    missing_documents = 0
    priority_actions = []
    
    # Aggregation dictionaries
    growth_dict = {}
    
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    one_week_ago = now - timedelta(days=7)
    risk_dict = {"Low Risk": 0, "Medium Risk": 0, "High Risk": 0, "Very High Risk": 0}
    
    for app in apps:
        status = app.get("status")
        req_amount = app.get("requested_amount", 0)
        risk_category = app.get("risk_category", "Medium Risk")
        created_at = app.get("created_at")
        
        # Risk Aggregation
        if risk_category in risk_dict:
            risk_dict[risk_category] += 1
        else:
            risk_dict["Medium Risk"] += 1
            
        if risk_category in ["High Risk", "Very High Risk"]:
            high_risk += 1
            
        if status == "approved":
            total_disbursed += req_amount

        # Compute Loan Officer metrics
        parsed_date = None
        if isinstance(created_at, str):
            try:
                parsed_date = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                if parsed_date.tzinfo is None:
                    parsed_date = parsed_date.replace(tzinfo=timezone.utc)
            except Exception:
                pass

        if status == "pending":
            pending_queue += 1
            if risk_category in ["High Risk", "Very High Risk"] and len(priority_actions) < 4:
                priority_actions.append({"id": app.get("id"), "risk_category": risk_category})
        elif status == "approved":
            if parsed_date and parsed_date > one_week_ago:
                approved_this_week += 1
        elif status == "document_missing" or status == "action_required":
            missing_documents += 1
            
        # Growth Aggregation (by month)
        if created_at:
            month_name = None
            if isinstance(created_at, str):
                try:
                    from datetime import datetime
                    created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                except Exception:
                    pass
            
            if hasattr(created_at, "strftime"):
                month_name = created_at.strftime("%b")
                
            if month_name:
                if month_name not in growth_dict:
                    growth_dict[month_name] = {"applications": 0, "disbursed": 0}
                growth_dict[month_name]["applications"] += 1
                if status == "approved":
                    growth_dict[month_name]["disbursed"] += req_amount
                
    # Format for charts
    risk_data = [{"name": k, "value": v} for k, v in risk_dict.items()]
    
    months_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    growth_data = []
    for m in months_order:
        if m in growth_dict:
            growth_data.append({
                "name": m, 
                "applications": growth_dict[m]["applications"],
                "disbursed": growth_dict[m]["disbursed"]
            })

    return {
        "total_users": total_users,
        "total_shops": total_shops,
        "total_applications": len(apps),
        "total_disbursed": total_disbursed,
        "high_risk_flagged": high_risk,
        "growth_data": growth_data,
        "risk_data": risk_data,
        "pending_queue": pending_queue,
        "approved_this_week": approved_this_week,
        "missing_documents": missing_documents,
        "priority_actions": priority_actions
    }

@router.get("/audit-logs")
def get_audit_logs(
    skip: int = 0,
    limit: int = 50, 
    current_user: Dict[str, Any] = Depends(require_admin),
    audit_repo: AuditRepository = Depends(get_audit_repo)
):
    logs = audit_repo.get_logs(skip=skip, limit=limit)
    return {"logs": logs}

@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(require_admin_or_officer),
    user_repo: UserRepository = Depends(get_user_repo)
):
    return user_repo.get_all_users(skip=skip, limit=limit)

@router.get("/applications")
def get_all_applications(
    skip: int = 0,
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(require_admin_or_officer),
    app_repo: ApplicationRepository = Depends(get_application_repo)
):
    return app_repo.get_all_applications(skip=skip, limit=limit)

@router.get("/notifications")
def get_all_notifications(
    skip: int = 0,
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(require_admin_or_officer),
    notif_repo: NotificationRepository = Depends(get_notification_repo)
):
    notifications = notif_repo.get_notifications(user_id="admin", skip=skip, limit=limit)
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

@router.post("/notifications/{notif_id}/read")
def mark_notification_as_read(
    notif_id: str, 
    current_user: Dict[str, Any] = Depends(require_admin_or_officer),
    notif_repo: NotificationRepository = Depends(get_notification_repo)
):
    notif_repo.mark_as_read(notif_id, user_id="admin")
    return {"status": "success", "message": "Notification marked as read"}

@router.post("/notifications/read-all")
def mark_all_notifications_as_read(
    current_user: Dict[str, Any] = Depends(require_admin_or_officer),
    notif_repo: NotificationRepository = Depends(get_notification_repo)
):
    notif_repo.mark_all_as_read(user_id="admin")
    return {"status": "success", "message": "Notifications marked as read"}

@router.delete("/notifications/{notif_id}")
def delete_notification(
    notif_id: str, 
    current_user: Dict[str, Any] = Depends(require_admin_or_officer),
    notif_repo: NotificationRepository = Depends(get_notification_repo)
):
    success = notif_repo.delete_notification(notif_id, user_id="admin")
    if success:
        return {"status": "success", "message": "Notification deleted"}
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Notification not found")

from pydantic import BaseModel

class DemoRequestStatusUpdate(BaseModel):
    status: str

@router.get("/demo-requests")
def get_all_demo_requests(
    skip: int = 0,
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(require_admin),
    demo_repo: DemoRequestRepository = Depends(get_demo_request_repo)
):
    return demo_repo.get_all_requests(skip=skip, limit=limit)

@router.patch("/demo-requests/{req_id}")
def update_demo_request_status(
    req_id: str,
    payload: DemoRequestStatusUpdate,
    current_user: Dict[str, Any] = Depends(require_admin),
    demo_repo: DemoRequestRepository = Depends(get_demo_request_repo)
):
    success = demo_repo.update_request_status(req_id, payload.status)
    if success:
        return {"status": "success", "message": f"Demo request marked as {payload.status}"}
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Demo request not found")

@router.delete("/demo-requests/{req_id}")
def delete_demo_request(
    req_id: str,
    current_user: Dict[str, Any] = Depends(require_admin),
    demo_repo: DemoRequestRepository = Depends(get_demo_request_repo)
):
    success = demo_repo.delete_request(req_id)
    if success:
        return {"status": "success", "message": "Demo request deleted"}
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Demo request not found")

class UserRoleUpdate(BaseModel):
    role: str

@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    payload: UserRoleUpdate,
    current_user: Dict[str, Any] = Depends(require_admin),
    user_repo: UserRepository = Depends(get_user_repo)
):
    try:
        new_role = RoleEnum(payload.role)
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid role specified")
        
    try:
        # Update custom claims in Firebase Auth
        auth.set_custom_user_claims(user_id, {"role": new_role.value})
        
        # Update role in Firestore
        success = user_repo.update_user(user_id, {"role": new_role.value})
        if success:
            return {"status": "success", "message": f"User role updated to {payload.role}"}
        
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found in Firestore")
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Failed to update user role: {str(e)}")

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str

@router.post("/users")
def create_user(
    payload: UserCreate,
    current_user: Dict[str, Any] = Depends(require_admin),
    user_repo: UserRepository = Depends(get_user_repo),
    audit_repo: AuditRepository = Depends(get_audit_repo)
):
    try:
        new_role = RoleEnum(payload.role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role specified")
        
    try:
        # Create user in Firebase Auth
        user_record = auth.create_user(
            email=payload.email,
            password=payload.password,
            display_name=payload.full_name
        )
        # Create user in Firestore
        from datetime import datetime, timezone
        user_data = {
            "email": payload.email,
            "full_name": payload.full_name,
            "role": new_role.value,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        # Assuming user_repo has a way to create or set a document by ID. 
        # Actually user_repo.update_user with merge might work, but let's use the underlying db
        user_repo.collection.document(user_record.uid).set(user_data)
        
        # Log action
        audit_repo.log_action(
            action="CREATE_USER",
            user_id=current_user.get("uid"),
            user_email=current_user.get("email"),
            details=f"Created new {payload.role}: {payload.email}"
        )
        return {"status": "success", "message": f"User {payload.email} created successfully", "uid": user_record.uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create user: {str(e)}")

class UserStatusUpdate(BaseModel):
    is_active: bool

@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    current_user: Dict[str, Any] = Depends(require_admin),
    user_repo: UserRepository = Depends(get_user_repo),
    audit_repo: AuditRepository = Depends(get_audit_repo)
):
    if user_id == current_user.get("uid"):
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
        
    try:
        # Update Firebase Auth
        auth.update_user(user_id, disabled=not payload.is_active)
        
        # Update Firestore
        success = user_repo.update_user(user_id, {"is_active": payload.is_active})
        if not success:
            raise HTTPException(status_code=404, detail="User not found in database")
            
        status_str = "Activated" if payload.is_active else "Deactivated"
        
        audit_repo.log_action(
            action="UPDATE_USER_STATUS",
            user_id=current_user.get("uid"),
            user_email=current_user.get("email"),
            details=f"{status_str} user {user_id}"
        )
        return {"status": "success", "message": f"User successfully {status_str.lower()}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update user status: {str(e)}")

class UserPasswordUpdate(BaseModel):
    new_password: str

@router.patch("/users/{user_id}/password")
def update_user_password(
    user_id: str,
    payload: UserPasswordUpdate,
    current_user: Dict[str, Any] = Depends(require_admin),
    audit_repo: AuditRepository = Depends(get_audit_repo)
):
    try:
        auth.update_user(user_id, password=payload.new_password)
        
        audit_repo.log_action(
            action="RESET_PASSWORD",
            user_id=current_user.get("uid"),
            user_email=current_user.get("email"),
            details=f"Reset password for user {user_id}"
        )
        return {"status": "success", "message": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to reset password: {str(e)}")
