import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_PATH = os.getenv("DATABASE_PATH", str(DATA_DIR / "gurug.db"))

# Environment & Security
ENV = os.getenv("ENV", "development")
SECRET_KEY = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    if ENV == "production":
        raise RuntimeError("SECRET_KEY environment variable is required in production mode.")
    SECRET_KEY = "gurug-dev-secret-key-change-in-production"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# AI Integration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
DEFAULT_GROQ_MODEL = os.getenv("DEFAULT_GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_FALLBACK_MODEL = os.getenv("GROQ_FALLBACK_MODEL", "openai/gpt-oss-20b")

HF_TOKEN = os.getenv("HF_TOKEN", "")
DEFAULT_HF_MODEL = os.getenv("DEFAULT_HF_MODEL", "Qwen/Qwen3.8-Flash-Next:featherless-ai")
HF_ROUTER_BASE_URL = os.getenv("HF_ROUTER_BASE_URL", "https://router.huggingface.co/v1")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
DEFAULT_GEMINI_MODEL = os.getenv("DEFAULT_GEMINI_MODEL", "gemini-1.5-flash")

# Supported Languages
SUPPORTED_LANGUAGES = [
    {"code": "en", "name": "English", "native": "English", "sample": "Hello! What shall we learn today?"},
    {"code": "hi", "name": "Hindi", "native": "हिन्दी", "sample": "नमस्ते! आज आप क्या सीखना चाहते हैं?"},
    {"code": "hinglish", "name": "Hinglish", "native": "Hinglish", "sample": "Hey! Aaj kaun sa concept seekhna chahte ho?"},
    {"code": "bn", "name": "Bengali", "native": "বাংলা", "sample": "নমস্কার! আজ তুমি কী শিখতে চাও?"},
    {"code": "ta", "name": "Tamil", "native": "தமிழ்", "sample": "வணக்கம்! இன்று நீங்கள் என்ன கற்க விரும்புகிறீர்கள்?"},
    {"code": "te", "name": "Telugu", "native": "తెలుగు", "sample": "నమస్కారం! ఈరోజు మీరు ఏమి నేర్చుకోవాలనుకుంటున్నారు?"},
    {"code": "kn", "name": "Kannada", "native": "ಕನ್ನಡ", "sample": "ನಮಸ್ಕಾರ! ಇಂದು ನೀವು ಏನನ್ನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?"},
    {"code": "mr", "name": "Marathi", "native": "मराठी", "sample": "नमस्कार! आज आपण काय शिकूया?"},
    {"code": "gu", "name": "Gujarati", "native": "ગુજરાતી", "sample": "નમસ્તે! આજે તમે શું શીખવા માંગો છો?"},
    {"code": "ml", "name": "Malayalam", "native": "മലയാളം", "sample": "നമസ്കാരം! ഇന്ന് നിങ്ങൾ എന്താണ് പഠിക്കാൻ ആഗ്രഹിക്കുന്നത്?"},
    {"code": "ur", "name": "Urdu", "native": "اردو", "sample": "آداب! آج آپ کیا سیکھنا چاہتے ہیں؟"}
]

# Explanation Modes
EXPLANATION_MODES = [
    {"id": "simple", "name": "Simple Explanation", "icon": "sparkles", "desc": "Concise, friendly, and jargon-free"},
    {"id": "detailed", "name": "Detailed Explanation", "icon": "book-open", "desc": "In-depth conceptual background and theory"},
    {"id": "step_by_step", "name": "Step-by-Step", "icon": "list-ordered", "desc": "Logical numbered breakdown explaining each step"},
    {"id": "eli10", "name": "Explain Like I'm 10", "icon": "baby", "desc": "Fun real-world analogies and simple stories"},
    {"id": "real_life", "name": "Real-Life Examples", "icon": "globe", "desc": "Practical applications from everyday life"},
    {"id": "exam_prep", "name": "Exam Preparation", "icon": "target", "desc": "High-yield definitions, formulas, and typical exam questions"}
]

# Education Levels
EDUCATION_LEVELS = [
    "Class 6–8",
    "Class 9–10",
    "Class 11–12",
    "College",
    "Other"
]
