from extensions import db
from datetime import datetime, timedelta, timezone
import secrets
import string


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class OTP(db.Model):
    """Model to store OTP codes for password reset."""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False, unique=True, index=True)
    otp_code = db.Column(db.String(6), nullable=False)  # 6-digit OTP
    created_at = db.Column(db.DateTime, default=_utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    
    def __init__(self, email):
        self.email = email
        self.otp_code = self.generate_otp()
        self.created_at = _utcnow()
        self.expires_at = self.created_at + timedelta(minutes=10)
        self.is_verified = False
    
    @staticmethod
    def generate_otp():
        """Generate a random 6-digit OTP."""
        return ''.join(secrets.choice(string.digits) for _ in range(6))
    
    def is_expired(self):
        """Check if OTP has expired."""
        return _utcnow() > self.expires_at
    
    def verify(self, code):
        """Verify OTP code and mark as verified if correct."""
        if self.is_expired():
            return False, "OTP has expired"
        if self.otp_code != code:
            return False, "Invalid OTP code"
        self.is_verified = True
        return True, "OTP verified successfully"
    
    def __repr__(self):
        return f'<OTP {self.email}>'
