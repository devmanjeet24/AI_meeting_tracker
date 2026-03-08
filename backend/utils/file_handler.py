import os
from config import Config

def read_uploaded_file(file):

    path = os.path.join(Config.UPLOAD_FOLDER, file.filename)

    file.save(path)

    with open(path, "r") as f:
        text = f.read()

    return text