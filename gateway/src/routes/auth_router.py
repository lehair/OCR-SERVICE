from fastapi import APIRouter, HTTPException, Request
import httpx
import os

router = APIRouter()

# Lấy URL từ docker-compose
AUTH_URL = os.getenv("AUTH_URL", "http://auth_service:8001")

# --- 1. ĐĂNG KÝ (Dùng httpx async) ---
@router.post("/register")
async def proxy_register(request: Request):
    """
    Gateway -> POST {AUTH_URL}/auth/register
    """
    async with httpx.AsyncClient() as client:
        try:
            # Lấy toàn bộ body JSON từ Frontend gửi lên
            body = await request.json()
            
            # Gọi sang Auth Service
            res = await client.post(f"{AUTH_URL}/auth/register", json=body, timeout=10.0)
            
            # Nếu Auth Service báo lỗi (VD: trùng user), trả về lỗi y hệt
            if res.status_code != 200:
                # Cố gắng đọc JSON lỗi, nếu không thì lấy text
                try:
                    detail = res.json()
                except:
                    detail = res.text
                raise HTTPException(status_code=res.status_code, detail=detail)
                
            return res.json()
            
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Lỗi kết nối Auth Service: {str(e)}")

# --- 2. ĐĂNG NHẬP (Dùng httpx async) ---
@router.post("/login")
async def proxy_login(request: Request):
    """
    Gateway -> POST {AUTH_URL}/auth/login
    """
    async with httpx.AsyncClient() as client:
        try:
            body = await request.json()
            
            res = await client.post(f"{AUTH_URL}/auth/login", json=body, timeout=10.0)
            
            if res.status_code != 200:
                try:
                    detail = res.json()
                except:
                    detail = res.text
                raise HTTPException(status_code=res.status_code, detail=detail)
                
            return res.json()
            
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Lỗi kết nối Auth Service: {str(e)}")

# --- LƯU Ý ---
# Các API /stats/docs và /docs/log đã được chuyển sang history_router.py
# nên ta XÓA bỏ ở đây để tránh nhầm lẫn.