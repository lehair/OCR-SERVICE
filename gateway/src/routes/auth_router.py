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
    Frontend:  POST http://localhost:8010/auth/register
    Gateway -> POST {AUTH_URL}/auth/register
    """
    try:
        res = requests.post(f"{AUTH_URL}/auth/register", json=user, timeout=5)
        if not res.ok:
            # cố gắng đọc JSON, nếu không được thì trả text
            try:
                detail = res.json()
            except ValueError:
                detail = res.text
            raise HTTPException(status_code=res.status_code, detail=detail)
        return res.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Lỗi khi gọi auth_service: {e}")


@router.post("/login")
def login(user: dict):
    """
    Proxy đăng nhập:
    Frontend:  POST http://localhost:8010/auth/login
    Gateway -> POST {AUTH_URL}/auth/login
    """
    try:
        res = requests.post(f"{AUTH_URL}/auth/login", json=user, timeout=5)
        if not res.ok:
            try:
                detail = res.json()
            except ValueError:
                detail = res.text
            raise HTTPException(status_code=res.status_code, detail=detail)
        return res.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Lỗi khi gọi auth_service: {e}")


@router.get("/stats/login")
def login_stats():
    """
    Thống kê đăng nhập cho Dashboard.
    Frontend:  GET http://localhost:8010/auth/stats/login
    Gateway -> GET {AUTH_URL}/auth/stats/login
    """
    try:
        res = requests.get(f"{AUTH_URL}/auth/stats/login", timeout=5)
        if not res.ok:
            try:
                detail = res.json()
            except ValueError:
                detail = res.text
            raise HTTPException(status_code=res.status_code, detail=detail)
        return res.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Lỗi khi gọi auth_service: {e}")


@router.get("/stats/docs")
def docs_stats():
    """
    Thống kê tài liệu (doc_type, language) cho Dashboard.
    Frontend:  GET http://localhost:8010/auth/stats/docs
    Gateway -> GET {AUTH_URL}/auth/stats/docs
    """
    try:
        res = requests.get(f"{AUTH_URL}/auth/stats/docs", timeout=5)
        if not res.ok:
            try:
                detail = res.json()
            except ValueError:
                detail = res.text
            raise HTTPException(status_code=res.status_code, detail=detail)
        return res.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Lỗi khi gọi auth_service: {e}")


@router.post("/docs/log")
def docs_log(doc: dict):
    """
    API để các service khác log tài liệu đã xử lý.
    Ví dụ (gateway):
      POST http://localhost:8010/auth/docs/log
      body: { "doc_type": "cccd", "language": "vi" }

    Gateway -> POST {AUTH_URL}/auth/docs/log
    """
    try:
        res = requests.post(f"{AUTH_URL}/auth/docs/log", json=doc, timeout=5)
        if not res.ok:
            try:
                detail = res.json()
            except ValueError:
                detail = res.text
            raise HTTPException(status_code=res.status_code, detail=detail)
        return res.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Lỗi khi gọi auth_service: {e}")
