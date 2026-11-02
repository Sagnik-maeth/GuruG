import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.database import get_db_connection
from backend.app.models import UserRegister, UserLogin, TokenResponse, UserProfile, OnboardingRequest
from backend.app.auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register_user(data: UserRegister):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check email or username
    cursor.execute("SELECT id FROM users WHERE email = ? OR username = ?", (data.email, data.username))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A student account with this email or username already exists."
        )

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    pwd_hash = get_password_hash(data.password)

    cursor.execute("""
    INSERT INTO users (id, email, username, password_hash, display_name, grade_level, preferred_language)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, data.email, data.username, pwd_hash, data.display_name, data.grade_level, data.preferred_language))

    cursor.execute("""
    INSERT INTO user_settings (user_id, default_mode, sound_enabled)
    VALUES (?, 'Simple Explanation', 1)
    """, (user_id,))

    conn.commit()
    conn.close()

    token = create_access_token({"sub": user_id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": data.email,
            "username": data.username,
            "display_name": data.display_name,
            "grade_level": data.grade_level,
            "preferred_language": data.preferred_language,
            "target_subjects": ["Mathematics", "Physics", "Chemistry"],
            "learning_goal": "Concept Clarity"
        }
    }

@router.post("/login", response_model=TokenResponse)
def login_user(data: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ? OR username = ?", (data.username_or_email, data.username_or_email))
    user_row = cursor.fetchone()
    conn.close()

    if not user_row or not verify_password(data.password, user_row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password."
        )

    user = dict(user_row)
    token = create_access_token({"sub": user["id"]})

    try:
        subjects = json.loads(user.get("target_subjects", "[]"))
    except Exception:
        subjects = ["Mathematics", "Physics", "Chemistry"]

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "display_name": user["display_name"],
            "grade_level": user["grade_level"],
            "preferred_language": user["preferred_language"],
            "target_subjects": subjects,
            "learning_goal": user.get("learning_goal", "Concept Clarity")
        }
    }

@router.post("/demo", response_model=TokenResponse)
def demo_login():
    """1-Click Demo Student Login for Hackathon Judges & Evaluators."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = 'demo@gurug.edu'")
    user_row = cursor.fetchone()
    conn.close()

    if not user_row:
        raise HTTPException(status_code=404, detail="Demo student account not found")

    user = dict(user_row)
    token = create_access_token({"sub": user["id"]})

    try:
        subjects = json.loads(user.get("target_subjects", "[]"))
    except Exception:
        subjects = ["Mathematics", "Physics", "Chemistry", "Computer Science"]

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "display_name": user["display_name"],
            "grade_level": user["grade_level"],
            "preferred_language": user["preferred_language"],
            "target_subjects": subjects,
            "learning_goal": user.get("learning_goal", "Concept Clarity & Exam Prep")
        }
    }

@router.get("/me")
def get_current_profile(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/onboarding")
def complete_onboarding(data: OnboardingRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    display_name = data.display_name or current_user["display_name"]

    cursor.execute("""
    UPDATE users
    SET display_name = ?, grade_level = ?, preferred_language = ?, target_subjects = ?, learning_goal = ?
    WHERE id = ?
    """, (
        display_name,
        data.grade_level,
        data.preferred_language,
        json.dumps(data.target_subjects),
        data.learning_goal,
        user_id
    ))
    conn.commit()

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    updated_user = dict(cursor.fetchone())
    conn.close()

    try:
        updated_user["target_subjects"] = json.loads(updated_user["target_subjects"])
    except Exception:
        updated_user["target_subjects"] = data.target_subjects

    return {"status": "success", "user": updated_user}
