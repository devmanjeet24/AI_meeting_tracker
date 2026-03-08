from database.db import actions_collection
from bson.objectid import ObjectId


def get_all_actions():

    actions = list(actions_collection.find())

    for a in actions:
        a["_id"] = str(a["_id"])

    return actions


def update_action(action_id, data):

    actions_collection.update_one(
        {"_id": ObjectId(action_id)},
        {"$set": data}
    )

    return {"message": "Action updated"}