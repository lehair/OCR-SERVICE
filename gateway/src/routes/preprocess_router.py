from fastapi import APIRouter, UploadFile, File
import requests
import os

router = APIRouter()
PREPROCESS_URL = os.getenv("PREPROCESS_URL", "http://localhost:8004")

@router.post("/preprocess")
def preprocess(file: UploadFile = File(...)):
    files = {"file": (file.filename, file.file, file.content_type)}
    response = requests.post(f"{PREPROCESS_URL}/preprocess", files=files)
    return response.json()