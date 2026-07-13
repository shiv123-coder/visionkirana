import os
import sys
import json
import uuid
import random
from datetime import datetime, timezone

# Add backend directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.firebase import init_firebase, get_firestore_client
from firebase_admin import auth
import firebase_admin

# --- Configurations ---

# Mock URLs for testing (since we are not actually uploading to cloudinary in the seed script)
DUMMY_ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dummy_assets")

USERS_DATA = [
    {"email": "shivashankrmali7@gmail.com", "password": "VisionKirana@123", "full_name": "Admin User", "role": "admin"},
    {"email": "malishivashankr5@gmail.com", "password": "VisionKirana@123", "full_name": "Loan Officer", "role": "loan_officer"},
    {"email": "nageshmali098510@gmail.com", "password": "VisionKirana@123", "full_name": "Shop Owner 1", "role": "shop_owner"},
    {"email": "shivashankrmali5@gmail.com", "password": "VisionKirana@123", "full_name": "Shop Owner 2", "role": "shop_owner"}
]

# --- Helper Functions ---

def create_dummy_asset(filename: str, content_type: str) -> str:
    """Creates a local dummy file and returns a mock cloud URL."""
    if not os.path.exists(DUMMY_ASSETS_DIR):
        os.makedirs(DUMMY_ASSETS_DIR, exist_ok=True)
    
    filepath = os.path.join(DUMMY_ASSETS_DIR, filename)
    
    if content_type == "json":
        sample_transactions = [{"id": "txn_1", "amount": 1500, "date": "2024-01-01"}, {"id": "txn_2", "amount": 3000, "date": "2024-01-02"}]
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(sample_transactions, f, indent=4)
    elif content_type in ["jpg", "png", "pdf", "mp3"]:
        # Write some basic dummy binary data for mock files so they exist
        with open(filepath, 'wb') as f:
            f.write(b"DUMMY BINARY CONTENT FOR " + content_type.encode('utf-8'))
    else:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write("Mock text content.")
            
    return f"https://mock-storage.visionkirana.com/assets/{filename}"

def create_users(db):
    user_records = {}
    for u in USERS_DATA:
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
        
        # Store uid mapping to return
        if u["role"] == "shop_owner":
            if "shop_owner_1" not in user_records:
                user_records["shop_owner_1"] = uid
            else:
                user_records["shop_owner_2"] = uid
                
    return user_records

def create_shops(db, shop_owners):
    shops = {}
    
    shop1_id = str(uuid.uuid4())
    shop1_data = {
        "owner_id": shop_owners["shop_owner_1"],
        "name": "Mali General Store",
        "owner_name": "Nagesh Mali",
        "mobile": "+919876543210",
        "address": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "category": "grocery",
        "years_in_business": 5,
        "monthly_sales": 150000.0,
        "latitude": 19.0760,
        "longitude": 72.8777,
        "gst_number": "27AADCM1234E1Z1"
    }
    db.collection("shops").document(shop1_id).set(shop1_data)
    shops["shop1"] = {"id": shop1_id, "owner_id": shop_owners["shop_owner_1"]}
    print(f"Created Shop 1: {shop1_data['name']}")

    shop2_id = str(uuid.uuid4())
    shop2_data = {
        "owner_id": shop_owners["shop_owner_2"],
        "name": "Shiva Electronics & Provisions",
        "owner_name": "Shiva Shankar",
        "mobile": "+919876543211",
        "address": "456 Market Road",
        "city": "Pune",
        "state": "Maharashtra",
        "category": "mixed",
        "years_in_business": 2,
        "monthly_sales": 80000.0,
        "latitude": 18.5204,
        "longitude": 73.8567,
        "gst_number": "27BBDCM5678E1Z2"
    }
    db.collection("shops").document(shop2_id).set(shop2_data)
    shops["shop2"] = {"id": shop2_id, "owner_id": shop_owners["shop_owner_2"]}
    print(f"Created Shop 2: {shop2_data['name']}")
    
    return shops

