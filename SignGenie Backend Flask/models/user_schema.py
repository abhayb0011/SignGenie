from datetime import datetime,timezone

def create_user_document(name, username,email, password_hash):
    return {
        "email": email,
        "password": password_hash,
        "username": username,
        "name": name,
        "sign_history": [], 
        "quiz_high_score": 0,
        "created_at": datetime.now(timezone.utc)
    }
