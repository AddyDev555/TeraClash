from flask import Blueprint, request, jsonify
from models import db, TrackLocation

track_location_bp = Blueprint("track_location", __name__)

# Create Track Location
@track_location_bp.route("/track-location", methods=["POST"])
def create_track_location():
    data = request.get_json()

    location = TrackLocation(
        user_id=data.get("user_id"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude")
    )

    db.session.add(location)
    db.session.commit()

    return jsonify({
        "message": "Location tracked successfully",
        "data": location.to_dict()
    }), 201


# Get All Track Locations
@track_location_bp.route("/track-location", methods=["GET"])
def get_track_locations():
    locations = TrackLocation.query.all()

    return jsonify([
        loc.to_dict() for loc in locations
    ])