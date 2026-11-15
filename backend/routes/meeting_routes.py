import re
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from database.db import meetings_collection, actions_collection
from services.ai_service import process_meeting_notes
from middleware.auth_middleware import login_required
from bson.objectid import ObjectId
from bson.errors import InvalidId

meeting_bp = Blueprint("meeting", __name__)


@meeting_bp.route("/create", methods=["POST"])
@login_required
def create_meeting():

    data = request.get_json(silent=True) or {}

    if not data.get("title") or not data.get("notes"):
        return {"error": "title and notes are required"}, 400

    meeting = {
        "title": data["title"],
        "notes": data["notes"],
        "participants": data.get("participants", []),
        "type": data.get("type"),
        "user_email": g.user_email,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    result = meetings_collection.insert_one(meeting)

    meeting["_id"] = str(result.inserted_id)

    return jsonify(meeting)


@meeting_bp.route("/process", methods=["POST"])
@login_required
def process_meeting():

    data = request.get_json(silent=True) or {}
    notes = data.get("notes")

    if not notes:
        return {"error": "notes are required"}, 400

    ai_result = process_meeting_notes(notes)

    if ai_result is None:
        return {"error": "AI processing failed, please try again"}, 502

    meeting_data = {
        "title": data.get("title"),
        "notes": notes,
        "participants": data.get("participants", []),
        "type": data.get("type"),
        "summary": ai_result.get("summary"),
        "decisions": ai_result.get("decisions", []),
        "user_email": g.user_email,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    result = meetings_collection.insert_one(meeting_data)

    for action in ai_result.get("action_items", []):

        actions_collection.insert_one({
            "task": action.get("task", ""),
            "owner": action.get("owner", ""),
            "priority": action.get("priority", "Medium"),
            "deadline": action.get("deadline", ""),
            "status": "Pending",
            "meeting_id": str(result.inserted_id),
            "user_email": g.user_email
        })

    return jsonify({
        "meeting_id": str(result.inserted_id),
        "summary": ai_result.get("summary"),
        "decisions": ai_result.get("decisions"),
        "action_items": ai_result.get("action_items")
    })


@meeting_bp.route("", methods=["GET"])
@login_required
def get_meetings():

    meetings = list(meetings_collection.find({"user_email": g.user_email}).sort("_id", -1))

    for m in meetings:
        m["_id"] = str(m["_id"])

    return jsonify(meetings)


@meeting_bp.route("/search", methods=["GET"])
@login_required
def search_meetings():

    keyword = request.args.get("q", "")

    meetings = list(meetings_collection.find({
        "user_email": g.user_email,
        "title": {"$regex": re.escape(keyword), "$options": "i"}
    }).sort("_id", -1))

    for m in meetings:
        m["_id"] = str(m["_id"])

    return jsonify(meetings)


@meeting_bp.route("/<meeting_id>", methods=["DELETE"])
@login_required
def delete_meeting(meeting_id):

    try:
        oid = ObjectId(meeting_id)
    except InvalidId:
        return {"error": "Invalid id"}, 400

    result = meetings_collection.delete_one(
        {"_id": oid, "user_email": g.user_email}
    )

    if result.deleted_count == 0:
        return {"error": "Meeting not found"}, 404

    actions_collection.delete_many(
        {"meeting_id": meeting_id, "user_email": g.user_email}
    )

    return jsonify({"message": "Meeting deleted successfully"})
