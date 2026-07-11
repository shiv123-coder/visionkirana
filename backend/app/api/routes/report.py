from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.api.deps import get_current_active_user
from app.api.deps_db import (
    get_application_repo,
    get_shop_repo,
    get_report_repo,
    get_document_repo,
    get_audit_repo,
    ApplicationRepository,
    ShopRepository,
    ReportRepository,
    DocumentRepository,
    AuditRepository
)
from fastapi import Request, BackgroundTasks
from app.tasks.audit_tasks import log_audit_action_task

router = APIRouter()

@router.get("/{application_id}")
def get_application_report(
    application_id: str,
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    app_repo: ApplicationRepository = Depends(get_application_repo),
    shop_repo: ShopRepository = Depends(get_shop_repo),
    report_repo: ReportRepository = Depends(get_report_repo),
    doc_repo: DocumentRepository = Depends(get_document_repo),
    audit_repo: AuditRepository = Depends(get_audit_repo),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    # 1. Get Application and Shop
    app_data = app_repo.get_application(application_id)
    if not app_data:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # RBAC check: only owner, admin, or loan officer can view
    uid = current_user.get("uid") or current_user.get("id")
    role = current_user.get("role")
    
    if role not in ["admin", "loan_officer"] and app_data.get("user_id") != uid:
        raise HTTPException(status_code=403, detail="Not authorized to view this report")
        
    shop_data = shop_repo.get_shop(app_data.get("shop_id", "")) or {}

    # 2. Get Report
    report_data = report_repo.get_report_by_application(application_id)
    
    if not report_data:
        # If no ML report exists yet, throw 404 or return pending status
        raise HTTPException(status_code=404, detail="Report not generated yet")
    
    # 3. Get Evidence Files (Secure Document References)
    evidence_docs = doc_repo.get_documents_by_application(application_id)
    evidence_files = []
    for data in evidence_docs:
        # We only send back the document ID, category, and type. We do NOT send the raw URL anymore.
        evidence_files.append({
            "id": data.get("id"),
            "category": data.get("file_category"),
            "type": data.get("specific_type"),
            "uploaded_at": data.get("created_at")
        })

    client_ip = getattr(request.client, 'host', 'unknown') if getattr(request, 'client', None) else 'unknown'
    user_agent = request.headers.get('user-agent', 'unknown')

    background_tasks.add_task(
        log_audit_action_task,
        user_id=uid,
        role=role,
        action="view_report",
        module="report",
        metadata={"application_id": application_id},
        ip_address=client_ip,
        user_agent=user_agent
    )
    
    # Construct the payload expected by the frontend
    return {
        "application_id": application_id,
        "shop_profile": {
            "name": shop_data.get("shop_name", "Unknown"),
            "owner": shop_data.get("owner_name", "Unknown"),
            "address": f"{shop_data.get('address', '')}, {shop_data.get('city', '')}",
            "years_in_business": shop_data.get("years_in_business", 0),
            "monthly_sales": shop_data.get("monthly_sales", 0),
            "requested_loan": app_data.get("requested_amount", 0),
            "purpose": app_data.get("purpose", "")
        },
        "risk_assessment": report_data.get("risk_assessment", {
            "recommendation": "PENDING",
            "health_score": 0,
            "category": "Unknown",
            "positive_factors": [],
            "risk_factors": []
        }),
        "cv_analysis": report_data.get("cv_analysis", {}),
        "ocr_analysis": report_data.get("ocr_analysis", {}),
        "location_intelligence": report_data.get("location_intelligence", {}),
        "voice_analysis": report_data.get("voice_analysis", []),
        "evidence_files": evidence_files
    }
