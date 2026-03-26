from flask import Flask
from flask_jwt_extended import JWTManager
from models import db
from flask_cors import CORS
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.user_info import user_info_bp
from routes.tracker import track_location_bp
from routes.user_locations import user_location_bp
from routes.status_flags import flags_bp
from flask_migrate import Migrate
app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///teraclash.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key"

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(profile_bp, url_prefix="/api/profile")
app.register_blueprint(user_info_bp, url_prefix="/api")
app.register_blueprint(track_location_bp, url_prefix="/api")
app.register_blueprint(user_location_bp, url_prefix="/api")
app.register_blueprint(flags_bp, url_prefix="/api")

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(host="192.168.0.240", port=5000, debug=True)