from fastapi import APIRouter, HTTPException
import os
import requests

router = APIRouter()

TRANSLATE_URL = os.getenv("TRANSLATE_URL", "http://translate_service:8006")
AUTH_URL = os.getenv("AUTH_URL", "http://auth_service:8001")


def log_document(doc_type: str, language: str):
    try:
        requests.post(
            f"{AUTH_URL}/auth/docs/log",
            json={"doc_type": doc_type, "language": language},
            timeout=2,
        )
    except requests.RequestException:
        pass


@router.post("/translate")
def translate(payload: dict):
    try:
        res = requests.post(
            f"{TRANSLATE_URL}/translate/translate",
            json=payload,
            timeout=10,
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Lỗi gọi translate_service: {e}")

    if not res.ok:
        raise HTTPException(status_code=res.status_code, detail=res.json())

    data = res.json()

    # DEMO:
    # Lấy target_lang từ payload để đoán tiếng Anh / Việt
    target_lang = (payload.get("target_lang") or "").lower()
    language = "Tiếng Anh" if target_lang.startswith("en") else "Tiếng Việt"

    # Giả sử các bản dịch này là loại "Căn cước công dân"
    log_document(doc_type="Căn cước công dân", language=language)

    return data
