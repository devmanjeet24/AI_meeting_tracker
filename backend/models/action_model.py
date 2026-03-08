class ActionItem:

    def __init__(self, task, owner, priority, deadline):
        self.task = task
        self.owner = owner
        self.priority = priority
        self.deadline = deadline
        self.status = "Pending"

    def to_dict(self):

        return {
            "task": self.task,
            "owner": self.owner,
            "priority": self.priority,
            "deadline": self.deadline,
            "status": self.status
        }