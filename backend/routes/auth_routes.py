import re
from flask import Blueprint, request, jsonify, g
from database.db import users_collection
from utils.jwt_handler import generate_token
import bcrypt
from middleware.auth_middleware import login_required

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


@auth_bp.route("/me", methods=["GET"])
@login_required
def me():

    user = users_collection.find_one({"email": g.user_email})

    if not user:
        return {"error": "User not found"}, 404

    return {"name": user.get("name", ""), "email": user["email"]}


@auth_bp.route("/me", methods=["PATCH"])
@login_required
def update_me():

    name = ((request.get_json(silent=True) or {}).get("name") or "").strip()

    if not name:
        return {"error": "Name is required"}, 400

    users_collection.update_one({"email": g.user_email}, {"$set": {"name": name}})

    return {"message": "updated", "name": name}


@auth_bp.route("/password", methods=["POST"])
@login_required
def change_password():

    data = request.get_json(silent=True) or {}
    current = data.get("current_password") or ""
    new = data.get("new_password") or ""

    if len(new) < 6:
        return {"error": "New password must be at least 6 characters"}, 400

    user = users_collection.find_one({"email": g.user_email})

    if not user or not bcrypt.checkpw(current.encode(), user["password"]):
        return {"error": "Current password is incorrect"}, 401

    users_collection.update_one(
        {"email": g.user_email},
        {"$set": {"password": bcrypt.hashpw(new.encode(), bcrypt.gensalt())}}
    )

    return {"message": "Password updated"}
