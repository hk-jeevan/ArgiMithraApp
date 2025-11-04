from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .assistant import router as assistant_router

# Load .env so GEMINI_API_KEY is available
load_dotenv()

app = FastAPI(title="AgriMithra Backend ✅ (Gemini AI)")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include AI Chat Route
app.include_router(assistant_router)

@app.get("/")
def root():
    return {"message": "✅ AgriMithra API Running Successfully!"}
