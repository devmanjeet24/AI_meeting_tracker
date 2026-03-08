class Meeting:

    def __init__(self, title, notes, participants, meeting_type):
        self.title = title
        self.notes = notes
        self.participants = participants
        self.type = meeting_type

    def to_dict(self):
        return {
            "title": self.title,
            "notes": self.notes,
            "participants": self.participants,
            "type": self.type
        }