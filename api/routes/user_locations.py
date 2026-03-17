from flask import Blueprint, request, jsonify
from models import db, UserLocation

user_location_bp = Blueprint("user_location", __name__)

# Get All User Location
@user_location_bp.route("/locations", methods=["GET"])
def get_locations():
    locations = UserLocation.query.all()

    return jsonify([
        loc.to_dict() for loc in locations
    ])

# Get User Location
@user_location_bp.route("/locations/user/<int:user_id>", methods=["GET"])
def get_user_locations(user_id):
    locations = UserLocation.query.filter_by(user_id=user_id).all()

    return jsonify([
        loc.to_dict() for loc in locations
    ])

# Create User new location
@user_location_bp.route("/locations", methods=["POST"])
def create_location():
    data = request.get_json()

    location = UserLocation(
        user_id=data.get("user_id"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        area_name=data.get("area_name")
    )

    db.session.add(location)
    db.session.commit()

    return jsonify({
        "message": "Location created",
        "data": location.to_dict()
    }), 201

# Update User Location
@user_location_bp.route("/locations/<int:id>", methods=["PUT"])
def update_location(id):
    location = UserLocation.query.get_or_404(id)

    data = request.get_json()

    location.latitude = data.get("latitude", location.latitude)
    location.longitude = data.get("longitude", location.longitude)
    location.area_name = data.get("area_name", location.area_name)

    db.session.commit()

    return jsonify({
        "message": "Location updated",
        "data": location.to_dict()
    })