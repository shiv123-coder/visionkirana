from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from pydantic import BaseModel
from app.api.deps import get_current_active_user, RoleChecker
from app.models.user import RoleEnum
from app.api.deps_db import (
    get_shop_repo,
    get_application_repo,
    get_notification_repo,
    get_audit_repo,
    get_user_repo,
    ShopRepository,
    ApplicationRepository,
    NotificationRepository,
    AuditRepository,
    UserRepository
)
from fastapi import Request, BackgroundTasks
from app.api.limiter import limiter
from app.tasks.notification_tasks import create_notification_task
from app.tasks.audit_tasks import log_audit_action_task

router = APIRouter()
require_shop_owner = RoleChecker([RoleEnum.SHOP_OWNER, RoleEnum.ADMIN, RoleEnum.LOAN_OFFICER, RoleEnum.USER])

class ShopRegistrationPayload(BaseModel):
    name: str
    owner_name: str
    mobile: str
    address: str
    city: str
    state: str
    category: str
    years_in_business: int
    monthly_sales: float
    requested_loan: float
    loan_purpose: str
    owner_id: str
    latitude: float | None = None
    longitude: float | None = None

@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register_shop(
    request: Request,
    payload: ShopRegistrationPayload, 
    current_user: Dict[str, Any] = Depends(require_shop_owner),
    shop_repo: ShopRepository = Depends(get_shop_repo),
    app_repo: ApplicationRepository = Depends(get_application_repo),
    notif_repo: NotificationRepository = Depends(get_notification_repo),
    audit_repo: AuditRepository = Depends(get_audit_repo),
    user_repo: UserRepository = Depends(get_user_repo),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    uid = current_user.get("uid") or current_user.get("id")
    
    # Upgrade user to shop_owner if they are just a user
    if current_user.get("role") == "user":
        user_repo.update_user(uid, {"role": "shop_owner"})
    
    shop_data = {
        "owner_id": uid,
        "shop_name": payload.name,
        "owner_name": payload.owner_name,
        "mobile": payload.mobile,
        "address": payload.address,
        "city": payload.city,
        "state": payload.state,
        "category": payload.category,
        "years_in_business": payload.years_in_business,
        "monthly_sales": payload.monthly_sales,
        "latitude": payload.latitude,
        "longitude": payload.longitude
    }
    
    shop_id = shop_repo.create_shop(shop_data)
    
    # Also create the initial loan application
    app_data = {
        "shop_id": shop_id,
        "user_id": uid,
        "requested_amount": payload.requested_loan,
        "purpose": payload.loan_purpose,
        "status": "pending_documents"
    }
    app_id = app_repo.create_application(app_data)
    
    # Generate notification asynchronously via BackgroundTasks instead of Celery
    background_tasks.add_task(
        create_notification_task,
        type="new_shop_registered",
        title="New Shop Registered",
        message=f"New shop {payload.name} registered and requested ₹{payload.requested_loan}",
        user_id="admin"
    )
    
    client_ip = getattr(request.client, 'host', 'unknown') if getattr(request, 'client', None) else 'unknown'
    user_agent = request.headers.get('user-agent', 'unknown')

    # Log audit asynchronously via BackgroundTasks instead of Celery
    background_tasks.add_task(
        log_audit_action_task,
        user_id=uid,
        role=current_user.get("role", "shop_owner"),
        action="register_shop",
        module="shops",
        metadata={"shop_id": shop_id, "application_id": app_id},
        ip_address=client_ip,
        user_agent=user_agent
    )
    
    return {"message": "Shop and application created", "shop_id": shop_id, "application_id": app_id}

@router.get("/")
def get_user_shops(
    current_user: Dict[str, Any] = Depends(require_shop_owner),
    shop_repo: ShopRepository = Depends(get_shop_repo),
    app_repo: ApplicationRepository = Depends(get_application_repo),
    skip: int = 0,
    limit: int = 50
):
    uid = current_user.get("uid") or current_user.get("id")
    role = current_user.get("role")
    
    if role == "admin" or role == "loan_officer":
        shops = shop_repo.get_all_shops(skip=skip, limit=limit)
    else:
        shops = shop_repo.get_shops_by_owner(uid, skip=skip, limit=limit)
        
    # Attach applications to each shop
    # In a real app we'd use a better query, but for now we'll fetch all apps and filter
    all_apps = app_repo.get_all_applications(skip=0, limit=1000)
    
    for shop in shops:
        shop_apps = [app for app in all_apps if app.get("shop_id") == shop["id"]]
        # Sort chronologically
        shop_apps.sort(key=lambda x: x.get("created_at") or "")
        shop["applications"] = shop_apps
        
    return shops

@router.get("/{shop_id}")
def get_shop(
    shop_id: str, 
    current_user: Dict[str, Any] = Depends(require_shop_owner),
    shop_repo: ShopRepository = Depends(get_shop_repo),
    app_repo: ApplicationRepository = Depends(get_application_repo)
):
    data = shop_repo.get_shop(shop_id)
    if not data:
        raise HTTPException(status_code=404, detail="Shop not found")
        
    uid = current_user.get("uid") or current_user.get("id")
    role = current_user.get("role")
    if role not in ["admin", "loan_officer"]:
        if data.get("owner_id") != uid:
            raise HTTPException(status_code=403, detail="Not authorized to view this shop")
            
    # Attach applications
    all_apps = app_repo.get_all_applications(skip=0, limit=1000)
    shop_apps = [app for app in all_apps if app.get("shop_id") == shop_id]
    shop_apps.sort(key=lambda x: x.get("created_at") or "")
    data["applications"] = shop_apps
    
    return data

@router.put("/{shop_id}")
def update_shop(
    shop_id: str, 
    payload: dict, 
    current_user: Dict[str, Any] = Depends(require_shop_owner),
    shop_repo: ShopRepository = Depends(get_shop_repo)
):
    data = shop_repo.get_shop(shop_id)
    if not data:
        raise HTTPException(status_code=404, detail="Shop not found")
        
    uid = current_user.get("uid") or current_user.get("id")
    role = current_user.get("role")
    if role not in ["admin", "loan_officer"]:
        if data.get("owner_id") != uid:
            raise HTTPException(status_code=403, detail="Not authorized to update this shop")

    success = shop_repo.update_shop(shop_id, payload)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update shop")
    return {"message": "Shop updated"}

@router.delete("/{shop_id}")
def delete_shop(
    shop_id: str,
    current_user: Dict[str, Any] = Depends(require_shop_owner),
    shop_repo: ShopRepository = Depends(get_shop_repo)
):
    data = shop_repo.get_shop(shop_id)
    if not data:
        raise HTTPException(status_code=404, detail="Shop not found")
        
    uid = current_user.get("uid") or current_user.get("id")
    role = current_user.get("role")
    
    # Only admin or the actual owner can delete the shop
    if role != "admin":
        if data.get("owner_id") != uid:
            raise HTTPException(status_code=403, detail="Not authorized to delete this shop")

    success = shop_repo.delete_shop(shop_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete shop")
    return {"message": "Shop deleted successfully"}

class ApplicationPayload(BaseModel):
    requested_amount: float
    purpose: str

@router.post("/{shop_id}/applications", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def apply_for_loan(
    shop_id: str,
    request: Request,
    payload: ApplicationPayload,
    current_user: Dict[str, Any] = Depends(require_shop_owner),
    shop_repo: ShopRepository = Depends(get_shop_repo),
    app_repo: ApplicationRepository = Depends(get_application_repo),
    notif_repo: NotificationRepository = Depends(get_notification_repo),
    audit_repo: AuditRepository = Depends(get_audit_repo),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    uid = current_user.get("uid") or current_user.get("id")
    role = current_user.get("role")
    
    shop_data = shop_repo.get_shop(shop_id)
    if not shop_data:
        raise HTTPException(status_code=404, detail="Shop not found")
        
    if role not in ["admin", "loan_officer"]:
        if shop_data.get("owner_id") != uid:
            raise HTTPException(status_code=403, detail="Not authorized to apply for loan for this shop")
            
    # Create new application
    app_data = {
        "shop_id": shop_id,
        "user_id": uid,
        "requested_amount": payload.requested_amount,
        "purpose": payload.purpose,
        "status": "pending_documents"
    }
    app_id = app_repo.create_application(app_data)
    
    background_tasks.add_task(
        create_notification_task,
        type="new_loan_application",
        title="New Loan Application",
        message=f"Shop '{shop_data.get('shop_name')}' requested ₹{payload.requested_amount}",
        user_id="admin"
    )
    
    client_ip = getattr(request.client, 'host', 'unknown') if getattr(request, 'client', None) else 'unknown'
    user_agent = request.headers.get('user-agent', 'unknown')

    background_tasks.add_task(
        log_audit_action_task,
        user_id=uid,
        role=current_user.get("role", "shop_owner"),
        action="create_application",
        module="applications",
        metadata={"shop_id": shop_id, "application_id": app_id},
        ip_address=client_ip,
        user_agent=user_agent
    )
    
    return {"message": "Application created successfully", "application_id": app_id}
