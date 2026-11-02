import asyncio
import json
import uuid
from typing import Dict, Any, List, Optional
from backend.app.database import get_db_connection
from backend.app.services.ai_engine import ai_engine
from backend.app.services.visual_engine import enrich_tutor_response, strip_visuals

def create_chat_session(user_id: str, title: str, subject: str = "General", language: str = "English", mode: str = "Simple Explanation") -> Dict[str, Any]:
    session_id = f"session_{uuid.uuid4().hex[:12]}"
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO chat_sessions (id, user_id, title, subject, language, mode)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (session_id, user_id, title, subject, language, mode))
    conn.commit()

    cursor.execute("SELECT * FROM chat_sessions WHERE id = ?", (session_id,))
    session = dict(cursor.fetchone())
    conn.close()
    return session

def get_user_sessions(user_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_session_messages(session_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY rowid ASC", (session_id,))
    rows = cursor.fetchall()
    conn.close()
    messages = []
    for r in rows:
        d = dict(r)
        v_raw = d.get("visual_json")
        if v_raw:
            try:
                d["visual_aid"] = json.loads(v_raw) if isinstance(v_raw, str) else v_raw
            except Exception:
                d["visual_aid"] = None
        else:
            d["visual_aid"] = None
        messages.append(d)
    return messages

def process_user_chat_sync(
    user_id: str,
    message_text: str,
    session_id: Optional[str] = None,
    subject: str = "General",
    language: str = "English",
    mode: str = "Simple Explanation",
    grade_level: str = "Class 9–10",
    custom_gemini_key: Optional[str] = None
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create session if needed
    if not session_id:
        title = message_text[:35] + ("..." if len(message_text) > 35 else "")
        session_id = f"session_{uuid.uuid4().hex[:12]}"
        cursor.execute("""
        INSERT INTO chat_sessions (id, user_id, title, subject, language, mode)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (session_id, user_id, title, subject, language, mode))
        conn.commit()
    else:
        cursor.execute("SELECT * FROM chat_sessions WHERE id = ?", (session_id,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO chat_sessions (id, user_id, title, subject, language, mode)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (session_id, user_id, message_text[:35], subject, language, mode))
            conn.commit()

    # Fetch recent history for context BEFORE inserting current user message
    # Query last 10 messages by rowid DESC, then reverse to chronological order
    cursor.execute("""
    SELECT sender, content, visual_json
    FROM chat_messages
    WHERE session_id = ?
    ORDER BY rowid DESC
    LIMIT 10
    """, (session_id,))
    history_rows = cursor.fetchall()
    history_chronological = [dict(r) for r in reversed(history_rows)]

    # Extract recent_image_ids from the last 2 tutor messages in this session
    recent_tutor_msgs = [m for m in history_chronological if m.get("sender") == "tutor"][-2:]
    recent_image_ids = []
    for tm in recent_tutor_msgs:
        v_raw = tm.get("visual_json")
        if v_raw:
            try:
                v_obj = json.loads(v_raw) if isinstance(v_raw, str) else v_raw
                if isinstance(v_obj, dict) and "id" in v_obj:
                    recent_image_ids.append(v_obj["id"])
            except Exception:
                pass

    # Build clean chat history for AI engine (strip all visual card HTML / tags)
    clean_chat_history = [
        {
            "sender": msg["sender"],
            "content": strip_visuals(msg.get("content", ""))
        }
        for msg in history_chronological
    ]

    # Save user message now
    user_msg_id = f"msg_{uuid.uuid4().hex[:12]}"
    cursor.execute("""
    INSERT INTO chat_messages (id, session_id, sender, content, language, mode, visual_json)
    VALUES (?, ?, 'user', ?, ?, ?, NULL)
    """, (user_msg_id, session_id, message_text, language, mode))
    conn.commit()

    # Generate response from AI engine
    ai_result = ai_engine.chat_tutor_sync(
        user_message=message_text,
        chat_history=clean_chat_history,
        language=language,
        mode=mode,
        grade_level=grade_level,
        subject=subject,
        custom_key=custom_gemini_key
    )

    raw_content = ai_result["text"]
    provider = ai_result.get("provider", "local_engine")

    # Enrich response with relevant educational pictures and concept diagrams
    visual_enrichment = enrich_tutor_response(
        text=raw_content,
        user_query=message_text,
        subject=subject,
        recent_image_ids=recent_image_ids
    )
    tutor_content = visual_enrichment["content"]
    visual_aid = visual_enrichment.get("visual_aid")
    visual_json_str = json.dumps(visual_aid) if visual_aid else None

    # Save tutor response (with visual stored cleanly in visual_json)
    tutor_msg_id = f"msg_{uuid.uuid4().hex[:12]}"
    cursor.execute("""
    INSERT INTO chat_messages (id, session_id, sender, content, language, mode, visual_json)
    VALUES (?, ?, 'tutor', ?, ?, ?, ?)
    """, (tutor_msg_id, session_id, tutor_content, language, mode, visual_json_str))

    # Update session's updated_at
    cursor.execute("UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (session_id,))
    conn.commit()

    # Fetch back full rows
    cursor.execute("SELECT * FROM chat_messages WHERE id = ?", (user_msg_id,))
    user_msg_row = dict(cursor.fetchone())
    cursor.execute("SELECT * FROM chat_messages WHERE id = ?", (tutor_msg_id,))
    tutor_msg_row = dict(cursor.fetchone())
    tutor_msg_row["visual_aid"] = visual_aid
    conn.close()

    return {
        "session_id": session_id,
        "user_message": user_msg_row,
        "tutor_message": tutor_msg_row,
        "visual_aid": visual_aid,
        "provider": provider,
        "language": language,
        "mode": mode
    }

async def process_user_chat(
    user_id: str,
    message_text: str,
    session_id: Optional[str] = None,
    subject: str = "General",
    language: str = "English",
    mode: str = "Simple Explanation",
    grade_level: str = "Class 9–10",
    custom_gemini_key: Optional[str] = None
) -> Dict[str, Any]:
    return await asyncio.to_thread(
        process_user_chat_sync,
        user_id=user_id,
        message_text=message_text,
        session_id=session_id,
        subject=subject,
        language=language,
        mode=mode,
        grade_level=grade_level,
        custom_gemini_key=custom_gemini_key
    )

def clear_session_messages(session_id: str, user_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chat_messages WHERE session_id = ? AND session_id IN (SELECT id FROM chat_sessions WHERE user_id = ?)", (session_id, user_id))
    conn.commit()
    conn.close()
    return True
