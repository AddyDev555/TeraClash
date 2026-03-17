from flask import Blueprint, request, jsonify
from models import db, UserInfo

user_info_bp = Blueprint("user_info", __name__)

@user_info_bp.route("/user_info/<int:user_id>", methods=["GET"])
def get_user_info(user_id):
    user_info = UserInfo.query.filter_by(user_id=user_id).first()
    if not user_info:
        return jsonify({"error": "User info not found"}), 404
    return jsonify(user_info.to_dict()), 200

@user_info_bp.route("/user_info/<int:user_id>", methods=["PUT"])
def update_user_info(user_id):
    user_info = UserInfo.query.filter_by(user_id=user_id).first()
    if not user_info:
        return jsonify({"error": "User info not found"}), 404

    data = request.get_json()
    for key, value in data.items():
        if hasattr(user_info, key):
            setattr(user_info, key, value)

    db.session.commit()
    return jsonify(user_info.to_dict()), 200
