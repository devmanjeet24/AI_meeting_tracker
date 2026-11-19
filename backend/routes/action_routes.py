import csv
import io
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request, g, Response
from database.db import actions_collection, meetings_collection
from bson.objectid import ObjectId
from bson.errors import InvalidId
from middleware.auth_middleware import login_required
from utils.dates import is_overdue

action_bp = Blueprint("actions", __name__)

ALLOWED_FIELDS = {"status", "priority", "deadline", "owner", "task"}
STATUSES = ("Pending", "In Progress", "Done")
PRIORITIES = ("High", "Medium", "Low")


def _oid(value):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def _validate(changes):
    if "status" in changes and changes["status"] not in STATUSES:
        return "Invalid status"
    if "priority" in changes and changes["priority"] not in PRIORITIES:
        return "Invalid priority"
    if "task" in changes and not str(changes["task"]).strip():
        return "Task cannot be empty"
    return None


def _titles():
    return {
        str(m["_id"]): m.get("title")
        for m in meetings_collection.find({"user_email": g.user_email}, {"title": 1})
    }


@action_bp.route("", methods=["GET"])
@login_required
def get_actions():

    actions = list(actions_collection.find({"user_email": g.user_email}).sort("_id", -1))
    titles = _titles()

    for a in actions:
        a["_id"] = str(a["_id"])
        a["meeting_title"] = titles.get(a.get("meeting_id"))
        a["overdue"] = is_overdue(a)

    return jsonify(actions)


@action_bp.route("", methods=["POST"])
@login_required
def create_action():

    data = request.get_json(silent=True) or {}
    task = (data.get("task") or "").strip()

    if not task:
        return {"error": "Task is required"}, 400

    doc = {
        "task": task,
        "owner": data.get("owner", ""),
        "priority": data.get("priority") if data.get("priority") in PRIORITIES else "Medium",
        "deadline": data.get("deadline", ""),
        "status": "Pending",
        "meeting_id": data.get("meeting_id"),
        "user_email": g.user_email,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    result = actions_collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)

    return jsonify(doc), 201


@action_bp.route("/export", methods=["GET"])
@login_required
def export_actions():

    titles = _titles()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Task", "Owner", "Priority", "Deadline", "Status", "Meeting"])

    for a in actions_collection.find({"user_email": g.user_email}).sort("_id", -1):
        writer.writerow([
            a.get("task"), a.get("owner"), a.get("priority"), a.get("deadline"),
            a.get("status"), titles.get(a.get("meeting_id"), ""),
        ])

    return Response(
        buf.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": 'attachment; filename="action-items.csv"'},
    )


@action_bp.route("/<id>", methods=["PATCH"])
@login_required
def update_action(id):

    data = request.get_json(silent=True) or {}
    changes = {k: v for k, v in data.items() if k in ALLOWED_FIELDS}

    if not changes:
        return {"error": "Nothing to update"}, 400

    problem = _validate(changes)
    if problem:
        return {"error": problem}, 400

    oid = _oid(id)
    if not oid:
        return {"error": "Invalid id"}, 400

    if changes.get("status") == "Done":
        changes["completed_at"] = datetime.now(timezone.utc).isoformat()

    result = actions_collection.update_one(
        {"_id": oid, "user_email": g.user_email}, {"$set": changes}
    )

    if result.matched_count == 0:
        return {"error": "Action not found"}, 404

    return {"message": "updated"}


@action_bp.route("/<id>", methods=["DELETE"])
@login_required
def delete_action(id):

    oid = _oid(id)
    if not oid:
        return {"error": "Invalid id"}, 400

    result = actions_collection.delete_one({"_id": oid, "user_email": g.user_email})

    if result.deleted_count == 0:
        return {"error": "Action not found"}, 404

    return {"message": "deleted"}
