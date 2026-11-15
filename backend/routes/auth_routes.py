import re
from flask import Blueprint, request, jsonify
from database.db import users_collection
from utils.jwt_handler import generate_token
import bcrypt

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not EMAIL_RE.match(email):
        return {"error": "Valid name and email are required"}, 400

    if len(password) < 6:
        return {"error": "Password must be at least 6 characters"}, 400

    if users_collection.find_one({"email": email}):
        return {"error": "Email already registered"}, 409

    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    })

    return jsonify({"message": "User created"})


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = users_collection.find_one({"email": email})

    if not user:
        return {"error": "User not found"}, 404

    if not bcrypt.checkpw(password.encode(), user["password"]):
        return {"error": "Wrong password"}, 401

    return {"token": generate_token(user)}
