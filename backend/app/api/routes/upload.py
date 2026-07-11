from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException, status, Request, BackgroundTasks
import cloudinary
import cloudinary.uploader
from typing import Dict, Any
from app.api.deps import get_current_active_user
from app.api.deps_db import (
    get_document_repo,
    get_notification_repo,
    DocumentRepository,
    NotificationRepository
)
from app.api.limiter import limiter
from app.tasks.notification_tasks import create_notification_task

router = APIRouter()

@router.post("/")
@limiter.limit("10/minute")
async def upload_evidence(
    request: Request,
    file: UploadFile = File(...),
    application_id: str = Form(...),
    file_category: str = Form(...),
    specific_type: str = Form(...),
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    doc_repo: DocumentRepository = Depends(get_document_repo),
    notif_repo: NotificationRepository = Depends(get_notification_repo),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Uploads a file to Cloudinary and saves the metadata in Firestore.
    """
    uid = current_user.get("uid") or current_user.get("id")
    
    # 1. Upload to Cloudinary securely
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder=f"visionkirana/applications/{application_id}",
            resource_type="auto", # Auto-detects image vs video/audio
            type="authenticated" # Secures the file so it can't be accessed publicly
        )
        file_url = result.get("secure_url") # Still returned, but can't be accessed directly without signature
        public_id = result.get("public_id")
        resource_type = result.get("resource_type")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")

    # 2. Save metadata to Firestore
    doc_data = {
        "application_id": application_id,
        "file_url": file_url, # Legacy support, though access is now blocked
        "public_id": public_id, # New: needed for generating signed URLs
        "resource_type": resource_type, # New: needed for generating signed URLs
        "file_category": file_category,
        "specific_type": specific_type,
        "uploaded_by": uid
    }
    
    doc_id = doc_repo.create_document(doc_data)
    
    # 3. Generate Notification for Admin/Loan Officer asynchronously
    background_tasks.add_task(
        create_notification_task,
        type="evidence_uploaded",
        title="Evidence Uploaded",
        message=f"New {specific_type} uploaded for application.",
        user_id="admin"
    )
    
    return {
        "message": "File uploaded successfully",
        "id": doc_id,
        "url": file_url
    }

@router.delete("/{doc_id}")
@limiter.limit("10/minute")
async def delete_evidence(
    request: Request,
    doc_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    doc_repo: DocumentRepository = Depends(get_document_repo)
):
    """
    Deletes a file from Cloudinary and removes metadata from Firestore.
    """
    # 1. Fetch document to get public_id
    doc = doc_repo.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Security: Ensure only the uploader or admin can delete
    if doc.get("uploaded_by") != current_user.get("uid", current_user.get("id")) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")
        
    public_id = doc.get("public_id")
    resource_type = doc.get("resource_type", "image")
    
    # 2. Delete from Cloudinary
    if public_id:
        try:
            cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        except Exception as e:
            print(f"Warning: Failed to delete from Cloudinary: {e}")
            # We still proceed to delete from DB even if Cloudinary fails
            
    # 3. Delete from DB
    doc_repo.delete_document(doc_id)
    
    return {"message": "File deleted successfully"}
