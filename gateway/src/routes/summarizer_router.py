from fastapi import APIRouter, HTTPException, Request
import httpx
import os
import asyncio # Để chạy log ngầm không làm chậm API

router = APIRouter()

# Lấy URL từ biến môi trường
SUMMARIZER_URL = os.getenv("SUMMARIZER_URL", "http://summarizer_service:8003")
# dùng để suy doc_type (CCCD/THE_SV/OTHER)
CLASSIFIER_URL = os.getenv("CLASSIFIER_URL", "http://classifier_service:8005")
# 👇 Đổi thành History Service (Cổng 8007)
HISTORY_URL = os.getenv("HISTORY_URL", "http://history_service:8007")


def _normalize_doc_type(label: str | None) -> str:
    if not label:
        return "OTHER"
    l = label.lower()
    if "căn cước" in l or "cccd" in l or "cmnd" in l:
        return "CCCD"
    if "sinh viên" in l or "mssv" in l:
        return "THE_SV"
    if "đề cương" in l:
        return "DE_CUONG"
    return "OTHER"

async def log_history_async(text_content: str, user_id: int, filename: str | None):
    """
    Gửi log sang History Service (chạy ngầm).
    Cấu trúc body phải khớp với HistoryCreate bên history_service
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # 1) Suy doc_type dựa trên nội dung (để thống kê/filter ...)
            doc_type = "OTHER"
            if text_content and text_content.strip():
                try:
                    cls_resp = await client.post(
                        f"{CLASSIFIER_URL}/classifier/by_text",
                        json={"text": text_content[:2000]},
                        timeout=10.0,
                    )
                    if cls_resp.status_code == 200:
                        label = (cls_resp.json() or {}).get("label")
                        doc_type = _normalize_doc_type(label)
                except Exception:
                    doc_type = "OTHER"

            # 2) filename: ưu tiên filename từ OCR gần nhất (frontend gửi lên)
            base_name = (filename or "text_input.txt").strip() or "text_input.txt"
            log_filename = f"summary__{base_name}"

            log_payload = {
                "user_id": user_id or 1,
                "filename": log_filename,
                "ocr_text": text_content[:500],
                "doc_type": doc_type,
                "language": "vi",
            }
            
            # Gọi API /save của History Service
            await client.post(
                f"{HISTORY_URL}/api/history/save", 
                json=log_payload, 
                timeout=2.0
            )
        except Exception as e:
            # Lỗi log không được làm ảnh hưởng luồng chính
            print(f"Log Error: {e}")

@router.post("/summarize")
async def proxy_summarize(request: Request):
    """
    Proxy gọi sang Summarizer Service.
    Input: { "text": "Nội dung cần tóm tắt..." }
    """
    async with httpx.AsyncClient() as client:
        try:
            # 1. Nhận dữ liệu từ Frontend
            body = await request.json()
            input_text = body.get("text", "")

            # Thông tin phụ để log history (frontend sẽ gửi)
            user_id = body.get("user_id", 1)
            filename = body.get("filename")

            # Tách body gửi sang summarizer service (tránh gửi các field lạ)
            payload_to_svc = {
                "text": body.get("text", ""),
            }
            # các field tuỳ chọn (nếu frontend có)
            if "max_sentences" in body:
                payload_to_svc["max_sentences"] = body.get("max_sentences")
            if "max_chars" in body:
                payload_to_svc["max_chars"] = body.get("max_chars")

            # 2. Gọi sang Summarizer Service
            target_url = f"{SUMMARIZER_URL}/summarizer/summarize"
            
            # Tăng timeout lên 20s vì tóm tắt AI chạy hơi lâu
            resp = await client.post(target_url, json=payload_to_svc, timeout=20.0)

            if resp.status_code != 200:
                # Xử lý lỗi từ service con
                try:
                    detail = resp.json()
                except:
                    detail = resp.text
                raise HTTPException(status_code=resp.status_code, detail=detail)
            
            # 3. Ghi Log (Chạy background task để trả về kết quả cho user ngay)
            if input_text:
                asyncio.create_task(log_history_async(input_text, user_id=user_id, filename=filename))

            return resp.json()

        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Lỗi kết nối Summarizer Service: {str(e)}")