import re
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g, Response
from database.db import meetings_collection, actions_collection
from services.ai_service import process_meeting_notes, ask_about_meeting
from middleware.auth_middleware import login_required
from bson.objectid import ObjectId
from bson.errors import InvalidId

meeting_bp = Blueprint("meeting", __name__)

EDITABLE = {"title", "type", "participants", "tags", "pinned", "notes", "summary", "decisions"}


def _now():
    return datetime.now(timezone.utc).isoformat()


def _oid(value):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def _serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc


def _get_owned(meeting_id):
    oid = _oid(meeting_id)
    if not oid:
        return None
    return meetings_collection.find_one({"_id": oid, "user_email": g.user_email})


def _clean_list(value):
    if not isinstance(value, list):
        return []
    return [str(v).strip() for v in value if str(v).strip()]


def _save_actions(items, meeting_id):
    for a in items or []:
        if not isinstance(a, dict) or not a.get("task"):
            continue
        actions_collection.insert_one({
            "task": a.get("task", ""),
            "owner": a.get("owner", ""),
            "priority": a.get("priority") if a.get("priority") in ("High", "Medium", "Low") else "Medium",
            "deadline": a.get("deadline", ""),
            "status": "Pending",
            "meeting_id": meeting_id,
            "user_email": g.user_email,
            "created_at": _now(),
        })


@meeting_bp.route("/create", methods=["POST"])
@login_required
def create_meeting():

    data = request.get_json(silent=True) or {}

    if not data.get("title") or not data.get("notes"):
        return {"error": "title and notes are required"}, 400

    meeting = {
        "title": data["title"],
        "notes": data["notes"],
        "participants": _clean_list(data.get("participants")),
        "tags": _clean_list(data.get("tags")),
        "type": data.get("type"),
        "pinned": False,
        "user_email": g.user_email,
        "created_at": _now(),
    }

    result = meetings_collection.insert_one(meeting)
    meeting["_id"] = str(result.inserted_id)

    return jsonify(meeting)


@meeting_bp.route("/process", methods=["POST"])
@login_required
def process_meeting():

    data = request.get_json(silent=True) or {}
    notes = (data.get("notes") or "").strip()

    if not notes:
        return {"error": "notes are required"}, 400

    ai_result = process_meeting_notes(notes)

    if ai_result is None:
        return {"error": "AI processing failed, please try again"}, 502

    meeting_data = {
        "title": data.get("title"),
        "notes": notes,
        "participants": _clean_list(data.get("participants")),
        "tags": _clean_list(data.get("tags")),
        "type": data.get("type"),
        "pinned": False,
        "summary": ai_result.get("summary"),
        "decisions": ai_result.get("decisions", []),
        "topics": ai_result.get("topics", []),
        "sentiment": ai_result.get("sentiment"),
        "risks": ai_result.get("risks", []),
        "follow_up_email": ai_result.get("follow_up_email"),
        "user_email": g.user_email,
        "created_at": _now(),
    }

    result = meetings_collection.insert_one(meeting_data)
    meeting_id = str(result.inserted_id)

    _save_actions(ai_result.get("action_items"), meeting_id)

    return jsonify({
        "meeting_id": meeting_id,
        "summary": ai_result.get("summary"),
        "decisions": ai_result.get("decisions"),
        "action_items": ai_result.get("action_items"),
    })


@meeting_bp.route("", methods=["GET"])
@login_required
def get_meetings():

    query = {"user_email": g.user_email}

    q = request.args.get("q", "").strip()
    if q:
        rx = {"$regex": re.escape(q), "$options": "i"}
        query["$or"] = [{"title": rx}, {"summary": rx}, {"notes": rx}, {"tags": rx}, {"participants": rx}]

    if request.args.get("type"):
        query["type"] = request.args["type"]

    if request.args.get("pinned") == "true":
        query["pinned"] = True

    meetings = list(meetings_collection.find(query).sort([("pinned", -1), ("_id", -1)]))

    return jsonify([_serialize(m) for m in meetings])


@meeting_bp.route("/search", methods=["GET"])
@login_required
def search_meetings():

    keyword = request.args.get("q", "")

    meetings = list(meetings_collection.find({
        "user_email": g.user_email,
        "title": {"$regex": re.escape(keyword), "$options": "i"}
    }).sort("_id", -1))

    return jsonify([_serialize(m) for m in meetings])


@meeting_bp.route("/<meeting_id>", methods=["GET"])
@login_required
def get_meeting(meeting_id):

    meeting = _get_owned(meeting_id)
    if not meeting:
        return {"error": "Meeting not found"}, 404

    actions = list(actions_collection.find({"meeting_id": meeting_id, "user_email": g.user_email}))
    meeting["actions"] = [_serialize(a) for a in actions]

    return jsonify(_serialize(meeting))