def create_evidence(db, app_id, shop_id, user_id, file_type, status="processed"):
    file_id = str(uuid.uuid4())
    
    # Determine extension and content type
    ext = "jpg"
    mime = "image/jpeg"
    if file_type == "invoice" or file_type == "bank_statement":
        ext = "pdf"
        mime = "application/pdf"
    elif file_type == "pitch" or file_type == "voice":
        ext = "mp3"
        mime = "audio/mpeg"
    elif file_type == "transactions":
        ext = "json"
        mime = "application/json"
        
    filename = f"{app_id}_{file_type}_{int(datetime.now().timestamp())}.{ext}"
    mock_url = create_dummy_asset(filename, ext)
    
    evidence_data = {
        "shop_id": shop_id,
        "application_id": app_id,
        "uploaded_by": user_id,
        "file_name": filename,
        "file_type": file_type,
        "storage_provider": "cloudinary",
        "storage_url": mock_url,
        "mime_type": mime,
        "file_size": random.randint(1024, 500000),
        "processing_status": status,
        "created_at": datetime.now(timezone.utc)
    }
    db.collection("evidence_files").document(file_id).set(evidence_data)
    return file_id

def create_scenarios(db, shops):
    scenarios = [
        # Scenario 1: Approved (Low Risk)
        {
            "shop": "shop1",
            "data": {
                "status": "approved",
                "requested_amount": 50000.0,
                "purpose": "Inventory expansion"
            },
            "name": "Approved (Low Risk)",
            "credit": {"final_score": 850, "risk_category": "low"}
        },
        # Scenario 2: Rejected (High Risk)
        {
            "shop": "shop1",
            "data": {
                "status": "rejected",
                "requested_amount": 200000.0,
                "purpose": "New branch setup"
            },
            "name": "Rejected (High Risk)",
            "credit": {"final_score": 450, "risk_category": "high"}
        },
        # Scenario 3: Processing (Pending AI)
        {
            "shop": "shop1",
            "data": {
                "status": "submitted",
                "requested_amount": 75000.0,
                "purpose": "Working capital"
            },
            "name": "Processing (Pending AI)",
            "evidence_status": "pending"
        },
        # Scenario 4: Failed (Error state)
        {
            "shop": "shop1",
            "data": {
                "status": "submitted",
                "requested_amount": 30000.0,
                "purpose": "Store renovation",
                "has_error": True,
                "error_message": "AI analysis failed due to poor image quality."
            },
            "name": "Failed (Error state)"
        },
        # Scenario 5: Under Review (Manual intervention needed)
        {
            "shop": "shop2",
            "data": {
                "status": "in_review",
                "requested_amount": 100000.0,
                "purpose": "Machinery purchase"
            },
            "name": "Under Review (Manual intervention needed)",
            "credit": {"final_score": 620, "risk_category": "medium"}
        },
        # Scenario 6: Draft
        {
            "shop": "shop2",
            "data": {
                "status": "draft",
                "requested_amount": 0.0,
                "purpose": ""
            },
            "name": "Draft"
        },
        # Scenario 7: High value loan
        {
            "shop": "shop2",
            "data": {
                "status": "in_review",
                "requested_amount": 5000000.0,
                "purpose": "Mega warehouse acquisition"
            },
            "name": "High value loan",
            "credit": {"final_score": 710, "risk_category": "medium"}
        },
        # Scenario 8: Low value loan
        {
            "shop": "shop2",
            "data": {
                "status": "approved",
                "requested_amount": 10000.0,
                "purpose": "Minor repairs"
            },
            "name": "Low value loan",
            "credit": {"final_score": 780, "risk_category": "low"}
        }
    ]
    
    for s in scenarios:
        app_id = str(uuid.uuid4())
        shop_info = shops[s["shop"]]
        
        app_data = {
            "shop_id": shop_info["id"],
            "user_id": shop_info["owner_id"],
            **s["data"]
        }
        db.collection("applications").document(app_id).set(app_data)
        
        # Create Evidence Files (if not draft)
        if s["data"]["status"] != "draft":
            ev_status = s.get("evidence_status", "processed")
            create_evidence(db, app_id, shop_info["id"], shop_info["owner_id"], "shop_front", ev_status)
            create_evidence(db, app_id, shop_info["id"], shop_info["owner_id"], "inventory", ev_status)
            create_evidence(db, app_id, shop_info["id"], shop_info["owner_id"], "invoice", ev_status)
            create_evidence(db, app_id, shop_info["id"], shop_info["owner_id"], "transactions", ev_status)
            create_evidence(db, app_id, shop_info["id"], shop_info["owner_id"], "pitch", ev_status)
            
        # Create AI Analysis records (if processed)
        if "credit" in s:
            credit_id = str(uuid.uuid4())
            db.collection("credit_scores").document(credit_id).set({
                "application_id": app_id,
                **s["credit"],
                "features_used": {"inventory_score": 8.5, "sales_score": 7.2}
            })
            
        print(f"Created Application Scenario: {s['name']} (ID: {app_id})")

