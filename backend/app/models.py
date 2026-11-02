from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Authentication & User Models
class UserRegister(BaseModel):
    email: str = Field(..., min_length=3, max_length=100)
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    display_name: str = Field(..., min_length=2, max_length=50)
    grade_level: str = "Class 9–10"
    preferred_language: str = "English"

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfile(BaseModel):
    id: str
    email: str
    username: str
    display_name: str
    grade_level: str
    preferred_language: str
    target_subjects: List[str]
    learning_goal: str
    created_at: str

class OnboardingRequest(BaseModel):
    display_name: Optional[str] = None
    grade_level: str
    preferred_language: str
    target_subjects: List[str]
    learning_goal: str

# Tutor Chat Models
class ChatMessage(BaseModel):
    id: str
    session_id: str
    sender: str
    content: str
    language: Optional[str] = None
    mode: Optional[str] = None
    created_at: str

class ChatSession(BaseModel):
    id: str
    user_id: str
    title: str
    subject: str
    language: str
    mode: str
    created_at: str
    updated_at: str
    messages: Optional[List[ChatMessage]] = []

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    subject: Optional[str] = "General"
    language: Optional[str] = "English"
    mode: Optional[str] = "Simple Explanation"
    custom_gemini_key: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    user_message: ChatMessage
    tutor_message: ChatMessage
    provider: str  # "gemini" or "local_engine"
    language: str
    mode: str

class QuickExplainRequest(BaseModel):
    concept: str
    subject: Optional[str] = "General"
    language: Optional[str] = "English"
    mode: Optional[str] = "Simple Explanation"
    grade_level: Optional[str] = "Class 9–10"

# Quiz Models
class QuizGenerateRequest(BaseModel):
    subject: str
    topic: str
    difficulty: str = "Medium"  # "Easy", "Medium", "Hard"
    num_questions: int = Field(default=5, ge=1, le=10)
    question_type: str = "MCQ"  # "MCQ", "True/False", "Short Answer"
    language: Optional[str] = "English"

class QuizQuestionItem(BaseModel):
    id: str
    question_text: str
    options: List[str]
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None

class QuizSubmissionItem(BaseModel):
    question_id: str
    selected_answer: str

class QuizSubmitRequest(BaseModel):
    quiz_id: str
    answers: List[QuizSubmissionItem]

class QuizQuestionResult(BaseModel):
    id: str
    question_text: str
    options: List[str]
    correct_answer: str
    student_answer: str
    explanation: str
    is_correct: bool

class QuizResultResponse(BaseModel):
    quiz_id: str
    subject: str
    topic: str
    difficulty: str
    score: int
    total_questions: int
    percentage: float
    badge: str
    feedback: str
    recommended_topics: List[str]
    questions: List[QuizQuestionResult]

# Problem Solver Models
class ProblemSolveRequest(BaseModel):
    problem_text: str = Field(..., min_length=3)
    subject: Optional[str] = "Mathematics"
    language: Optional[str] = "English"
    grade_level: Optional[str] = "Class 9–10"

class SolutionStep(BaseModel):
    step_number: int
    step_title: str
    step_content: str
    reasoning: str

class ProblemSolveResponse(BaseModel):
    id: str
    problem_text: str
    subject: str
    concept_identified: str
    approach_explanation: str
    steps: List[SolutionStep]
    final_answer: str
    practice_problem: str
    provider: str

# Settings Models
class SettingsUpdate(BaseModel):
    preferred_language: Optional[str] = None
    grade_level: Optional[str] = None
    default_mode: Optional[str] = None
    sound_enabled: Optional[bool] = None
    custom_gemini_key: Optional[str] = None
    display_name: Optional[str] = None

class ApiKeyTestRequest(BaseModel):
    api_key: str

# Debate Mode Models
class DebateStartRequest(BaseModel):
    topic: str = Field(..., min_length=3)
    category: Optional[str] = "Science & Society"
    student_stance: str = "For"  # "For" (Affirmative) or "Against" (Negative)
    language: Optional[str] = "English"
    max_rounds: Optional[int] = 3
    custom_gemini_key: Optional[str] = None

class DebateTurnRequest(BaseModel):
    session_id: str
    student_argument: str = Field(..., min_length=2)
    round_number: int = 1
    language: Optional[str] = "English"
    custom_gemini_key: Optional[str] = None

class DebateTurnResponse(BaseModel):
    session_id: str
    round_number: int
    student_argument: str
    ai_rebuttal: str
    points_conceded: str
    counter_question: str
    provider: str

class DebateConcludeRequest(BaseModel):
    session_id: str
    custom_gemini_key: Optional[str] = None

class DebateScorecardResponse(BaseModel):
    session_id: str
    topic: str
    student_stance: str
    rounds_completed: int
    overall_score: int
    verdict: str  # e.g. "Outstanding Debater - Affirmative Victory"
    logic_score: int
    evidence_score: int
    rebuttal_score: int
    civility_score: int
    strengths: List[str]
    areas_for_improvement: List[str]
    judge_commentary: str
