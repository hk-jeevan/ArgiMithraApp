from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
import os

router = APIRouter(prefix="/assistant", tags=["assistant"])

# Read key from environment (loaded by load_dotenv in main.py)
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set. Put it in backend/.env")

# Create Gemini client
client = genai.Client(api_key=API_KEY)

class ChatRequest(BaseModel):
    message: str
    lang: str = "en"  # 'en' or 'kn' etc.

@router.post("/chat")
async def chat(req: ChatRequest):
    """
    Chat endpoint using Gemini 2.0 Flash with the google-genai client.
    """
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Empty message")

    try:
        prompt = (
            f"You are AgriMithra, a helpful Indian agricultural assistant. "
            f"Reply in {req.lang}. Keep answers short, clear, and practical for farmers.\n\n"
            f"Question: {req.message}"
        )

        # ✅ Use the stable method surface for google-genai 1.48.0
        resp = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        # resp.text contains the concatenated text of the first candidate
        reply = (resp.text or "").strip()
        if not reply:
            reply = "Sorry, I couldn't generate an answer."

        return {"reply": reply}

    except Exception as e:
        # Print for server logs and return friendly error
        print("Gemini error:", repr(e))
        raise HTTPException(status_code=500, detail="Assistant service failed.")
