from flask import Blueprint, request, jsonify
from models import db, Flags

flags_bp = Blueprint("flags", __name__)

@flags_bp.route("/flags/<int:user_id>", methods=["GET"])
def get_flags(user_id):
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    flags = Flags.query.filter_by(user_id=user_id).first()
    if not flags:
        return jsonify({"flags": {"user_id": user_id, "mascot_status": "appTour"}}), 200

    return jsonify({"flags": flags.to_dict()}), 200

@flags_bp.route("/flags/<int:user_id>", methods=["PUT"])
def update_flags(user_id): 
    status = request.json.get("status")

    flags = Flags.query.filter_by(user_id=user_id).first()

    if not flags:
        return jsonify({"error": "Flags not found"}), 404

    if not status:
        return jsonify({"error": "User ID is required"}), 400
    
    flags.mascot_status = status
    db.session.commit()
    return jsonify({"message": "Flags updated successfully"}), 200

@flags_bp.route("/flags", methods=["POST"])
def create_flags():
    data = request.get_json().get("data")
    if not data:
        return jsonify({"error": "Data is required"}), 400
    flags = Flags(**data)
    db.session.add(flags)
    db.session.commit()

    return jsonify({"message": "Flags created successfully"}), 200