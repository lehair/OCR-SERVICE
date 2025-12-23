from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import httpx
import os
import base64

router = APIRouter()

# Trỏ vào container preprocess_service
PREPROCESS_URL = os.getenv("PREPROCESS_URL", "http://preprocess_service:8004")
OCR_URL = os.getenv("OCR_URL", "http://ocr_service:8002")
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

def _decode_data_url(data_url: str) -> bytes:
    """data:image/png;base64,... -> bytes"""
    if not data_url:
        raise HTTPException(status_code=500, detail="Preprocess did not return image")
    b64 = data_url.split(",", 1)[1] if "," in data_url else data_url
    try:
        return base64.b64decode(b64)
    except Exception:
        raise HTTPException(status_code=500, detail="Invalid base64 image from preprocess")

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

# ==================== PREPROCESS -> OCR (AUTO) ====================
async def _preprocess_then_ocr(step_endpoint: str, file: UploadFile, user_id: int):
    """Gọi preprocess, lấy ảnh đã xử lý, đưa thẳng sang OCR + classifier + lưu history."""
    file_content = await file.read()

    async with httpx.AsyncClient(timeout=60.0) as client:
        # 1) preprocess
        pre_files = {"file": (file.filename, file_content, file.content_type)}
        pre_resp = await client.post(
            f"{PREPROCESS_URL}/preprocess{step_endpoint}",
            files=pre_files,
            timeout=30.0,
        )
        if pre_resp.status_code != 200:
            try:
                detail = pre_resp.json()
            except:
                detail = pre_resp.text
            raise HTTPException(status_code=pre_resp.status_code, detail=detail)

        pre_data = pre_resp.json() or {}
        img_data_url = pre_data.get("enhanced_image") or pre_data.get("image") or pre_data.get("image_base64")
        processed_bytes = _decode_data_url(img_data_url)

        # 2) OCR
        ocr_files = {"file": (file.filename, processed_bytes, "image/png")}
        ocr_resp = await client.post(
            f"{OCR_URL}/ocr/read",
            files=ocr_files,
            data={"user_id": user_id},
            timeout=60.0,
        )
        if ocr_resp.status_code != 200:
            try:
                detail = ocr_resp.json()
            except:
                detail = ocr_resp.text
            raise HTTPException(status_code=ocr_resp.status_code, detail=detail)

        result_data = ocr_resp.json() or {}
        ocr_text = result_data.get("text", "") or result_data.get("content", "")

        # 3) Classifier -> doc_type (optional)
        doc_type = "OTHER"
        if ocr_text and str(ocr_text).strip():
            try:
                cls_resp = await client.post(
                    f"{CLASSIFIER_URL}/classifier/by_text",
                    json={"text": str(ocr_text)[:2000]},
                    timeout=10.0,
                )
                if cls_resp.status_code == 200:
                    label = (cls_resp.json() or {}).get("label")
                    doc_type = _normalize_doc_type(label)
            except Exception:
                doc_type = "OTHER"

        # 4) Save history (best-effort)
        try:
            history_payload = {
                "user_id": user_id,
                "filename": file.filename,
                "ocr_text": str(ocr_text),
                "doc_type": doc_type,
                "language": "vi",
            }
            await client.post(
                f"{HISTORY_URL}/api/history/save",
                json=history_payload,
                timeout=2.0,
            )
        except Exception as e:
            print(f"⚠️ LỖI LƯU HISTORY (preprocess->ocr): {str(e)}")

        return {
            "image": img_data_url,
            "doc_type": doc_type,
            **result_data,
        }


@router.post("/enhance_ocr")
async def preprocess_enhance_ocr(file: UploadFile = File(...), user_id: int = Form(1)):
    return await _preprocess_then_ocr("/enhance", file, user_id)


@router.post("/threshold_ocr")
async def preprocess_threshold_ocr(file: UploadFile = File(...), user_id: int = Form(1)):
    return await _preprocess_then_ocr("/threshold", file, user_id)


@router.post("/deskew_ocr")
async def preprocess_deskew_ocr(file: UploadFile = File(...), user_id: int = Form(1)):
    return await _preprocess_then_ocr("/deskew", file, user_id)


@router.post("/full_ocr")
async def preprocess_full_ocr(file: UploadFile = File(...), user_id: int = Form(1)):
    return await _preprocess_then_ocr("/full", file, user_id)
