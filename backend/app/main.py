import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from backend.app.database import init_db
from backend.app.auth import ensure_demo_user
from backend.app.services.ai_engine import ai_engine
from backend.app.routers import (
    auth_router,
    tutor_router,
    quiz_router,
    solver_router,
    subjects_router,
    progress_router,
    settings_router,
    debate_router
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & Seed Demo User
    init_db()
    ensure_demo_user()
    live_ai = ai_engine.has_live_ai()
    print("=" * 60)
    print("[GuruG] Multilingual AI-Powered Personal Tutor")
    print("[GuruG] Ready & Listening on http://127.0.0.1:8000")
    print(f"[GuruG] AI Engine: {'Live Gemini Cloud AI' if live_ai else 'Local Educational Pedagogical Engine (Fallback Active)'}")
    print("[GuruG] Demo Student Account: demo@gurug.edu / password123")
    print("=" * 60)
    yield
    print("[GuruG] Server shutdown.")

app = FastAPI(
    title="GuruG Multilingual AI Tutor API",
    description="Your Personal AI Tutor. Your Language. Your Pace.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth_router.router)
app.include_router(tutor_router.router)
app.include_router(quiz_router.router)
app.include_router(solver_router.router)
app.include_router(subjects_router.router)
app.include_router(progress_router.router)
app.include_router(settings_router.router)
app.include_router(debate_router.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "GuruG AI Tutor",
        "has_live_gemini": ai_engine.has_live_ai(),
        "version": "1.0.0"
    }

# Mount static frontend directories if they exist
if FRONTEND_DIR.exists():
    css_dir = FRONTEND_DIR / "css"
    js_dir = FRONTEND_DIR / "js"
    images_dir = FRONTEND_DIR / "images"
    images_dir.mkdir(parents=True, exist_ok=True)
    if css_dir.exists():
        app.mount("/css", StaticFiles(directory=str(css_dir)), name="css")
    if js_dir.exists():
        app.mount("/js", StaticFiles(directory=str(js_dir)), name="js")
    app.mount("/images", StaticFiles(directory=str(images_dir)), name="images")

# Catch-all SPA route to serve index.html for client-side routing
@app.get("/{full_path:path}")
async def serve_spa(full_path: str, request: Request):
    if full_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return JSONResponse(status_code=200, content={"message": "GuruG Backend is running. Frontend index.html loading."})
