from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load .env so GEMINI_API_KEY is available
load_dotenv()

from app.assistant import router as assistant_router

app = FastAPI(title="AgriMithra Backend (Gemini)")

# CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # change to your frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(assistant_router)

@app.get("/")
def root():
    return {"message": "AgriMithra API ✅ running"}
