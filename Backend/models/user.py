from extensions import db
from datetime import datetime, timezone

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # Increased length for hash
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )
    
    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.password = password  # Password should be hashed before passing to init

    def __repr__(self):
        return f'<User {self.email}>'