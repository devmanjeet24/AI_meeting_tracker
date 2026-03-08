from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)

db = client["ai_meeting_tracker"]

meetings_collection = db["meetings"]
actions_collection = db["actions"]
users_collection = db["users"]

print("MongoDB Connected")