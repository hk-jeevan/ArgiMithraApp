from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.genai import Client
import os

router = APIRouter(prefix="/assistant", tags=["assistant"])

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY missing in .env")

client = Client(api_key=API_KEY)

class ChatRequest(BaseModel):
    message: str
    lang: str = "en"

@router.post("/chat")
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message is empty")

    try:
        prompt = f"""
You are **AgriMithra** 🌾 — a trusted Indian agriculture expert.

Format rules:
✅ Respond only in {req.lang}
✅ Keep answers short (5–8 bullet points)
✅ Use emojis for clarity (🌱💧🧪🌞⚠️)
✅ Give specific fertilizer doses, spacing, irrigation timing
✅ India-specific seasonal advice
✅ Kannada responses must be fully in Kannada script

User Question:
{req.message}

Answer:
"""

        resp = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )

        reply = (resp.text or "AI has no response").strip()
        return {"reply": reply}

    except Exception as e:
        print("Gemini Error:", repr(e))
        raise HTTPException(status_code=500, detail="AI service issue")
