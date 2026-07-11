from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.api.deps import get_current_active_user, RoleChecker
from app.models.user import RoleEnum
from app.api.deps_db import (
    get_application_repo,
    get_notification_repo,
    get_audit_repo,
    ApplicationRepository,
    NotificationRepository,
    AuditRepository
)
from fastapi import Request, BackgroundTasks
from datetime import datetime
from google.cloud.firestore import SERVER_TIMESTAMP
from app.tasks.notification_tasks import create_notification_task
from app.tasks.audit_tasks import log_audit_action_task

router = APIRouter()

@router.post("/trigger/{application_id}")
def trigger_analysis(
    application_id: str,
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    app_repo: ApplicationRepository = Depends(get_application_repo),
    notif_repo: NotificationRepository = Depends(get_notification_repo),
    audit_repo: AuditRepository = Depends(get_audit_repo),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Triggers the ML Analysis pipeline for a specific application.
    """
    uid = current_user.get("uid") or current_user.get("id")
    
    app_data = app_repo.get_application(application_id)
    
    if not app_data:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if app_data.get("user_id") != uid and current_user.get("role") not in ["admin", "loan_officer"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Update status to processing
    app_repo.update_application(application_id, {
        "status": "processing",
        "analysis_started_at": SERVER_TIMESTAMP
    })
    
    # Call the ML Service to trigger the async background job
    import httpx
    from app.core.config import settings
    import logging
    
    ml_url = f"{settings.ML_API_BASE_URL}/jobs/analyze-application"
    
    try:
        # We don't need to await this heavily or wait for it to finish.
        # It's an async job trigger. We use a short timeout because it responds immediately.
        with httpx.Client(timeout=5.0) as client:
            res = client.post(ml_url, json={"application_id": application_id})
            res.raise_for_status()
    except Exception as e:
        logging.error(f"Failed to trigger ML service: {e}")
        # In a robust system, we would queue this for retry.
        # For now, we update the status back so it's not stuck.
        app_repo.update_application_status(application_id, "failed")
        raise HTTPException(status_code=500, detail="Failed to reach ML service")
    
    # Generate Notification asynchronously
    background_tasks.add_task(
        create_notification_task,
        type="analysis_started",
        title="Analysis Started",
        message=f"AI analysis started for application {application_id}.",
        user_id="admin"
    )
    
    client_ip = getattr(request.client, 'host', 'unknown') if getattr(request, 'client', None) else 'unknown'
    user_agent = request.headers.get('user-agent', 'unknown')
    
    # Log asynchronously
    background_tasks.add_task(
        log_audit_action_task,
        user_id=uid,
        role=current_user.get("role", "user"),
        action="trigger_analysis",
        module="analysis",
        metadata={"application_id": application_id},
        ip_address=client_ip,
        user_agent=user_agent
    )
    
    return {"message": "Analysis queued successfully"}
