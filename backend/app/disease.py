from fastapi import APIRouter, UploadFile, File, HTTPException
from google.genai import Client
import os
import uuid
import tempfile

router = APIRouter(prefix="/disease", tags=["Disease Detection"])

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY missing in backend/.env")

client = Client(api_key=API_KEY)

@router.post("/predict")
async def detect_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload a valid image file")

    try:
        # ✅ Save temporary image
        temp_name = f"{uuid.uuid4()}.jpg"
        temp_path = os.path.join(tempfile.gettempdir(), temp_name)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        # ✅ Upload image to Gemini (no display_name)
        uploaded_image = client.files.upload(file=temp_path)

        # ✅ AI prompt
        prompt = """
You are AgriMithra 🌾 — crop disease expert.

Give:
✅ Disease name (first line only)
✅ Then bullet points:
• Symptoms
• Organic remedy 🌱
• Chemical remedy 🧪
• Prevention tips
Short & practical for Indian farmers ✅
"""

        result = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[prompt, uploaded_image]
        )

        reply = result.text.strip() if result.text else "No response"
        return {"result": reply}

    except Exception as e:
        print("Disease Detection Error:", e)
        raise HTTPException(status_code=500, detail="AI failed processing")