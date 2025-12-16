from fastapi import APIRouter, HTTPException, Query
import httpx
import os

router = APIRouter()

# Lấy địa chỉ History Service từ biến môi trường (Docker)
# Cổng 8007 là cổng của history_service mà ta đã cấu hình
HISTORY_URL = os.getenv("HISTORY_URL", "http://history_service:8007")

async def forward_request(method: str, path: str, params=None, json_data=None):
    """
    Hàm chung để gọi sang History Service
    """
    async with httpx.AsyncClient() as client:
        try:
            # URL đích: http://history_service:8007/api/history + path
            target_url = f"{HISTORY_URL}/api/history{path}"
            
            if method == "GET":
                resp = await client.get(target_url, params=params, timeout=10.0)
            elif method == "POST":
                resp = await client.post(target_url, json=json_data, timeout=10.0)
            
            if resp.status_code != 200:
                # Nếu service con báo lỗi, trả lỗi đó về cho Frontend
                try:
                    detail = resp.json()
                except:
                    detail = resp.text
                raise HTTPException(status_code=resp.status_code, detail=detail)
                
            return resp.json()
            
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Lỗi kết nối History Service: {str(e)}")

# ==================== CÁC API ====================

# 1. API Lấy thống kê (Dashboard dùng cái này)
# Frontend gọi: GET /history/stats/{user_id}
@router.get("/stats/{user_id}")
async def get_stats(user_id: int):
    return await forward_request("GET", f"/stats/{user_id}")

# 2. API Lấy danh sách lịch sử (Trang History dùng cái này)
# Frontend gọi: GET /history/list/{user_id}?doc_type=...
@router.get("/list/{user_id}")
async def get_list(user_id: int, doc_type: str = Query(None)):
    params = {}
    if doc_type:
        params["doc_type"] = doc_type
    return await forward_request("GET", f"/list/{user_id}", params=params)

# 3. API Lưu lịch sử (Các service khác hoặc Frontend có thể gọi)
# Frontend gọi: POST /history/save
@router.post("/save")
async def save_history(payload: dict):
    return await forward_request("POST", "/save", json_data=payload)