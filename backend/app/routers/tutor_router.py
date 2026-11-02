from fastapi import APIRouter, Depends, HTTPException
from backend.app.auth import get_current_user
from backend.app.models import ChatRequest, QuickExplainRequest
from backend.app.services.tutor_service import (
    process_user_chat,
    get_user_sessions,
    get_session_messages,
    create_chat_session,
    clear_session_messages
)
from backend.app.services.ai_engine import ai_engine
from backend.app.services.visual_engine import enrich_tutor_response

router = APIRouter(prefix="/api/tutor", tags=["Multilingual AI Tutor"])

@router.post("/chat")
async def tutor_chat_endpoint(
    req: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = await process_user_chat(
            user_id=current_user["id"],
            message_text=req.message,
            session_id=req.session_id,
            subject=req.subject or "General",
            language=req.language or current_user.get("preferred_language", "English"),
            mode=req.mode or "Simple Explanation",
            grade_level=current_user.get("grade_level", "Class 9–10"),
            custom_gemini_key=req.custom_gemini_key
        )
        return result
    except Exception as e:
        print(f"[TutorRouter] Error in chat processing: {e}")
        # Return fallback response so the frontend user never sees a 500 error!
        raw_fallback = ai_engine._generate_local_tutor_response(
            message=req.message,
            language=req.language or "English",
            mode=req.mode or "Simple Explanation",
            grade_level=current_user.get("grade_level", "Class 9–10"),
            subject=req.subject or "General"
        )
        enriched = enrich_tutor_response(
            text=raw_fallback,
            user_query=req.message,
            subject=req.subject or "General"
        )
        fallback_msg = enriched["content"]
        visual_aid = enriched.get("visual_aid")
        return {
            "session_id": req.session_id or "session_fallback",
            "user_message": {"id": "msg_err_u", "sender": "user", "content": req.message},
            "tutor_message": {
                "id": "msg_err_t",
                "sender": "tutor",
                "content": fallback_msg,
                "visual_aid": visual_aid,
                "language": req.language or "English",
                "mode": req.mode or "Simple Explanation"
            },
            "visual_aid": visual_aid,
            "provider": "local_fallback"
        }

@router.get("/sessions")
def list_chat_sessions(current_user: dict = Depends(get_current_user)):
    return get_user_sessions(current_user["id"])

@router.get("/sessions/{session_id}/messages")
def get_messages(session_id: str, current_user: dict = Depends(get_current_user)):
    from backend.app.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, user_id FROM chat_sessions WHERE id = ?", (session_id,))
    session_row = cursor.fetchone()
    conn.close()
    if not session_row or session_row["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = get_session_messages(session_id)
    return messages

@router.delete("/sessions/{session_id}")
def clear_chat(session_id: str, current_user: dict = Depends(get_current_user)):
    clear_session_messages(session_id, current_user["id"])
    return {"status": "cleared", "session_id": session_id}

@router.post("/quick-explain")
async def quick_explain_concept(
    req: QuickExplainRequest,
    current_user: dict = Depends(get_current_user)
):
    """Instant concept explainer for subject cards & quick triggers."""
    result = await ai_engine.chat_tutor(
        user_message=f"Explain {req.concept} clearly for a student.",
        chat_history=[],
        language=req.language or current_user.get("preferred_language", "English"),
        mode=req.mode or "Simple Explanation",
        grade_level=req.grade_level or current_user.get("grade_level", "Class 9–10"),
        subject=req.subject or "General"
    )
    if result and "text" in result:
        enriched = enrich_tutor_response(
            text=result["text"],
            user_query=req.concept,
            subject=req.subject or "General"
        )
        result["text"] = enriched["content"]
        result["visual_aid"] = enriched.get("visual_aid")
    return result
