from fastapi import APIRouter, HTTPException
import requests
import os

router = APIRouter()

# URL của auth_service, lấy từ biến môi trường trong docker-compose
# docker-compose.yml: AUTH_URL=http://auth_service:8001
AUTH_URL = os.getenv("AUTH_URL", "http://auth_service:8001")


@router.post("/register")
def register(user: dict):
    """
    Proxy đăng ký:
    Gateway -> Auth Service -> DB

    Frontend gọi: POST http://localhost:8010/auth/register
    Gateway gọi tiếp: POST {AUTH_URL}/auth/register
    """
    try:
        res = requests.post(f"{AUTH_URL}/auth/register", json=user, timeout=5)
        # Nếu auth_service trả lỗi (400, 500,...) thì raise
        if not res.ok:
            raise HTTPException(status_code=res.status_code, detail=res.json())
        return res.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Lỗi khi gọi auth_service: {e}")


@router.post("/login")
def login(user: dict):
    """
    Proxy đăng nhập:
    Frontend gọi: POST http://localhost:8010/auth/login
    Gateway gọi tiếp: POST {AUTH_URL}/auth/login
    """
    try:
        res = requests.post(f"{AUTH_URL}/auth/login", json=user, timeout=5)
        if not res.ok:
            raise HTTPException(status_code=res.status_code, detail=res.json())
        return res.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Lỗi khi gọi auth_service: {e}")


@router.get("/stats/login")
def login_stats():
    """
    API thống kê đăng nhập cho Dashboard

    Frontend gọi: GET http://localhost:8010/auth/stats/login
    Gateway gọi tiếp: GET {AUTH_URL}/auth/stats/login
    """
    try:
        res = requests.get(f"{AUTH_URL}/auth/stats/login", timeout=5)
        if not res.ok:
            raise HTTPException(status_code=res.status_code, detail=res.json())
        return res.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Lỗi khi gọi auth_service: {e}")


@router.get("/stats/docs")
def docs_stats():
    """
    API thống kê tài liệu (doc_type, language) cho Dashboard

    Frontend gọi: GET http://localhost:8010/auth/stats/docs
    Gateway gọi tiếp: GET {AUTH_URL}/auth/stats/docs
    """
    try:
        res = requests.get(f"{AUTH_URL}/auth/stats/docs", timeout=5)
        if not res.ok:
            raise HTTPException(status_code=res.status_code, detail=res.json())
        return res.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Lỗi khi gọi auth_service: {e}")
