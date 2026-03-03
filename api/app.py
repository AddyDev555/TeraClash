from flask import Flask
from flask_jwt_extended import JWTManager
from models import db
from routes.auth import auth_bp

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///teraclash.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key"

db.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(host="192.168.1.7", port=5000, debug=True)