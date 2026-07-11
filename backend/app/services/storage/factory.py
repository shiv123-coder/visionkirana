from app.services.storage.base import StorageProvider
from app.services.storage.cloudinary_storage import CloudinaryStorage
# from app.services.storage.aws_storage import AWSStorage

def get_storage_provider(provider_name: str = "cloudinary") -> StorageProvider:
    if provider_name == "cloudinary":
        return CloudinaryStorage()
    # elif provider_name == "aws":
    #     return AWSStorage()
    else:
        raise ValueError(f"Unknown storage provider: {provider_name}")
