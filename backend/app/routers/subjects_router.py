from fastapi import APIRouter, HTTPException
from backend.app.services.subjects_data import get_all_subjects, get_subject_by_id

router = APIRouter(prefix="/api/subjects", tags=["Subject Explorer"])

@router.get("")
def list_subjects():
    return get_all_subjects()

@router.get("/{subject_id}")
def get_subject_details(subject_id: str):
    subj = get_subject_by_id(subject_id)
    if not subj:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subj
