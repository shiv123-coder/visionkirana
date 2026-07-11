import os
from cryptography.fernet import Fernet

# In a real enterprise app, this key would be securely loaded from a Key Management Service (KMS)
# like AWS KMS, Google Cloud KMS, or Azure Key Vault, instead of an environment variable.
# For demonstration purposes, we are using a static default key if the env var is missing.
ENCRYPTION_KEY = os.environ.get(
    "PII_ENCRYPTION_KEY", 
    "r9mD8oJz3Kq_pLwXtN2vYc7uIhA1eSg5fB4kX0jR6Vw="
)

fernet = Fernet(ENCRYPTION_KEY.encode('utf-8'))

def encrypt_pii(value: str) -> str:
    """Encrypts a string value."""
    if not value:
        return value
    try:
        return fernet.encrypt(value.encode('utf-8')).decode('utf-8')
    except Exception:
        return value

def decrypt_pii(encrypted_value: str) -> str:
    """Decrypts a previously encrypted string value."""
    if not encrypted_value:
        return encrypted_value
    try:
        return fernet.decrypt(encrypted_value.encode('utf-8')).decode('utf-8')
    except Exception:
        # If it fails to decrypt, it might be legacy unencrypted data
        return encrypted_value