@meeting_bp.route("/<meeting_id>", methods=["PATCH"])
@login_required
def update_meeting(meeting_id):

    data = request.get_json(silent=True) or {}
    changes = {k: v for k, v in data.items() if k in EDITABLE}

    for key in ("participants", "tags", "decisions"):
        if key in changes:
            changes[key] = _clean_list(changes[key])

    if "pinned" in changes:
        changes["pinned"] = bool(changes["pinned"])

    if "title" in changes and not str(changes["title"]).strip():
        return {"error": "Title cannot be empty"}, 400

    if not changes:
        return {"error": "Nothing to update"}, 400

    oid = _oid(meeting_id)
    if not oid:
        return {"error": "Invalid id"}, 400

    result = meetings_collection.update_one(
        {"_id": oid, "user_email": g.user_email}, {"$set": changes}
    )

    if result.matched_count == 0:
        return {"error": "Meeting not found"}, 404

    return {"message": "updated"}


@meeting_bp.route("/<meeting_id>/regenerate", methods=["POST"])
@login_required
def regenerate(meeting_id):

    meeting = _get_owned(meeting_id)
    if not meeting:
        return {"error": "Meeting not found"}, 404

    ai_result = process_meeting_notes(meeting.get("notes", ""))
    if ai_result is None:
        return {"error": "AI processing failed, please try again"}, 502

    meetings_collection.update_one({"_id": meeting["_id"]}, {"$set": {
        "summary": ai_result.get("summary"),
        "decisions": ai_result.get("decisions", []),
        "topics": ai_result.get("topics", []),
        "sentiment": ai_result.get("sentiment"),
        "risks": ai_result.get("risks", []),
        "follow_up_email": ai_result.get("follow_up_email"),
    }})

    return {"message": "regenerated"}


@meeting_bp.route("/<meeting_id>/ask", methods=["POST"])
@login_required
def ask(meeting_id):

    meeting = _get_owned(meeting_id)
    if not meeting:
        return {"error": "Meeting not found"}, 404

    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()
    if not question:
        return {"error": "question is required"}, 400

    answer = ask_about_meeting(
        meeting.get("notes", ""), meeting.get("summary"), question, data.get("history")
    )
    if answer is None:
        return {"error": "AI request failed, please try again"}, 502

    return {"answer": answer}


@meeting_bp.route("/<meeting_id>/export", methods=["GET"])
@login_required
def export_meeting(meeting_id):

    meeting = _get_owned(meeting_id)
    if not meeting:
        return {"error": "Meeting not found"}, 404

    actions = list(actions_collection.find({"meeting_id": meeting_id, "user_email": g.user_email}))

    lines = [f"# {meeting.get('title') or 'Untitled meeting'}", ""]
    lines.append(f"- **Date:** {meeting.get('created_at', '')[:10]}")
    if meeting.get("type"):
        lines.append(f"- **Type:** {meeting['type']}")
    if meeting.get("participants"):
        lines.append(f"- **Participants:** {', '.join(meeting['participants'])}")
    lines += ["", "## Summary", "", meeting.get("summary") or "_No summary_", ""]

    if meeting.get("decisions"):
        lines += ["## Decisions", ""] + [f"- {d}" for d in meeting["decisions"]] + [""]
    if meeting.get("risks"):
        lines += ["## Risks", ""] + [f"- {r}" for r in meeting["risks"]] + [""]
    if actions:
        lines += ["## Action items", ""]
        for a in actions:
            box = "x" if a.get("status") == "Done" else " "
            lines.append(
                f"- [{box}] {a.get('task')} — {a.get('owner') or 'Unassigned'}"
                f" ({a.get('priority')}, due {a.get('deadline') or 'n/a'})"
            )
        lines.append("")
    lines += ["## Original notes", "", meeting.get("notes", "")]

    safe = re.sub(r"[^A-Za-z0-9_-]+", "_", meeting.get("title") or "meeting")[:50]

    return Response(
        "\n".join(lines),
        mimetype="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{safe}.md"'},
    )


@meeting_bp.route("/<meeting_id>", methods=["DELETE"])
@login_required
def delete_meeting(meeting_id):

    oid = _oid(meeting_id)
    if not oid:
        return {"error": "Invalid id"}, 400

    result = meetings_collection.delete_one({"_id": oid, "user_email": g.user_email})

    if result.deleted_count == 0:
        return {"error": "Meeting not found"}, 404

    actions_collection.delete_many({"meeting_id": meeting_id, "user_email": g.user_email})

    return jsonify({"message": "Meeting deleted successfully"})
