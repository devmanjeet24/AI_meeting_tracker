from pymongo import MongoClient
from config import Config

if Config.MONGO_URI == "mock":
    # Dev-only in-memory database (data is lost on restart): MONGO_URI=mock
    import mongomock
    client = mongomock.MongoClient()
else:
    client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=8000)

db = client["ai_meeting_tracker"]

meetings_collection = db["meetings"]
actions_collection = db["actions"]
users_collection = db["users"]

print("MongoDB Connected")