from bson.objectid import ObjectId


def serialize_mongo(data):

    if isinstance(data, list):

        for item in data:
            item["_id"] = str(item["_id"])

    else:

        data["_id"] = str(data["_id"])

    return data