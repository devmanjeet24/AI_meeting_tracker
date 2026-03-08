from flask import Flask
from flask_cors import CORS
from config import Config

from routes.meeting_routes import meeting_bp
from routes.action_routes import action_bp
from routes.auth_routes import auth_bp
from routes.upload_routes import upload_bp

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True
)

app.config["UPLOAD_FOLDER"] = Config.UPLOAD_FOLDER


app.register_blueprint(meeting_bp, url_prefix="/meetings")
app.register_blueprint(action_bp, url_prefix="/actions")
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(upload_bp, url_prefix="/upload")


@app.route("/")
def home():
    return {"message": "AI Meeting Tracker API Running"}


if __name__ == "__main__":
    app.run(debug=True)