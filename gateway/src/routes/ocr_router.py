from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import httpx
import os
import json

router = APIRouter()

# 1. Lấy địa chỉ các Service từ biến môi trường
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

@router.post("/read")
async def proxy_ocr_read(
    file: UploadFile = File(...),
    user_id: int = Form(1)
):
    # Tăng timeout lên 60s vì OCR xử lý ảnh lâu hơn text
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            # --- BƯỚC 1: ĐỌC FILE VÀ GỬI SANG OCR SERVICE ---
            file_content = await file.read()
            files = {'file': (file.filename, file_content, file.content_type)}
            data = {'user_id': user_id}
            
            # Gọi sang OCR Service
            target_url = f"{OCR_URL}/ocr/read"
            response = await client.post(target_url, files=files, data=data)
            
            if response.status_code != 200:
                 # Nếu OCR lỗi thì báo lỗi luôn, không lưu lịch sử
                 raise HTTPException(status_code=response.status_code, detail=response.json())
            
            # Lấy kết quả OCR trả về
            result_data = response.json() 
            # Giả sử result_data có dạng: {"text": "Cộng hòa xã hội...", "confidence": 0.9}

            # --- BƯỚC 2: 🔥 PHÂN LOẠI DOC_TYPE + LƯU VÀO HISTORY ---
            try:
                ocr_text = result_data.get("text", "") or result_data.get("content", "")

                # 2.1. Gọi Classifier để suy ra loại tài liệu (CCCD/THE_SV/OTHER)
                doc_type = "OTHER"
                if ocr_text and ocr_text.strip():
                    try:
                        cls_resp = await client.post(
                            f"{CLASSIFIER_URL}/classifier/by_text",
                            json={"text": ocr_text[:2000]},
                            timeout=10.0,
                        )
                        if cls_resp.status_code == 200:
                            label = (cls_resp.json() or {}).get("label")
                            doc_type = _normalize_doc_type(label)
                    except Exception:
                        # Classifier lỗi thì fallback OTHER
                        doc_type = "OTHER"
                
                history_payload = {
                    "user_id": user_id,
                    "filename": file.filename,
                    "ocr_text": ocr_text,
                    "doc_type": doc_type,
                    "language": "vi",
                }
                
                # Gọi History Service (đúng endpoint /save)
                await client.post(
                    f"{HISTORY_URL}/api/history/save",
                    json=history_payload,
                    timeout=2.0,
                )
                
            except Exception as e:
                # 👇 Quan trọng: In lỗi ra để nếu vẫn sai thì mình biết sai ở đâu
                print(f"⚠️ LỖI LƯU HISTORY: {str(e)}") 

            # --- BƯỚC 3: TRẢ KẾT QUẢ VỀ FRONTEND ---
            return result_data
            
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Gateway không gọi được OCR Service: {str(e)}")