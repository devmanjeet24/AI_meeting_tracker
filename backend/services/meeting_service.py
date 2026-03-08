from database.db import meetings_collection


def create_meeting(data):

    meeting = {
        "title": data.get("title"),
        "notes": data.get("notes"),
        "participants": data.get("participants"),
        "type": data.get("type")
    }

    result = meetings_collection.insert_one(meeting)

    meeting["_id"] = str(result.inserted_id)

    return meeting


def get_all_meetings():

    meetings = list(meetings_collection.find())

    for m in meetings:
        m["_id"] = str(m["_id"])

    return meetings