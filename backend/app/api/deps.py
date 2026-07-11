from typing import Generator, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
import logging

from app.core.config import settings
from app.models.user import RoleEnum
from app.core.firebase import get_firestore_client

# Using HTTPBearer instead of OAuth2PasswordBearer for Firebase ID tokens
security = HTTPBearer()

def get_current_user_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logging.error(f"Error verifying Firebase token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(
    token_data: Dict[str, Any] = Depends(get_current_user_token)
) -> Dict[str, Any]:
    uid = token_data.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="User ID not found in token")
        
    db = get_firestore_client()
    user_doc = db.collection("users").document(uid).get()
    
    if not user_doc.exists:
        # If user is not in Firestore yet, they might be logging in for the very first time.
        # Default to token data, but role will be None or default.
        return token_data
        
    user_data = user_doc.to_dict()
    # Merge token data with Firestore data, giving precedence to Firestore for role/metadata
    merged_user = {**token_data, **user_data}
    return merged_user

def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    # Firebase users are active by default unless disabled in Firebase Console
    return current_user

def get_current_active_admin(
    current_user: Dict[str, Any] = Depends(get_current_active_user)
) -> Dict[str, Any]:
    role = current_user.get("role")
    if role != RoleEnum.ADMIN.value and current_user.get("email") != settings.ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

class RoleChecker:
    def __init__(self, allowed_roles: list[RoleEnum]):
        self.allowed_roles = [role.value for role in allowed_roles]

    def __call__(self, user: Dict[str, Any] = Depends(get_current_active_user)):
        user_role = user.get("role")
        if not user_role or user_role not in self.allowed_roles:
            # Fallback for admin email
            if "admin" in self.allowed_roles and user.get("email") == settings.ADMIN_EMAIL:
                return user
                
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return user
