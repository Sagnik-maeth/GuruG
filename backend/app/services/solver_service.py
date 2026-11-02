import uuid
import json
from typing import Dict, Any, List, Optional
from backend.app.database import get_db_connection
from backend.app.services.ai_engine import ai_engine
from backend.app.services.visual_engine import find_visual_aid

def solve_academic_problem_sync(
    user_id: str,
    problem_text: str,
    subject: str = "Mathematics",
    language: str = "English",
    grade_level: str = "Class 9–10",
    custom_gemini_key: Optional[str] = None
) -> Dict[str, Any]:
    record_id = f"sol_{uuid.uuid4().hex[:12]}"

    solution = ai_engine.solve_problem_sync(
        problem_text=problem_text,
        subject=subject,
        language=language,
        grade_level=grade_level,
        custom_key=custom_gemini_key
    )

    concept = solution.get("concept_identified", f"{subject} Problem")
    approach = solution.get("approach_explanation", "Step-by-step analytical derivation")
    steps = solution.get("steps", [])
    final_ans = solution.get("final_answer", "Solved successfully")
    practice = solution.get("practice_problem", "Try solving a similar problem with modified values.")
    provider = solution.get("provider", "local_engine")

    # Persist in database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO solver_records (id, user_id, problem_text, subject, concept_identified, approach_explanation, steps_json, final_answer, practice_problem)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (record_id, user_id, problem_text, subject, concept, approach, json.dumps(steps), final_ans, practice))
    conn.commit()
    conn.close()

    # Attach visual diagram for concept visualization
    visual_aid = find_visual_aid(
        user_query=problem_text,
        tutor_response=f"{concept} {approach}",
        subject=subject
    )

    return {
        "id": record_id,
        "problem_text": problem_text,
        "subject": subject,
        "concept_identified": concept,
        "approach_explanation": approach,
        "steps": steps,
        "final_answer": final_ans,
        "practice_problem": practice,
        "provider": provider,
        "visual_aid": visual_aid
    }

async def solve_academic_problem(
    user_id: str,
    problem_text: str,
    subject: str = "Mathematics",
    language: str = "English",
    grade_level: str = "Class 9–10",
    custom_gemini_key: Optional[str] = None
) -> Dict[str, Any]:
    return solve_academic_problem_sync(user_id, problem_text, subject, language, grade_level, custom_gemini_key)

def get_user_solver_history(user_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, problem_text, subject, concept_identified, final_answer, created_at
    FROM solver_records
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 15
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
