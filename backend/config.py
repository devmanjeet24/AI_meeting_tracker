import os
from dotenv import load_dotenv

load_dotenv()


class Config:

    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MONGO_URI = os.getenv("MONGO_URI")
    JWT_SECRET = os.getenv("JWT_SECRET")

    MAX_UPLOAD_BYTES = 2 * 1024 * 1024  # 2 MB


for _name in ("MONGO_URI", "GROQ_API_KEY", "JWT_SECRET"):
    if not getattr(Config, _name):
        raise RuntimeError(f"Missing {_name} in backend/.env (see .env.example)")
