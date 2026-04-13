from flask import Blueprint, request, jsonify
from models import db, Analysis

analysis_bp = Blueprint("analysis", __name__)

# 🔹 GET Analysis by user_id
@analysis_bp.route("/analysis/<int:user_id>", methods=["GET"])
def get_analysis(user_id):
    analysis = Analysis.query.filter_by(user_id=user_id).first()

    if not analysis:
        return jsonify({"error": "Analysis not found"}), 200
    
    return jsonify(analysis.to_dict()), 200


# 🔹 CREATE Analysis
@analysis_bp.route("/analysis", methods=["POST"])
def create_analysis():
    data = request.get_json()

    try:
        new_analysis = Analysis(
            user_id=data.get("user_id"),
            steps=data.get("steps", 0),
            distance=data.get("distance", 0.0),
            calories_burned=data.get("calories_burned", 0.0)
        )

        db.session.add(new_analysis)
        db.session.commit()

        return jsonify(new_analysis.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500