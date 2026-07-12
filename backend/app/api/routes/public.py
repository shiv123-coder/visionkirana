from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.api.deps_db import (
    get_application_repo,
    get_shop_repo,
    get_user_repo,
    ApplicationRepository,
    ShopRepository,
    UserRepository
)
import random

router = APIRouter()

@router.get("/sanction/{app_id}")
def get_public_sanction_letter(
    app_id: str,
    app_repo: ApplicationRepository = Depends(get_application_repo),
    shop_repo: ShopRepository = Depends(get_shop_repo),
    user_repo: UserRepository = Depends(get_user_repo)
):
    """
    Publicly accessible endpoint to retrieve loan sanction details for verification via QR code.
    No authentication is required.
    """
    app_data = app_repo.get_application(app_id)
    if not app_data:
        raise HTTPException(status_code=404, detail="Application not found")
        
    shop_id = app_data.get("shop_id")
    shop_data = shop_repo.get_shop(shop_id) if shop_id else None
    
    if not shop_data:
        raise HTTPException(status_code=404, detail="Shop associated with application not found")
        
    user_id = app_data.get("user_id")
    user_data = user_repo.get_user(user_id) if user_id else None
    
    # Mocking Loan Officer Signature for the Sanction Letter
    # In a real app, this would be tied to the actual officer who clicked "Approve"
    mock_officers = ["Rajeev Mehta", "Anjali Sharma", "Kiran Desai", "Vikram Singh"]
    officer_name = random.choice(mock_officers)
    
    return {
        "status": "success",
        "data": {
            "application_id": app_id,
            "status": app_data.get("status"),
            "requested_amount": app_data.get("requested_amount", 0),
            "purpose": app_data.get("purpose", ""),
            "created_at": app_data.get("created_at"),
            "shop": {
                "id": shop_id,
                "name": shop_data.get("shop_name"),
                "owner_name": shop_data.get("owner_name"),
                "address": shop_data.get("address"),
                "city": shop_data.get("city"),
                "state": shop_data.get("state"),
                "mobile": shop_data.get("mobile"),
                "category": shop_data.get("category"),
                "monthly_sales": shop_data.get("monthly_sales", 0),
                "years_in_business": shop_data.get("years_in_business", 0)
            },
            "approval_details": {
                "officer_name": officer_name,
                "officer_signature": f"SIG-{officer_name.replace(' ', '').upper()}-{app_id[:6]}",
                "issued_date": app_data.get("updated_at") or app_data.get("created_at")
            }
        }
    }
