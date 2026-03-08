from flask import Blueprint, jsonify, request
from database.db import actions_collection
from bson.objectid import ObjectId
from middleware.auth_middleware import login_required

action_bp = Blueprint("actions", __name__)


@action_bp.route("", methods=["GET"])
@login_required
def get_actions():

    actions = list(actions_collection.find())

    for a in actions:
        a["_id"] = str(a["_id"])

    return jsonify(actions)


@action_bp.route("/<id>", methods=["PATCH"])
@login_required
def update_action(id):

    data = request.json

    actions_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )

    return {"message": "updated"}