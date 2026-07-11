from fastapi import APIRouter, Depends, BackgroundTasks
from app.api.deps import get_current_active_admin
import httpx
from app.core.config import settings
import cloudinary.api
from firebase_admin import firestore

router = APIRouter()

@router.get("/status")
def get_system_status():
    status = {
        "database": "unknown",
        "ml_service": "unknown",
        "cloudinary": "unknown"
    }

    # 1. Check Database (Firestore)
    try:
        db = firestore.client()
        # Just list collections to verify connection
        collections = db.collections()
        next(collections, None)
        status["database"] = "healthy"
    except Exception:
        status["database"] = "unhealthy"

    # 2. Check ML Service
    try:
        response = httpx.get(f"{settings.ML_API_BASE_URL}/health", timeout=5.0)
        if response.status_code == 200:
            status["ml_service"] = "healthy"
        else:
            status["ml_service"] = "unhealthy"
    except Exception:
        status["ml_service"] = "unreachable"

    # 3. Check Cloudinary
    try:
        cloudinary.api.ping()
        status["cloudinary"] = "healthy"
    except Exception:
        status["cloudinary"] = "unhealthy"

    overall_health = "healthy" if all(v == "healthy" for v in status.values()) else "degraded"
    
    return {
        "status": overall_health,
        "services": status
    }

from pydantic import BaseModel
from typing import Optional
from app.api.deps_db import (
    get_demo_request_repo,
    get_notification_repo,
    DemoRequestRepository,
    NotificationRepository
)
from app.tasks.notification_tasks import create_notification_task

class DemoRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    company: str

@router.post("/demo-requests")
def submit_demo_request(
    request: DemoRequest,
    background_tasks: BackgroundTasks,
    demo_repo: DemoRequestRepository = Depends(get_demo_request_repo),
    notif_repo: NotificationRepository = Depends(get_notification_repo)
):
    """
    Unauthenticated endpoint to submit a demo/API access request.
    """
    # 1. Save to demo_requests
    demo_data = {
        "first_name": request.first_name,
        "last_name": request.last_name,
        "email": request.email,
        "company": request.company,
        "status": "pending"
    }
    demo_repo.create_request(demo_data)
    
    # 2. Create an admin notification asynchronously
    background_tasks.add_task(
        notif_repo.create_notification,
        type="info",
        title="New Demo Request",
        message=f"A new API access request has been submitted by {request.first_name} from {request.company}.",
        user_id="admin"
    )
    
    return {"status": "success", "message": "Demo request submitted successfully."}
