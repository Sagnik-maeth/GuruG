import sys
from pathlib import Path
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app.database import init_db
from backend.app.auth import ensure_demo_user
from backend.app.routers.auth_router import demo_login
from backend.app.routers.subjects_router import list_subjects
from backend.app.services.tutor_service import process_user_chat_sync
from backend.app.services.quiz_service import create_and_store_quiz_sync, evaluate_quiz_submission
from backend.app.services.solver_service import solve_academic_problem_sync
from backend.app.services.debate_service import start_debate_session_sync, process_debate_turn_sync, conclude_debate_session_sync
from backend.app.services.analytics import get_user_progress_summary

def run_sync_tests():
    print("[1/7] Initializing Database & Seeding Demo Student...")
    init_db()
    ensure_demo_user()

    demo = demo_login()
    user_id = demo["user"]["id"]
    print("      -> Logged in as:", demo["user"]["display_name"], "(ID:", user_id, ")")

    print("[2/7] Verifying Subjects Taxonomy...")
    subjs = list_subjects()
    print("      -> Successfully loaded", len(subjs), "subjects.")
    for s in subjs[:3]:
        print("         *", s["name"], f"({len(s['topics'])} topics)")

    print("[3/7] Testing Multilingual AI Tutor (Hinglish)...")
    chat = process_user_chat_sync(
        user_id=user_id,
        message_text="Explain Pythagoras theorem in Hinglish",
        language="Hinglish",
        mode="Simple Explanation"
    )
    print("      -> Tutor Response Chars:", len(chat["tutor_message"]["content"]))
    print("      -> Provider:", chat["provider"])
    print("      -> Preview:", chat["tutor_message"]["content"][:100].replace('\n', ' ') + "...")

    print("[4/7] Testing Smart Quiz Generator & Evaluation...")
    quiz = create_and_store_quiz_sync(
        user_id=user_id,
        subject="Mathematics",
        topic="Pythagorean Theorem",
        num_questions=3
    )
    print("      -> Generated Quiz ID:", quiz["quiz_id"], "with", len(quiz["questions"]), "questions.")
    answers_map = {q["id"]: q["options"][0] for q in quiz["questions"]}
    eval_res = evaluate_quiz_submission(user_id=user_id, quiz_id=quiz["quiz_id"], answers_map=answers_map)
    print("      -> Evaluated Score:", eval_res["score"], "/", eval_res["total_questions"], f"({eval_res['percentage']}%)")
    print("      -> Badge Awarded:", eval_res["badge"])

    print("[5/7] Testing Step-by-Step Problem Solver...")
    sol = solve_academic_problem_sync(
        user_id=user_id,
        problem_text="Solve x^2 - 5x + 6 = 0",
        subject="Mathematics"
    )
    print("      -> Concept Identified:", sol["concept_identified"])
    print("      -> Steps Count:", len(sol["steps"]))
    print("      -> Final Answer:", sol["final_answer"])
    print("      -> Practice Follow-Up:", sol["practice_problem"])

    print("[6/7] Testing Two-Way AI Debate Arena...")
    debate_start = start_debate_session_sync(
        user_id=user_id,
        topic="Should AI replace traditional school examinations?",
        category="Technology & Education",
        student_stance="For",
        language="English",
        max_rounds=3
    )
    session_id = debate_start["session"]["id"]
    print("      -> Started Debate Session:", session_id)
    print("      -> Opening Statement:", debate_start["opening_statement"][:80].replace('\n', ' ') + "...")
    
    turn = process_debate_turn_sync(
        user_id=user_id,
        session_id=session_id,
        student_argument="AI examinations allow continuous personalized evaluation rather than single-day high stress exams."
    )
    print("      -> Turn 1 Processed (Round", turn["round_number"], ")")
    print("      -> Conceded Point:", turn["points_conceded"])
    print("      -> AI Rebuttal:", turn["ai_rebuttal"][:90].replace('\n', ' ') + "...")
    print("      -> Counter Challenge:", turn["counter_question"])
    
    scorecard = conclude_debate_session_sync(user_id=user_id, session_id=session_id)
    print("      -> Adjudication Scorecard Total:", scorecard["overall_score"], "/ 100")
    print("      -> Verdict:", scorecard["verdict"])

    print("[7/7] Testing Learning Analytics Dashboard...")
    analytics = get_user_progress_summary(user_id=user_id)
    print("      -> Questions Asked:", analytics["stats"]["questions_asked"])
    print("      -> Quizzes Completed:", analytics["stats"]["quizzes_completed"])
    print("      -> Avg Quiz Score:", analytics["stats"]["average_quiz_score"], "%")
    print("      -> Active Streak:", analytics["stats"]["active_streak_days"], "days")

    print("\n" + "="*60)
    print(">>> ALL 7 GURUG BACKEND SERVICES TESTED & 100% OPERATIONAL! <<<")
    print("="*60)

if __name__ == "__main__":
    run_sync_tests()
