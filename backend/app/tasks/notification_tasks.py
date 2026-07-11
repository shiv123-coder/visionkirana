from app.worker import celery_app
from app.core.firebase import get_firestore_client
from app.repositories.notification_repository import NotificationRepository

@celery_app.task(name="create_notification_task")
def create_notification_task(type: str, title: str, message: str, user_id: str):
    """
    Asynchronously creates a notification in Firestore.
    """
    db = get_firestore_client()
    repo = NotificationRepository(db)
    
    repo.create_notification(
        type=type,
        title=title,
        message=message,
        user_id=user_id
    )
    return {"status": "success", "message": f"Notification '{title}' created."}
