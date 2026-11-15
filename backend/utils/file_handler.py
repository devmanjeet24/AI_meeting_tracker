from config import Config


def read_uploaded_file(file):
    """Read an uploaded .txt file in memory (nothing is saved to disk)."""

    if not file.filename.lower().endswith(".txt"):
        raise ValueError("Only .txt files are allowed")

    raw = file.read(Config.MAX_UPLOAD_BYTES + 1)

    if len(raw) > Config.MAX_UPLOAD_BYTES:
        raise ValueError("File too large (max 2 MB)")

    return raw.decode("utf-8", errors="replace")
