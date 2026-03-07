from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User
import os
import uuid

profile_bp = Blueprint("profile", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
BASE_DIR      = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "banners")

def allowed_file(filename):
    return "." in filename and \
        filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@profile_bp.route("/uploads/banners/<filename>")
def uploaded_file(filename):
    full_path = os.path.join(UPLOAD_FOLDER, filename)
    print("UPLOAD_FOLDER:", UPLOAD_FOLDER)
    print("Full path:", full_path)
    print("File exists:", os.path.exists(full_path))
    return send_from_directory(UPLOAD_FOLDER, filename)

# -------------------------
# UPDATE PROFILE
# -------------------------
@profile_bp.route("/update", methods=["PUT"])
def update_profile():
    if request.is_json:
        body = request.get_json()
        user_id = body.get("user_id")
        first_name = body.get("first_name")
        last_name = body.get("last_name")
    else:
        user_id = request.form.get("user_id")
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")

    if not user_id:
        return jsonify({"message": "user_id is required"}), 400

    try:
        user = db.session.get(User, int(user_id))
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid user_id"}), 400

    if not user:
        return jsonify({"message": "User not found"}), 404

    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name

    if "banner_image" in request.files:
        file = request.files["banner_image"]

        # ✅ Fix: pass file.filename, not file
        if file and allowed_file(file.filename):
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)

            if user.profile_pic:
                old_path = user.profile_pic.lstrip("/")
                if os.path.exists(old_path):
                    os.remove(old_path)

            ext = file.filename.rsplit(".", 1)[1].lower() if "." in file.filename else "jpg"
            unique_filename = f"{uuid.uuid4()}.{ext}"
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            file.save(filepath)
            user.profile_pic = f"uploads/banners/{unique_filename}" 
        else:
            return jsonify({"message": "Invalid file type"}), 400

    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "first_name": first_name,
            "last_name": last_name,
            "email": user.email,
            "pp": user.profile_pic
        }
    }), 200