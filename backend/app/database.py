import sqlite3
import json
import uuid
from typing import List, Dict, Any, Optional
from backend.app.config import DATABASE_PATH

def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT NOT NULL,
        grade_level TEXT DEFAULT 'Class 9–10',
        preferred_language TEXT DEFAULT 'English',
        target_subjects TEXT DEFAULT '["Mathematics", "Physics", "Chemistry"]',
        learning_goal TEXT DEFAULT 'Concept Clarity',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # User settings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        default_mode TEXT DEFAULT 'Simple Explanation',
        sound_enabled BOOLEAN DEFAULT 1,
        custom_gemini_key TEXT DEFAULT '',
        theme TEXT DEFAULT 'dark',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Chat sessions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        subject TEXT DEFAULT 'General',
        language TEXT NOT NULL,
        mode TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Chat messages
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT REFERENCES chat_sessions(id) ON DELETE CASCADE,
        sender TEXT CHECK(sender IN ('user', 'tutor')) NOT NULL,
        content TEXT NOT NULL,
        language TEXT,
        mode TEXT,
        visual_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Quizzes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        question_type TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        total_questions INTEGER NOT NULL,
        completed BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Quiz questions & answers
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_questions (
        id TEXT PRIMARY KEY,
        quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options_json TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        student_answer TEXT,
        explanation TEXT NOT NULL,
        is_correct BOOLEAN
    )
    """)

    # Solver records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS solver_records (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        problem_text TEXT NOT NULL,
        subject TEXT NOT NULL,
        concept_identified TEXT,
        approach_explanation TEXT,
        steps_json TEXT NOT NULL,
        final_answer TEXT NOT NULL,
        practice_problem TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Learning progress
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learning_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        subject TEXT NOT NULL,
        concepts_mastered INTEGER DEFAULT 0,
        quizzes_taken INTEGER DEFAULT 0,
        average_score REAL DEFAULT 0.0,
        last_studied TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, subject)
    )
    """)

    # Debate sessions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS debate_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        topic TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        student_stance TEXT NOT NULL,
        ai_stance TEXT NOT NULL,
        language TEXT DEFAULT 'English',
        rounds_completed INTEGER DEFAULT 0,
        max_rounds INTEGER DEFAULT 3,
        status TEXT DEFAULT 'active',
        final_score INTEGER DEFAULT 0,
        verdict TEXT DEFAULT '',
        feedback_json TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Debate turns (two-way arguments and rebuttals)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS debate_turns (
        id TEXT PRIMARY KEY,
        session_id TEXT REFERENCES debate_sessions(id) ON DELETE CASCADE,
        round_number INTEGER NOT NULL,
        student_argument TEXT NOT NULL,
        ai_rebuttal TEXT NOT NULL,
        points_conceded TEXT DEFAULT '',
        counter_question TEXT DEFAULT '',
        turn_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Safe migration: ensure visual_json exists in chat_messages
    cursor.execute("PRAGMA table_info(chat_messages)")
    columns = [col[1] for col in cursor.fetchall()]
    if "visual_json" not in columns:
        cursor.execute("ALTER TABLE chat_messages ADD COLUMN visual_json TEXT")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DATABASE_PATH)
