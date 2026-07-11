import os
import sys
import argparse
from sqlalchemy.orm import Session

# Add the app directory to the python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User, RoleEnum
from app.core.config import settings
from app.core import security

def init_db(db: Session):
    # Base.metadata.create_all(bind=engine) # Optional: Can be used if alembic is not used

    admin_email = settings.ADMIN_EMAIL
    admin_password = settings.ADMIN_PASSWORD # The production deployment will use Google Auth, but let's seed a password anyway just in case

    user = db.query(User).filter(User.email == admin_email).first()
    if not user:
        user = User(
            email=admin_email,
            hashed_password=security.get_password_hash(admin_password),
            full_name="System Admin",
            role=RoleEnum.ADMIN,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Admin user created: {admin_email}")
    else:
        print(f"Admin user already exists: {admin_email}")

def main():
    print("Starting database seeding...")
    db = SessionLocal()
    try:
        init_db(db)
        print("Database seeding completed.")
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
