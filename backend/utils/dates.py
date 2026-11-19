from datetime import datetime, date

_FORMATS = ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%b %d, %Y", "%B %d, %Y", "%d %b %Y", "%d %B %Y")


def parse_deadline(value):
    """Best-effort parse of a free-text deadline. Returns a date or None."""
    if not value or not isinstance(value, str):
        return None
    text = value.strip()
    for fmt in _FORMATS:
        try:
            return datetime.strptime(text[:20].strip(), fmt).date()
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(text[:10]).date()
    except ValueError:
        return None


def is_overdue(action):
    d = parse_deadline(action.get("deadline"))
    return bool(d and d < date.today() and action.get("status") != "Done")
