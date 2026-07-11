from abc import ABC, abstractmethod
from typing import BinaryIO, Dict, Any, Optional

class StorageProvider(ABC):
    @abstractmethod
    def upload_file(self, file_obj: BinaryIO, filename: str, content_type: str, folder: str) -> Dict[str, Any]:
        """
        Upload a file to the storage provider.
        Returns a dictionary containing 'url', 'public_id', 'size', etc.
        """
        pass

    @abstractmethod
    def delete_file(self, public_id: str) -> bool:
        """
        Delete a file from the storage provider.
        """
        pass
