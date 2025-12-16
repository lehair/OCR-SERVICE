from fastapi import APIRouter, HTTPException, Request
import httpx
import os
import asyncio

router = APIRouter()

# Service URLs
CLASSIFIER_URL = os.getenv("CLASSIFIER_URL", "http://classifier_service:8005")
HISTORY_URL = os.getenv("HISTORY_URL", "http://history_service:8007")


def _normalize_doc_type(label: str | None) -> str:
    """Chuẩn hoá nhãn classifier -> code dùng cho thống kê/filter."""
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


async def log_history_async(text_content: str, user_id: int, filename: str | None, label: str | None):
    """Ghi log sang History Service (chạy ngầm, không làm chậm API)."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            base_name = (filename or "text_input.txt").strip() or "text_input.txt"
            log_filename = f"classify__{base_name}"

            doc_type = _normalize_doc_type(label)

            payload = {
                "user_id": user_id or 1,
                "filename": log_filename,
                "ocr_text": (text_content or "")[:500],
                "doc_type": doc_type,
                "language": "vi",
            }

            # History Service: /api/history/save
            await client.post(f"{HISTORY_URL}/api/history/save", json=payload, timeout=2.0)
        except Exception:
            # Không để lỗi log ảnh hưởng luồng chính
            pass


@router.post("/by_text")
async def proxy_classify_text(request: Request):
    """Proxy gọi sang Classifier Service và ghi lịch sử."""
    async with httpx.AsyncClient() as client:
        try:
            body = await request.json()
            input_text = body.get("text", "")

            # Thông tin phụ để log (frontend gửi lên)
            user_id = body.get("user_id", 1)
            filename = body.get("filename")

            # Chỉ forward những field mà classifier_service cần
            payload_to_svc = {"text": input_text}

            target_url = f"{CLASSIFIER_URL}/classifier/by_text"
            resp = await client.post(target_url, json=payload_to_svc, timeout=10.0)

            if resp.status_code != 200:
                try:
                    detail = resp.json()
                except Exception:
                    detail = resp.text
                raise HTTPException(status_code=resp.status_code, detail=detail)

            result_data = resp.json() or {}
            label = result_data.get("label")

            if input_text:
                asyncio.create_task(log_history_async(input_text, user_id=user_id, filename=filename, label=label))

            return result_data

        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Lỗi kết nối Classifier Service: {str(e)}")
