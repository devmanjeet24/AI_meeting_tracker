from functools import wraps
from flask import request, jsonify
from utils.jwt_handler import verify_token

def login_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"error": "Token missing"}), 401

        data = verify_token(token)

        if not data:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated