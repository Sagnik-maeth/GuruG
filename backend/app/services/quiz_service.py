import uuid
import json
from typing import Dict, Any, List, Optional
from backend.app.database import get_db_connection
from backend.app.services.ai_engine import ai_engine

def create_and_store_quiz_sync(
    user_id: str,
    subject: str,
    topic: str,
    difficulty: str = "Medium",
    num_questions: int = 5,
    question_type: str = "MCQ",
    language: str = "English",
    custom_gemini_key: Optional[str] = None
) -> Dict[str, Any]:
    quiz_id = f"quiz_{uuid.uuid4().hex[:12]}"
    
    # Generate questions from AI engine synchronously
    raw_questions = ai_engine.generate_quiz_sync(
        subject=subject,
        topic=topic,
        difficulty=difficulty,
        num_questions=num_questions,
        question_type=question_type,
        language=language,
        custom_key=custom_gemini_key
    )

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO quizzes (id, user_id, subject, topic, difficulty, question_type, total_questions)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (quiz_id, user_id, subject, topic, difficulty, question_type, len(raw_questions)))

    stored_questions = []
    for idx, q in enumerate(raw_questions):
        q_id = f"q_{uuid.uuid4().hex[:8]}"
        q_text = q.get("question_text", f"Question {idx+1}")
        options = q.get("options", ["Option A", "Option B", "Option C", "Option D"])
        correct_ans = q.get("correct_answer", options[0])
        explanation = q.get("explanation", "Correct based on educational principles.")

        cursor.execute("""
        INSERT INTO quiz_questions (id, quiz_id, question_text, options_json, correct_answer, explanation)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (q_id, quiz_id, q_text, json.dumps(options), correct_ans, explanation))

        # Do not expose correct_answer in client-facing quiz payload before submission
        stored_questions.append({
            "id": q_id,
            "question_text": q_text,
            "options": options
        })

    conn.commit()
    conn.close()

    return {
        "quiz_id": quiz_id,
        "subject": subject,
        "topic": topic,
        "difficulty": difficulty,
        "total_questions": len(stored_questions),
        "questions": stored_questions
    }

async def create_and_store_quiz(
    user_id: str,
    subject: str,
    topic: str,
    difficulty: str = "Medium",
    num_questions: int = 5,
    question_type: str = "MCQ",
    language: str = "English",
    custom_gemini_key: Optional[str] = None
) -> Dict[str, Any]:
    return create_and_store_quiz_sync(user_id, subject, topic, difficulty, num_questions, question_type, language, custom_gemini_key)

def evaluate_quiz_submission(
    user_id: str,
    quiz_id: str,
    answers_map: Dict[str, str]
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM quizzes WHERE id = ? AND user_id = ?", (quiz_id, user_id))
    quiz_row = cursor.fetchone()
    if not quiz_row:
        conn.close()
        raise ValueError("Quiz not found or unauthorized")

    quiz = dict(quiz_row)
    cursor.execute("SELECT * FROM quiz_questions WHERE quiz_id = ?", (quiz_id,))
    question_rows = cursor.fetchall()

    score = 0
    total = len(question_rows)
    evaluated_questions = []

    for row in question_rows:
        q = dict(row)
        q_id = q["id"]
        correct_ans = q["correct_answer"].strip().lower()
        student_ans = answers_map.get(q_id, "").strip()
        is_correct = (student_ans.lower() == correct_ans)

        if is_correct:
            score += 1

        cursor.execute("""
        UPDATE quiz_questions
        SET student_answer = ?, is_correct = ?
        WHERE id = ?
        """, (student_ans, 1 if is_correct else 0, q_id))

        evaluated_questions.append({
            "id": q_id,
            "question_text": q["question_text"],
            "options": json.loads(q["options_json"]),
            "correct_answer": q["correct_answer"],
            "student_answer": student_ans,
            "explanation": q["explanation"],
            "is_correct": is_correct
        })

    percentage = round((score / total * 100), 1) if total > 0 else 0.0

    # Badge assignment
    if percentage >= 90:
        badge = "🏆 Concept Master"
        feedback = "Outstanding! You have a crystal-clear conceptual understanding of this topic."
    elif percentage >= 70:
        badge = "⭐ High Achiever"
        feedback = "Great job! You have grasped the main principles. Review the few missed questions to achieve perfection."
    elif percentage >= 50:
        badge = "📈 Growing Learner"
        feedback = "Good effort! A little revision will solidify your fundamentals."
    else:
        badge = "🌱 Foundation Builder"
        feedback = "Keep your spirits high! Every mistake is a learning opportunity. Ask GuruG to explain the missed concepts step-by-step."

    # Mark quiz as completed and update score
    cursor.execute("UPDATE quizzes SET score = ?, completed = 1 WHERE id = ?", (score, quiz_id))

    # Update learning progress
    subject = quiz["subject"]
    cursor.execute("""
    INSERT INTO learning_progress (id, user_id, subject, concepts_mastered, quizzes_taken, average_score)
    VALUES (?, ?, ?, ?, 1, ?)
    ON CONFLICT(user_id, subject) DO UPDATE SET
        quizzes_taken = quizzes_taken + 1,
        average_score = ROUND((average_score * quizzes_taken + ?) / (quizzes_taken + 1), 1),
        concepts_mastered = concepts_mastered + CASE WHEN ? >= 70 THEN 1 ELSE 0 END,
        last_studied = CURRENT_TIMESTAMP
    """, (str(uuid.uuid4()), user_id, subject, 1 if percentage >= 70 else 0, percentage, percentage, percentage))

    conn.commit()
    conn.close()

    # Recommended next topics
    recommended = [
        f"Advanced {quiz['topic']} Applications",
        f"Step-by-Step Problem Solving in {quiz['subject']}",
        f"High-Yield Exam Questions for {quiz['topic']}"
    ]

    return {
        "quiz_id": quiz_id,
        "subject": quiz["subject"],
        "topic": quiz["topic"],
        "difficulty": quiz["difficulty"],
        "score": score,
        "total_questions": total,
        "percentage": percentage,
        "badge": badge,
        "feedback": feedback,
        "recommended_topics": recommended,
        "questions": evaluated_questions
    }

def get_user_quiz_history(user_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, subject, topic, difficulty, score, total_questions, completed, created_at
    FROM quizzes
    WHERE user_id = ? AND completed = 1
    ORDER BY created_at DESC
    LIMIT 20
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
