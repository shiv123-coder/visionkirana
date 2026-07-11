from fastapi import Depends
from google.cloud.firestore import Client
from app.core.firebase import get_firestore_client
from app.repositories.shop_repository import ShopRepository
from app.repositories.application_repository import ApplicationRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.audit_repository import AuditRepository
from app.repositories.user_repository import UserRepository
from app.repositories.report_repository import ReportRepository
from app.repositories.demo_request_repository import DemoRequestRepository

def get_db() -> Client:
    return get_firestore_client()

def get_shop_repo(db: Client = Depends(get_db)) -> ShopRepository:
    return ShopRepository(db)

def get_application_repo(db: Client = Depends(get_db)) -> ApplicationRepository:
    return ApplicationRepository(db)

def get_notification_repo(db: Client = Depends(get_db)) -> NotificationRepository:
    return NotificationRepository(db)

def get_document_repo(db: Client = Depends(get_db)) -> DocumentRepository:
    return DocumentRepository(db)

def get_audit_repo(db: Client = Depends(get_db)) -> AuditRepository:
    return AuditRepository(db)

def get_user_repo(db: Client = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

def get_report_repo(db: Client = Depends(get_db)) -> ReportRepository:
    return ReportRepository(db)

def get_demo_request_repo(db: Client = Depends(get_db)) -> DemoRequestRepository:
    return DemoRequestRepository(db)


