from fastapi import APIRouter, UploadFile, File
import requests
import os

router = APIRouter()
OCR_URL = os.getenv("OCR_URL", "http://localhost:8002")

@router.post("/ocr")
def ocr(file: UploadFile = File(...)):
    files = {"file": (file.filename, file.file, file.content_type)}
    response = requests.post(f"{OCR_URL}/ocr", files=files)
    return response.json()