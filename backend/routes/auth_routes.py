from flask import Blueprint, request, jsonify
from database.db import users_collection
from utils.jwt_handler import generate_token
import bcrypt

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.json

    password = bcrypt.hashpw(
        data["password"].encode(),
        bcrypt.gensalt()
    )

    user = {
        "name": data["name"],
        "email": data["email"],
        "password": password
    }

    users_collection.insert_one(user)

    return jsonify({"message": "User created"})


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.json

    user = users_collection.find_one({"email": data["email"]})

    if not user:
        return {"error": "User not found"}, 404

    if not bcrypt.checkpw(
        data["password"].encode(),
        user["password"]
    ):
        return {"error": "Wrong password"}, 401

    token = generate_token(user)

    return {"token": token}