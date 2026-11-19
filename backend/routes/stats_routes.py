from collections import Counter
from datetime import datetime, timedelta, timezone
from flask import Blueprint, jsonify, g
from database.db import actions_collection, meetings_collection
from middleware.auth_middleware import login_required
from utils.dates import is_overdue, parse_deadline

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/overview", methods=["GET"])
@login_required
def overview():

    meetings = list(meetings_collection.find({"user_email": g.user_email}))
    actions = list(actions_collection.find({"user_email": g.user_email}))

    by_status = Counter(a.get("status", "Pending") for a in actions)
    by_priority = Counter(a.get("priority", "Medium") for a in actions)
    by_type = Counter(m.get("type") or "Other" for m in meetings)
    sentiment = Counter(m.get("sentiment") for m in meetings if m.get("sentiment"))

    owners = Counter(a.get("owner") for a in actions if a.get("owner") and a.get("status") != "Done")

    topics = Counter()
    for m in meetings:
        for t in m.get("topics", []) or []:
            topics[str(t).lower()] += 1

    # meetings per week for the last 8 weeks (oldest first)
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())
    weeks = []
    for i in range(7, -1, -1):
        start = week_start - timedelta(weeks=i)
        weeks.append({"week": start.isoformat(), "meetings": 0})
    index = {w["week"]: w for w in weeks}
    for m in meetings:
        try:
            d = datetime.fromisoformat(m["created_at"]).date()
        except (KeyError, ValueError):
            continue
        key = (d - timedelta(days=d.weekday())).isoformat()
        if key in index:
            index[key]["meetings"] += 1

    upcoming = []
    for a in actions:
        d = parse_deadline(a.get("deadline"))
        if d and a.get("status") != "Done" and 0 <= (d - today).days <= 7:
            upcoming.append({"_id": str(a["_id"]), "task": a.get("task"), "deadline": a.get("deadline")})

    total = len(actions)

    return jsonify({
        "meetings": len(meetings),
        "actions": total,
        "pending": by_status.get("Pending", 0),
        "in_progress": by_status.get("In Progress", 0),
        "done": by_status.get("Done", 0),
        "overdue": sum(1 for a in actions if is_overdue(a)),
        "completion_rate": round(by_status.get("Done", 0) / total * 100) if total else 0,
        "by_priority": dict(by_priority),
        "by_type": dict(by_type),
        "sentiment": dict(sentiment),
        "top_owners": [{"owner": o, "open": c} for o, c in owners.most_common(5)],
        "top_topics": [{"topic": t, "count": c} for t, c in topics.most_common(8)],
        "weekly": weeks,
        "due_soon": upcoming[:5],
    })
