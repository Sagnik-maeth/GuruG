from fastapi import APIRouter, Depends
from backend.app.auth import get_current_user
from backend.app.services.analytics import get_user_progress_summary

router = APIRouter(prefix="/api/progress", tags=["Learning Progress & Analytics"])

@router.get("")
def get_progress(current_user: dict = Depends(get_current_user)):
    return get_user_progress_summary(current_user["id"])
