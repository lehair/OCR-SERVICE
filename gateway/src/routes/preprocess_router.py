from fastapi import APIRouter, UploadFile, File, HTTPException
import httpx
import os

router = APIRouter()

# Trỏ vào container preprocess_service
PREPROCESS_URL = os.getenv("PREPROCESS_URL", "http://preprocess_service:8004")

async def forward_file(endpoint: str, file: UploadFile):
    """Hàm chung để gửi file sang Preprocess Service"""
    async with httpx.AsyncClient() as client:
        try:
            # Đọc file từ RAM
            file_content = await file.read()
            files = {'file': (file.filename, file_content, file.content_type)}
            
            # Giả sử bên Preprocess Service bạn để prefix="/preprocess" trong main.py
            # URL sẽ là: http://preprocess_service:8004/preprocess/enhance
            target_url = f"{PREPROCESS_URL}/preprocess{endpoint}"
            
            # Gửi request (Timeout 30s vì xử lý ảnh có thể lâu)
            resp = await client.post(target_url, files=files, timeout=30.0)
            
            if resp.status_code != 200:
                # Nếu service con báo lỗi (ví dụ file rỗng), trả lỗi đó về Gateway
                try:
                    detail = resp.json()
                except:
                    detail = resp.text
                raise HTTPException(status_code=resp.status_code, detail=detail)
                
            return resp.json()
            
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Lỗi kết nối Preprocess Service: {str(e)}")

# ==================== CÁC ROUTE KHỚP VỚI CONTROLLER CỦA BẠN ====================

@router.post("/enhance")
async def proxy_enhance(file: UploadFile = File(...)):
    return await forward_file("/enhance", file)

@router.post("/threshold")
async def proxy_threshold(file: UploadFile = File(...)):
    return await forward_file("/threshold", file)

@router.post("/deskew")
async def proxy_deskew(file: UploadFile = File(...)):
    return await forward_file("/deskew", file)

@router.post("/full")
async def proxy_full(file: UploadFile = File(...)):
    return await forward_file("/full", file)