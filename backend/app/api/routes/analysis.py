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
    
    def simulate_ml_analysis(app_id: str):
        from google.cloud.firestore import SERVER_TIMESTAMP
        
        # Simulated report matching what report.py expects
        simulated_report = {
            "application_id": app_id,
            "risk_assessment": {
                "recommendation": "APPROVE",
                "health_score": 85,
                "category": "Low Risk",
                "positive_factors": ["High monthly sales", "Long business history"],
                "risk_factors": ["High competition in area"]
            },
            "cv_analysis": {
                "image_quality_score": 0.9,
                "shelf_density_score": 0.85,
                "store_organization_score": 0.88,
                "inventory_visibility_score": 0.95
            },
            "ocr_analysis": {
                "extracted_text": "Valid invoices found."
            },
            "location_intelligence": {
                "foot_traffic": "High",
                "competitor_density": "Medium"
            },
            "created_at": SERVER_TIMESTAMP
        }
        
        try:
            # 1. Update application status
            app_repo.update_application(app_id, {
                "status": "completed",
                "analysis_completed_at": SERVER_TIMESTAMP
            })
            
            # 2. Save report to the reports collection!
            from app.api.deps_db import get_db, ReportRepository
            db = get_db()
            report_repo = ReportRepository(db)
            report_repo.collection.add(simulated_report)
            
            
            # Generate Notification for completion
            notif_repo.create_notification(
                type="analysis_completed",
                message=f"AI analysis completed for application {app_id}.",
                user_id=app_data.get("user_id"),
                target_roles=["admin", "loan_officer", "shop_owner"],
                related_entity_id=app_id,
                related_entity_type="application"
            )
        except Exception as e:
            import logging
            logging.error(f"Failed to complete ML analysis: {e}")
            app_repo.update_application_status(app_id, "failed")

    # Queue the local fast analysis
    background_tasks.add_task(simulate_ml_analysis, application_id)
    
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
