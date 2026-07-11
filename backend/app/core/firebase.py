import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from app.core.config import settings
import os
import json
import logging

def init_firebase():
    if not firebase_admin._apps:
        try:
            # Check if credentials are provided via JSON string in env var (Render/Prod)
            firebase_json_str = os.environ.get("FIREBASE_CREDENTIALS_JSON")
            
            if firebase_json_str:
                cred_dict = json.loads(firebase_json_str)
                cred = credentials.Certificate(cred_dict)
            else:
                # Fallback to local file path
                cred_path = settings.FIREBASE_CREDENTIALS_PATH
                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                else:
                    if os.environ.get("GITHUB_ACTIONS"):
                        logging.warning("Skipping Firebase initialization in GitHub Actions environment.")
                        return
                    raise RuntimeError(f"Firebase credentials not found at {cred_path} and FIREBASE_CREDENTIALS_JSON env var is not set.")
            
            firebase_admin.initialize_app(cred)
            logging.info("Firebase Admin initialized successfully.")
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse FIREBASE_CREDENTIALS_JSON. Make sure it's valid JSON: {e}")
            raise
        except Exception as e:
            logging.error(f"Error initializing Firebase Admin: {e}")
            raise

def get_firestore_client():
    if not firebase_admin._apps:
        raise RuntimeError("Firebase Admin is not initialized. Check your FIREBASE_CREDENTIALS_JSON environment variable.")
    return firestore.client()
