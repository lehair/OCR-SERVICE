from fastapi import APIRouter
import requests
import os

router = APIRouter()
SUMMARIZER_URL = os.getenv("SUMMARIZER_URL", "http://localhost:8003")

@router.post("/summarize")
def summarize(text: dict):
    response = requests.post(f"{SUMMARIZER_URL}/summarize", json=text)
    return response.json()