def create_admin_data(db):
    print("\n--- Creating Admin Notifications & Logs ---")
    
    # 1. Admin Notifications
    notifications = [
        {"title": "New High Value Loan Request", "message": "Shop Owner 2 requested 5,000,000 for a mega warehouse.", "type": "alert", "is_read": False},
        {"title": "System Alert", "message": "AI Processing failed for Application 'Failed (Error state)'.", "type": "error", "is_read": False},
        {"title": "New User Registration", "message": "A new shop owner just registered.", "type": "info", "is_read": True}
    ]
    for n in notifications:
        n_id = str(uuid.uuid4())
        db.collection("admin_notifications").document(n_id).set({
            **n,
            "created_at": datetime.now(timezone.utc)
        })
        print(f"Created Notification: {n['title']}")
        
    # 2. Demo Requests
    requests = [
        {"name": "Rahul Sharma", "email": "rahul.sharma@example.com", "phone": "+919988776655", "company": "Sharma Kirana", "status": "pending"},
        {"name": "Anjali Verma", "email": "anjali.v@example.com", "phone": "+919988776644", "company": "Verma Provisions", "status": "contacted"}
    ]
    for r in requests:
        r_id = str(uuid.uuid4())
        db.collection("demo_requests").document(r_id).set({
            **r,
            "created_at": datetime.now(timezone.utc)
        })
        print(f"Created Demo Request for: {r['name']}")
        
    # 3. Audit Logs
    logs = [
        {"action": "LOGIN", "user_email": "admin@visionkirana.com", "details": "Admin logged into the system."},
        {"action": "LOAN_APPROVED", "user_email": "loan_officer@visionkirana.com", "details": "Approved loan for Mali General Store."}
    ]
    for l in logs:
        l_id = str(uuid.uuid4())
        db.collection("audit_logs").document(l_id).set({
            **l,
            "created_at": datetime.now(timezone.utc)
        })
        print(f"Created Audit Log: {l['action']}")

def main():
    print("Starting Comprehensive Database Seeding...")
    init_firebase()
    db = get_firestore_client()
    
    # 1. Create Users
    print("\n--- Creating Users ---")
    shop_owners = create_users(db)
    
    # 2. Create Shops
    print("\n--- Creating Shops ---")
    shops = create_shops(db, shop_owners)
    
    # 3. Create Applications (Scenarios) & Mock Assets
    print("\n--- Creating Scenarios & Assets ---")
    create_scenarios(db, shops)
    
    # 4. Create Admin Data (Notifications, Logs, etc.)
    create_admin_data(db)
    
    print("\nSeeding Complete! All dummy files are in backend/dummy_assets.")

if __name__ == "__main__":
    main()
