from flask import Blueprint, request, jsonify
from middleware.auth_middleware import login_required
from utils.file_handler import read_uploaded_file

upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/notes", methods=["POST"])
@login_required
def upload_notes():

    file = request.files.get("file")

    if not file or not file.filename:
        return {"error": "No file uploaded"}, 400

    try:
        text = read_uploaded_file(file)
    except ValueError as e:
        return {"error": str(e)}, 400

    return jsonify({"notes": text})
