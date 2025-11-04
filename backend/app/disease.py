from fastapi import APIRouter, UploadFile, File, HTTPException
from google import genai
import os
from dotenv import load_dotenv
load_dotenv()

router = APIRouter(prefix="/disease", tags=["Disease Detection"])

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


@router.post("/predict")
async def detect(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload an image")

    image_bytes = await file.read()

    result = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            {"mime_type": file.content_type, "data": image_bytes},
            "Identify the plant disease and suggest remedy."
        ]
    )

    return {"result": result.text}
