import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.firebase import init_firebase, get_firestore_client
from firebase_admin import auth
import firebase_admin

def seed_users():
    init_firebase()
    db = get_firestore_client()
    
    users = [
        {"email": "shivashankrmali7@gmail.com", "password": "Shivmali@123", "full_name": "Admin User", "role": "admin"},
        {"email": "malishivashankr5@gmail.com", "password": "Shivamali@123", "full_name": "Loan Officer", "role": "loan_officer"},
        {"email": "owner@visionkirana.com", "password": "password123", "full_name": "Shop Owner", "role": "shop_owner"},
        {"email": "user@visionkirana.com", "password": "password123", "full_name": "Standard User", "role": "user"}
    ]
    
    for u in users:
        try:
            user_record = auth.get_user_by_email(u["email"])
            print(f"User {u['email']} already exists in Auth. Updating password.")
            auth.update_user(user_record.uid, password=u["password"])
            uid = user_record.uid
        except firebase_admin.auth.UserNotFoundError:
            user_record = auth.create_user(
                email=u["email"],
                password=u["password"],
                display_name=u["full_name"]
            )
            print(f"Created user {u['email']} in Auth.")
            uid = user_record.uid
            
        db.collection("users").document(uid).set({
            "email": u["email"],
            "full_name": u["full_name"],
            "role": u["role"],
            "is_active": True
        }, merge=True)
        print(f"Upserted user {u['email']} in Firestore with role {u['role']}.")

if __name__ == "__main__":
    seed_users()
