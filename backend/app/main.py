from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .assistant import router as assistant_router
from .disease import router as disease_router 

load_dotenv()  # Load .env

app = FastAPI(title="AgriMithra Backend ✅ (Gemini AI)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assistant_router)
app.include_router(disease_router)

@app.get("/")
def root():
    return {"message": "✅ AgriMithra API Running!"}
