from fastapi import APIRouter, Depends, HTTPException
from backend.app.auth import get_current_user
from backend.app.models import QuizGenerateRequest, QuizSubmitRequest
from backend.app.services.quiz_service import (
    create_and_store_quiz,
    evaluate_quiz_submission,
    get_user_quiz_history
)

router = APIRouter(prefix="/api/quiz", tags=["Smart Quiz Generator"])

@router.post("/generate")
async def generate_quiz_endpoint(
    req: QuizGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        quiz_data = await create_and_store_quiz(
            user_id=current_user["id"],
            subject=req.subject,
            topic=req.topic,
            difficulty=req.difficulty,
            num_questions=req.num_questions,
            question_type=req.question_type,
            language=req.language or current_user.get("preferred_language", "English")
        )
        return quiz_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

@router.post("/evaluate")
def evaluate_quiz_endpoint(
    req: QuizSubmitRequest,
    current_user: dict = Depends(get_current_user)
):
    answers_map = {ans.question_id: ans.selected_answer for ans in req.answers}
    try:
        result = evaluate_quiz_submission(
            user_id=current_user["id"],
            quiz_id=req.quiz_id,
            answers_map=answers_map
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating quiz: {str(e)}")

@router.get("/history")
def get_quiz_history(current_user: dict = Depends(get_current_user)):
    return get_user_quiz_history(current_user["id"])
