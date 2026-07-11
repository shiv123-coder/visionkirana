import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from app.core.config import settings
import os
import json

def init_firebase():
    if not firebase_admin._apps:
        try:
            firebase_json_str = os.environ.get("FIREBASE_CREDENTIALS_JSON")
            if firebase_json_str:
                cred_dict = json.loads(firebase_json_str)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
            else:
                print("Warning: FIREBASE_CREDENTIALS_JSON not found in environment. Firestore updates will fail.")
        except Exception as e:
            print(f"Error initializing Firebase Admin: {e}")

def get_firestore_client():
    return firestore.client()
