import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file before anything else
load_dotenv()

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure gurug root is on sys.path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    print(f"Starting GuruG server on http://{host}:{port} ...")
    import uvicorn
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=False)
