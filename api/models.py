from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    profile_pic = db.Column(db.String(500), nullable=True)  # store image URL or file path
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Password Hashing
    def set_password(self, password):
        self.password = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password, password)

    # Convert user object to dictionary (very useful for API response)
    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "profile_pic": self.profile_pic,
            "created_at": self.created_at
        }
        
class UserInfo(db.Model):
    __tablename__ = "user_info"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    total_steps = db.Column(db.Integer, default=0)
    total_distance = db.Column(db.Float, default=0.0)

    steps_today = db.Column(db.Integer, default=0)
    distance_today = db.Column(db.Float, default=0.0)
    calories_today = db.Column(db.Float, default=0.0)

    areas_captured = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
    user_level = db.Column(db.Integer, default=1)
    sweat_coins = db.Column(db.Integer, default=0)

    last_updated = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now()
    )

    user = db.relationship("User", backref="info")

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "total_steps": self.total_steps,
            "total_distance": self.total_distance,
            "steps_today": self.steps_today,
            "distance_today": self.distance_today,
            "calories_today": self.calories_today,
            "areas_captured": self.areas_captured,
            "streak": self.streak,
            "user_level": self.user_level,
            "sweat_coins": self.sweat_coins,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }