from datetime import datetime, timezone

def create_contact_message_document(name, email, message):
    return {
        "name": name,
        "email": email,
        "message": message,
        "submitted_at": datetime.now(timezone.utc)
    }
