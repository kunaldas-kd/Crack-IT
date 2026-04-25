import pyotp
import datetime
from typing import Tuple

def generate_otp(digits: int = 6, interval: int = 300) -> Tuple[str, str]:
    """
    Generates a secure time-based OTP.
    
    Args:
        digits (int): Length of the OTP (default 6).
        interval (int): Expiration interval in seconds (default 300s / 5m).
        
    Returns:
        Tuple[str, str]: The generated OTP code, and the base32 secret.
    """
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret, digits=digits, interval=interval)
    return totp.now(), secret

def validate_otp_secret(otp_code: str, secret: str, digits: int = 6, interval: int = 300) -> bool:
    """
    Validates a given OTP code against its originally generated secret.
    (Note: If storing OTP strings in DB rather than secrets, use standard string matching).
    """
    totp = pyotp.TOTP(secret, digits=digits, interval=interval)
    return totp.verify(otp_code)

def validate_db_record(record_otp_code: str, provided_otp_code: str, expires_at: datetime.datetime) -> bool:
    """
    Validates an OTP string stored in a database alongside an expiration datetime.
    
    Args:
        record_otp_code (str): The code originally saved to the DB.
        provided_otp_code (str): The code the user just typed into the form.
        expires_at (datetime.datetime): The expiration timestamp of the record.
        
    Returns:
        bool: True if valid and not expired, False otherwise.
    """
    if record_otp_code != provided_otp_code:
        return False
        
    import django.utils.timezone as timezone
    if timezone.now() > expires_at:
        return False
        
    return True
