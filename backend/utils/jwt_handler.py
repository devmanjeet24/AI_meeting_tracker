import jwt
from datetime import datetime, timedelta
from config import Config

def generate_token(user):

    payload = {
        "email": user["email"],
        "exp": datetime.utcnow() + timedelta(days=1)
    }

    token = jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")

    return token


def verify_token(token):

    try:

        data = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])

        return data

    except:

        return None