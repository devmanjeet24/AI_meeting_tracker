from flask import Blueprint, request, jsonify
from database.db import meetings_collection, actions_collection
from services.gemini_service import process_meeting_notes
from middleware.auth_middleware import login_required
from bson.objectid import ObjectId

meeting_bp = Blueprint("meeting", __name__)


@meeting_bp.route("/create", methods=["POST"])
@login_required
def create_meeting():

    data = request.json

    meeting = {
        "title": data["title"],
        "notes": data["notes"],
        "participants": data["participants"],
        "type": data["type"]
    }

    result = meetings_collection.insert_one(meeting)

    meeting["_id"] = str(result.inserted_id)

    return jsonify(meeting)


@meeting_bp.route("/process", methods=["POST"])
@login_required
def process_meeting():

    data = request.json
    notes = data["notes"]

    ai_result = process_meeting_notes(notes)

    meeting_data = {
        "title": data.get("title"),
        "notes": notes,
        "participants": data.get("participants", []),
        "type": data.get("type"),
        "summary": ai_result.get("summary"),
        "decisions": ai_result.get("decisions", [])
    }

    result = meetings_collection.insert_one(meeting_data)

    for action in ai_result.get("action_items", []):

        actions_collection.insert_one({
            "task": action["task"],
            "owner": action["owner"],
            "priority": action["priority"],
            "deadline": action["deadline"],
            "status": "Pending",
            "meeting_id": str(result.inserted_id)
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

    meetings = list(meetings_collection.find())

    for m in meetings:
        m["_id"] = str(m["_id"])

    return jsonify(meetings)


@meeting_bp.route("/search", methods=["GET"])
@login_required
def search_meetings():

    keyword = request.args.get("q","")

    meetings = list(meetings_collection.find({
        "title": {"$regex": keyword, "$options":"i"}
    }))

    for m in meetings:
        m["_id"] = str(m["_id"])

    return jsonify(meetings)