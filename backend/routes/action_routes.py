from flask import Blueprint, jsonify, request, g
from database.db import actions_collection, meetings_collection
from bson.objectid import ObjectId
from bson.errors import InvalidId
from middleware.auth_middleware import login_required

action_bp = Blueprint("actions", __name__)

ALLOWED_FIELDS = {"status", "priority", "deadline", "owner", "task"}


@action_bp.route("", methods=["GET"])
@login_required
def get_actions():

    actions = list(actions_collection.find({"user_email": g.user_email}).sort("_id", -1))

    for a in actions:
        a["_id"] = str(a["_id"])

    return jsonify(actions)


@action_bp.route("/<id>", methods=["PATCH"])
@login_required
def update_action(id):

    data = request.get_json(silent=True) or {}
    changes = {k: v for k, v in data.items() if k in ALLOWED_FIELDS}

    if not changes:
        return {"error": "Nothing to update"}, 400

    try:
        oid = ObjectId(id)
    except InvalidId:
        return {"error": "Invalid id"}, 400

    result = actions_collection.update_one(
        {"_id": oid, "user_email": g.user_email},
        {"$set": changes}
    )

    if result.matched_count == 0:
        return {"error": "Action not found"}, 404

    return {"message": "updated"}
