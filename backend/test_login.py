import sys
import asyncio
from app.db.session import SessionLocal
import app.db.base
from app.api.routes.auth import login_access_token, google_login, GoogleLoginRequest
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

class DummyForm:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.scopes = []
        self.client_id = None
        self.client_secret = None
        self.grant_type = "password"

db = SessionLocal()
try:
    print("Testing standard login...")
    form = DummyForm("shivashankarmali7@gmail.com", "Shivmali@123")
    res = login_access_token(db=db, form_data=form)
    print("Standard login response:", res)
except Exception as e:
    import traceback
    traceback.print_exc()

print("---")

try:
    print("Testing Google login...")
    req = GoogleLoginRequest(token="dummy_token")
    res = google_login(data=req, db=db)
    print("Google login response:", res)
except Exception as e:
    import traceback
    traceback.print_exc()

db.close()
