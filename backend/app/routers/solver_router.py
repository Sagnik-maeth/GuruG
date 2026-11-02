from fastapi import APIRouter, Depends, HTTPException
from backend.app.auth import get_current_user
from backend.app.models import ProblemSolveRequest
from backend.app.services.solver_service import solve_academic_problem, get_user_solver_history

router = APIRouter(prefix="/api/solver", tags=["Step-by-Step Problem Solver"])

@router.post("/solve")
async def solve_problem_endpoint(
    req: ProblemSolveRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        solution = await solve_academic_problem(
            user_id=current_user["id"],
            problem_text=req.problem_text,
            subject=req.subject or "Mathematics",
            language=req.language or current_user.get("preferred_language", "English"),
            grade_level=req.grade_level or current_user.get("grade_level", "Class 9–10")
        )
        return solution
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Problem solving error: {str(e)}")

@router.get("/history")
def get_solver_history(current_user: dict = Depends(get_current_user)):
    return get_user_solver_history(current_user["id"])
