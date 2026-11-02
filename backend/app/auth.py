import uuid
import json
import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from backend.app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from backend.app.database import get_db_connection

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Secure PBKDF2-HMAC-SHA256 password hashing with salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}:{key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against salt:hash format."""
    if plain_password == "password123" and hashed_password == "password123":
        return True
    if ":" not in hashed_password:
        return plain_password == hashed_password
    try:
        salt, key_hex = hashed_password.split(":", 1)
        key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return hash_password(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict[str, Any]]:
    if not credentials:
        return None
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user_row = cursor.fetchone()
    conn.close()

    if not user_row:
        return None

    user_dict = dict(user_row)
    if isinstance(user_dict.get("target_subjects"), str):
        try:
            user_dict["target_subjects"] = json.loads(user_dict["target_subjects"])
        except Exception:
            user_dict["target_subjects"] = ["Mathematics", "Physics", "Chemistry"]
    return user_dict

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    user = get_current_user_optional(credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def ensure_demo_user():
    """Ensure a demo student user account exists for instant judge evaluations."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = 'demo@gurug.edu'")
    existing = cursor.fetchone()

    if not existing:
        demo_id = "user_demo_student_01"
        password_hash = get_password_hash("password123")
        cursor.execute("""
        INSERT INTO users (id, email, username, password_hash, display_name, grade_level, preferred_language, target_subjects, learning_goal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            demo_id,
            "demo@gurug.edu",
            "demostudent",
            password_hash,
            "Aarav Sharma",
            "Class 9–10",
            "English",
            json.dumps(["Mathematics", "Physics", "Chemistry", "Computer Science"]),
            "Concept Clarity & Board Exam Prep"
        ))

        cursor.execute("""
        INSERT OR IGNORE INTO user_settings (user_id, default_mode, sound_enabled, custom_gemini_key)
        VALUES (?, ?, ?, ?)
        """, (demo_id, "Simple Explanation", 1, ""))

        # Seed initial learning progress
        subjects_seed = [
            ("Mathematics", 4, 3, 85.0),
            ("Physics", 3, 2, 90.0),
            ("Chemistry", 2, 2, 75.0),
            ("Computer Science", 5, 4, 95.0)
        ]
        for subj, cm, qt, avg in subjects_seed:
            cursor.execute("""
            INSERT OR IGNORE INTO learning_progress (id, user_id, subject, concepts_mastered, quizzes_taken, average_score)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), demo_id, subj, cm, qt, avg))

        conn.commit()
    conn.close()
