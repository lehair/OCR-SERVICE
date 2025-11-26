from fastapi import APIRouter
import requests
import os

router = APIRouter()
AUTH_URL = os.getenv("AUTH_URL", "http://localhost:8001")

@router.post("/register")
def register(user: dict):
    response = requests.post(f"{AUTH_URL}/register", json=user)
    return response.json()

@router.post("/login")
def login(user: dict):
    response = requests.post(f"{AUTH_URL}/login", json=user)
    return response.json()