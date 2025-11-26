from fastapi import APIRouter
import requests
import os

router = APIRouter()
CLASSIFIER_URL = os.getenv("CLASSIFIER_URL", "http://localhost:8005")

@router.post("/classify")
def classify(data: dict):
    response = requests.post(f"{CLASSIFIER_URL}/classify", json=data)
    return response.json()