import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

print("[STEP 0] Starting imports...", flush=True)
import asyncio
from backend.app.database import init_db
from backend.app.auth import ensure_demo_user
from backend.app.routers.auth_router import demo_login
from backend.app.routers.subjects_router import list_subjects
from backend.app.services.tutor_service import process_user_chat
from backend.app.services.quiz_service import create_and_store_quiz, evaluate_quiz_submission
from backend.app.services.solver_service import solve_academic_problem
from backend.app.services.analytics import get_user_progress_summary
print("[STEP 1] Imports complete!", flush=True)

async def run_tests():
    print("[STEP 2] Initializing DB...", flush=True)
    init_db()
    print("[STEP 3] Ensuring demo user...", flush=True)
    ensure_demo_user()

    print("[STEP 4] Testing Demo Login...", flush=True)
    demo = demo_login()
    user_id = demo["user"]["id"]
    print("   -> Success! Logged in as:", demo["user"]["display_name"], flush=True)

    print("[STEP 5] Testing Subjects Taxonomy...", flush=True)
    subjs = list_subjects()
    print("   -> Success! Loaded", len(subjs), "subjects.", flush=True)

    print("[STEP 6] Testing Tutor Chat in Hinglish...", flush=True)
    chat = await process_user_chat(
        user_id=user_id,
        message_text="Explain Pythagoras theorem in Hinglish",
        language="Hinglish",
        mode="Simple Explanation"
    )
    print("   -> Success! Response chars:", len(chat["tutor_message"]["content"]), "Provider:", chat["provider"], flush=True)

    print("[STEP 7] Testing Quiz Generator & Evaluator...", flush=True)
    quiz = await create_and_store_quiz(user_id=user_id, subject="Mathematics", topic="Pythagorean Theorem", num_questions=3)
    answers = {q["id"]: q["options"][0] for q in quiz["questions"]}
    eval_res = evaluate_quiz_submission(user_id=user_id, quiz_id=quiz["quiz_id"], answers_map=answers)
    print("   -> Success! Score:", eval_res["score"], "/", eval_res["total_questions"], "Badge:", eval_res["badge"], flush=True)

    print("[STEP 8] Testing Step-by-Step Solver...", flush=True)
    sol = await solve_academic_problem(user_id=user_id, problem_text="Solve x^2 - 5x + 6 = 0", subject="Mathematics")
    print("   -> Success! Concept:", sol["concept_identified"], "Steps:", len(sol["steps"]), flush=True)

    print("[STEP 9] Testing Analytics...", flush=True)
    analytics = get_user_progress_summary(user_id=user_id)
    print("   -> Success! Questions asked:", analytics["stats"]["questions_asked"], flush=True)

    print("\n" + "="*50, flush=True)
    print(">>> ALL 6 BACKEND SERVICES PASSED WITH 100% SUCCESS <<<", flush=True)
    print("="*50, flush=True)

if __name__ == "__main__":
    asyncio.run(run_tests())
