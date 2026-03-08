from flask import Blueprint, request, jsonify
from utils.file_handler import read_uploaded_file

upload_bp = Blueprint("upload", __name__)

@upload_bp.route("/notes", methods=["POST"])
def upload_notes():

    file = request.files["file"]

    text = read_uploaded_file(file)

    return jsonify({
        "notes": text
    })