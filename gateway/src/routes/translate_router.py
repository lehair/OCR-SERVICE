from fastapi import APIRouter
import requests
import os

router = APIRouter()
TRANSLATE_URL = os.getenv("TRANSLATE_URL", "http://localhost:8006")

@router.post("/translate")
def translate(data: dict):
    response = requests.post(f"{TRANSLATE_URL}/translate", json=data)
    return response.json()