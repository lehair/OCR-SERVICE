from fastapi import APIRouter, HTTPException, Request
import httpx
import os
import asyncio 

router = APIRouter()

# 1. Cấu hình URL (Lấy từ docker-compose)
TRANSLATE_URL = os.getenv("TRANSLATE_URL", "http://translate_service:8006")
# dùng để suy doc_type (CCCD/THE_SV/OTHER)
CLASSIFIER_URL = os.getenv("CLASSIFIER_URL", "http://classifier_service:8005")
# 👇 Sửa thành History Service (Cổng 8007)
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

# --- Hàm ghi log chạy ngầm (Không làm chậm app) ---
async def log_history_async(source_text: str, target_lang: str, user_id: int, filename: str | None):
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # 1) ngôn ngữ đích
            lang_code = "vi" if "vi" in (target_lang or "").lower() else "en"

            # 2) suy doc_type để filter/thống kê
            doc_type = "OTHER"
            if source_text and source_text.strip():
                try:
                    cls_resp = await client.post(
                        f"{CLASSIFIER_URL}/classifier/by_text",
                        json={"text": source_text[:2000]},
                        timeout=10.0,
                    )
                    if cls_resp.status_code == 200:
                        label = (cls_resp.json() or {}).get("label")
                        doc_type = _normalize_doc_type(label)
                except Exception:
                    doc_type = "OTHER"

            base_name = (filename or "text_input.txt").strip() or "text_input.txt"
            log_filename = f"translate__{base_name}"

            log_payload = {
                "user_id": user_id or 1,
                "filename": log_filename,
                "ocr_text": source_text[:500],
                "doc_type": doc_type,
                "language": lang_code,
            }
            
            # Gọi API /save của History Service
            await client.post(
                f"{HISTORY_URL}/api/history/save", 
                json=log_payload, 
                timeout=2.0
            )
        except Exception:
            pass

# --- API Dịch thuật ---
# URL Gateway: POST /translate/text (Giả sử main.py prefix="/translate")
@router.post("/text")
@router.post("/translate")
async def proxy_translate(request: Request):
    """
    Proxy gọi sang Translate Service.
    Input: { "text": "Hello world", "source_lang": "en", "target_lang": "vi" }
    """
    async with httpx.AsyncClient() as client:
        try:
            # 1. Nhận dữ liệu
            body = await request.json()
            source_text = body.get("text", "")
            target_lang = body.get("target_lang", "vi")
            user_id = body.get("user_id", 1)
            filename = body.get("filename")

            # 2. Gọi sang Translate Service
            # Translate Service expose POST /translate/translate
            target_url = f"{TRANSLATE_URL}/translate/translate" 
            
            # Timeout cao chút vì dịch máy có thể lâu
            payload_to_svc = {
                "text": source_text,
                "source_lang": body.get("source_lang", "auto"),
                "target_lang": target_lang,
            }
            resp = await client.post(target_url, json=payload_to_svc, timeout=15.0)

            if resp.status_code != 200:
                try:
                    detail = resp.json()
                except:
                    detail = resp.text
                raise HTTPException(status_code=resp.status_code, detail=detail)

            # 3. Ghi Log ngầm (Background)
            if source_text:
                asyncio.create_task(log_history_async(source_text, target_lang, user_id=user_id, filename=filename))

            # 4. Trả kết quả ngay
            return resp.json()

        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Lỗi kết nối Translate Service: {str(e)}")