from typing import Any, Dict
from fastapi import APIRouter, Depends, Request
from app.api.deps import get_current_user
from app.api.limiter import limiter

router = APIRouter()

@router.get("/me")
@limiter.limit("20/minute")
def read_user_me(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Any:
    """
    Get current user profile from Firebase Token.
    """
    return current_user

