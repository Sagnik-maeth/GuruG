"""
GuruG Lens Router - Visual Recognition, OCR Text Scan & Cloud Knowledge Search
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.app.auth import get_current_user_optional
from backend.app.database import get_db
from backend.app.services.lens_service import lens_service

router = APIRouter(prefix="/api/lens", tags=["lens"])

class LensScanRequest(BaseModel):
    image_data: Optional[str] = None
    extracted_text: Optional[str] = None
    mode: Optional[str] = "search"  # "search" | "text" | "homework"
    language: Optional[str] = "English"
    grade_level: Optional[str] = "Class 9–10"
    query_hint: Optional[str] = None
    custom_key: Optional[str] = None

@router.get("/samples")
def get_lens_samples():
    """Returns curated educational sample scans for 1-click testing."""
    return {"status": "success", "samples": lens_service.get_preset_samples()}

@router.post("/scan")
def scan_image_or_text(
    payload: LensScanRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
    db=Depends(get_db)
):
    """
    Scans an image or extracted text, identifies concepts using Cloud AI,
    and returns comprehensive educational search results with diagrams and KaTeX formulas.
    """
    custom_key = payload.custom_key or None
    lang = payload.language or "English"
    grade = payload.grade_level or "Class 9–10"

    if current_user:
        if not payload.language and current_user.get("preferred_language"):
            lang = current_user["preferred_language"]
        if not payload.grade_level and current_user.get("grade_level"):
            grade = current_user["grade_level"]

        if not custom_key:
            cursor = db.cursor()
            cursor.execute("SELECT custom_gemini_key FROM user_settings WHERE user_id = ?", (current_user["id"],))
            row = cursor.fetchone()
            if row and row["custom_gemini_key"]:
                custom_key = row["custom_gemini_key"]

    try:
        result = lens_service.scan_image(
            image_data=payload.image_data,
            extracted_text=payload.extracted_text,
            mode=payload.mode or "search",
            language=lang,
            grade_level=grade,
            query_hint=payload.query_hint,
            custom_key=custom_key
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lens scan failed: {str(e)}")
