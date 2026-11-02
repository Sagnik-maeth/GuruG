from fastapi import APIRouter, Depends, HTTPException
from backend.app.auth import get_current_user
from backend.app.models import (
    DebateStartRequest,
    DebateTurnRequest,
    DebateConcludeRequest,
    DebateTurnResponse,
    DebateScorecardResponse
)
from backend.app.services.debate_service import (
    get_debate_topics,
    start_debate_session_sync,
    process_debate_turn_sync,
    conclude_debate_session_sync
)
from backend.app.database import get_db_connection

router = APIRouter(prefix="/api/debate", tags=["AI Debate Arena"])

@router.get("/topics")
def list_topics():
    return get_debate_topics()

@router.post("/start")
def start_debate(
    req: DebateStartRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = start_debate_session_sync(
            user_id=current_user["id"],
            topic=req.topic,
            category=req.category or "General",
            student_stance=req.student_stance,
            language=req.language or current_user.get("preferred_language", "English"),
            max_rounds=req.max_rounds or 3,
            custom_gemini_key=req.custom_gemini_key
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initiate debate: {str(e)}")

@router.post("/turn", response_model=DebateTurnResponse)
def execute_debate_turn(
    req: DebateTurnRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        turn = process_debate_turn_sync(
            user_id=current_user["id"],
            session_id=req.session_id,
            student_argument=req.student_argument,
            round_number=req.round_number,
            language=req.language or current_user.get("preferred_language", "English"),
            custom_gemini_key=req.custom_gemini_key
        )
        return turn
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debate turn error: {str(e)}")

@router.post("/conclude", response_model=DebateScorecardResponse)
def conclude_debate(
    req: DebateConcludeRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        scorecard = conclude_debate_session_sync(
            user_id=current_user["id"],
            session_id=req.session_id,
            custom_gemini_key=req.custom_gemini_key
        )
        return scorecard
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to adjudicate debate: {str(e)}")

@router.get("/history")
def get_debate_history(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, topic, category, student_stance, ai_stance, rounds_completed, final_score, verdict, created_at
    FROM debate_sessions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 15
    """, (current_user["id"],))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
