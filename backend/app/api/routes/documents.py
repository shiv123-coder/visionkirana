from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from app.api.deps import get_current_active_user, RoleChecker
from app.api.deps_db import get_document_repo, DocumentRepository
import cloudinary
import cloudinary.utils
import time

router = APIRouter()

@router.get("/{document_id}/url")
def get_secure_document_url(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    doc_repo: DocumentRepository = Depends(get_document_repo)
):
    """
    Generates a secure, temporary, expiring URL for a requested document.
    Ensures the user has permission to view the document.
    """
    uid = current_user.get("uid") or current_user.get("id")
    role = current_user.get("role", "user")

    doc_data = doc_repo.get_document(document_id)

    if not doc_data:
        raise HTTPException(status_code=404, detail="Document not found")

    # Authorization Check
    # Admins and Loan Officers can view any document
    if role not in ["admin", "loan_officer"]:
        # Standard users can only view their own uploaded documents
        # Alternatively, we could check if they own the application.
        # Checking uploaded_by is the simplest valid proxy here.
        if doc_data.get("uploaded_by") != uid:
            raise HTTPException(status_code=403, detail="Not authorized to view this document")

    public_id = doc_data.get("public_id")
    resource_type = doc_data.get("resource_type", "image")

    if not public_id:
        # Legacy document that wasn't uploaded with public_id
        # We just return the old public file_url and hope it still works
        return {"url": doc_data.get("file_url")}

    # Generate a signed URL that expires in 15 minutes (900 seconds)
    # Cloudinary `sign_url=True` requires `type="authenticated"`
    try:
        expires_at = int(time.time()) + 900
        url, options = cloudinary.utils.cloudinary_url(
            public_id,
            resource_type=resource_type,
            type="authenticated",
            sign_url=True,
            expires_at=expires_at
        )
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate secure URL: {str(e)}")
