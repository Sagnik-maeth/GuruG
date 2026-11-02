from fastapi import APIRouter, Depends, HTTPException
from backend.app.auth import get_current_user
from backend.app.database import get_db_connection
from backend.app.models import SettingsUpdate, ApiKeyTestRequest
from backend.app.config import SUPPORTED_LANGUAGES, EXPLANATION_MODES, EDUCATION_LEVELS

router = APIRouter(prefix="/api/settings", tags=["User Settings & Preferences"])

@router.get("")
def get_user_settings(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_settings WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()

    settings_dict = dict(row) if row else {
        "default_mode": "Simple Explanation",
        "sound_enabled": 1,
        "custom_gemini_key": ""
    }

    # Mask custom key for security
    raw_key = settings_dict.get("custom_gemini_key", "")
    masked = (raw_key[:4] + "..." + raw_key[-4:]) if len(raw_key) > 8 else ("Configured" if raw_key else "None")

    return {
        "profile": {
            "id": current_user["id"],
            "display_name": current_user["display_name"],
            "email": current_user["email"],
            "username": current_user["username"],
            "grade_level": current_user["grade_level"],
            "preferred_language": current_user["preferred_language"],
            "target_subjects": current_user.get("target_subjects", []),
            "learning_goal": current_user.get("learning_goal", "Concept Clarity")
        },
        "settings": {
            "default_mode": settings_dict.get("default_mode", "Simple Explanation"),
            "sound_enabled": bool(settings_dict.get("sound_enabled", 1)),
            "custom_gemini_key_configured": bool(raw_key),
            "custom_gemini_key_masked": masked
        },
        "supported_languages": SUPPORTED_LANGUAGES,
        "explanation_modes": EXPLANATION_MODES,
        "education_levels": EDUCATION_LEVELS
    }

@router.post("/update")
def update_user_settings(data: SettingsUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    # Update profile fields in users table
    if data.preferred_language or data.grade_level or data.display_name:
        cursor.execute("""
        UPDATE users
        SET preferred_language = COALESCE(?, preferred_language),
            grade_level = COALESCE(?, grade_level),
            display_name = COALESCE(?, display_name)
        WHERE id = ?
        """, (data.preferred_language, data.grade_level, data.display_name, user_id))

    # Update settings
    cursor.execute("""
    INSERT INTO user_settings (user_id, default_mode, sound_enabled, custom_gemini_key)
    VALUES (?, COALESCE(?, 'Simple Explanation'), COALESCE(?, 1), COALESCE(?, ''))
    ON CONFLICT(user_id) DO UPDATE SET
        default_mode = COALESCE(?, default_mode),
        sound_enabled = COALESCE(?, sound_enabled),
        custom_gemini_key = COALESCE(?, custom_gemini_key),
        updated_at = CURRENT_TIMESTAMP
    """, (
        user_id,
        data.default_mode,
        1 if data.sound_enabled else 0 if data.sound_enabled is not None else None,
        data.custom_gemini_key,
        data.default_mode,
        1 if data.sound_enabled else 0 if data.sound_enabled is not None else None,
        data.custom_gemini_key
    ))

    conn.commit()
    conn.close()

    return {"status": "success", "message": "Settings updated successfully"}

@router.post("/test-key")
async def test_api_key(data: ApiKeyTestRequest):
    """Test a live Groq (gsk_...), OpenAI (sk-...), or Gemini (AIza...) API key."""
    key = data.api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="API Key cannot be empty")

    # 1. Groq or OpenAI key test
    if key.startswith("gsk_") or key.startswith("sk-"):
        try:
            from openai import OpenAI
            base_url = "https://api.groq.com/openai/v1" if key.startswith("gsk_") else "https://api.openai.com/v1"
            model = "openai/gpt-oss-120b" if key.startswith("gsk_") else "gpt-4o-mini"
            client = OpenAI(base_url=base_url, api_key=key)
            resp = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "Respond with 'GuruG AI Connection Successful!'"}],
                max_tokens=30
            )
            provider_name = "Groq LPU (GPT-OSS 120B)" if key.startswith("gsk_") else "OpenAI (GPT-4o-mini)"
            return {
                "status": "valid",
                "provider": provider_name,
                "message": resp.choices[0].message.content.strip() or f"{provider_name} Connection Successful!"
            }
        except Exception as e:
            return {
                "status": "invalid",
                "message": f"API Key verification failed: {str(e)}"
            }

    # 2. Hugging Face key test (hf_...)
    if key.startswith("hf_"):
        try:
            import urllib.request, json, os, re
            from backend.app.config import BASE_DIR

            # 1. Verify token identity with official Hugging Face API
            whoami_req = urllib.request.Request(
                "https://huggingface.co/api/whoami-v2",
                headers={"Authorization": f"Bearer {key}"}
            )
            user_name = "User"
            with urllib.request.urlopen(whoami_req, timeout=10) as r:
                user_info = json.loads(r.read().decode())
                user_name = user_info.get("name") or user_info.get("fullname") or "User"

            # 2. Persist to env and memory
            os.environ["HF_TOKEN"] = key
            try:
                env_file = BASE_DIR / ".env"
                if env_file.exists():
                    env_text = env_file.read_text(encoding="utf-8")
                    if "HF_TOKEN=" in env_text:
                        env_text = re.sub(r'HF_TOKEN=.*', f'HF_TOKEN={key}', env_text)
                    else:
                        env_text += f"\nHF_TOKEN={key}\n"
                    env_file.write_text(env_text, encoding="utf-8")
            except Exception as env_err:
                print(f"[Settings] Note updating .env: {env_err}")

            return {
                "status": "valid",
                "provider": f"Hugging Face (@{user_name})",
                "message": f"Hugging Face account verified for @{user_name}! GuruG Lens is now connected."
            }
        except Exception as e:
            return {
                "status": "invalid",
                "message": f"Hugging Face Token verification failed: {str(e)}"
            }

    # 2. Google Gemini test
    try:
        from google import genai
        test_client = genai.Client(api_key=key)
        resp = test_client.models.generate_content(
            model="gemini-1.5-flash",
            contents="Say 'GuruG AI Connection Successful!' in one short sentence."
        )
        return {
            "status": "valid",
            "provider": "Google Gemini",
            "message": resp.text.strip() or "Connection Successful!"
        }
    except Exception as e:
        return {
            "status": "invalid",
            "message": f"API Key verification failed: {str(e)}"
        }
