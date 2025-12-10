from fastapi import APIRouter, HTTPException
import os
import requests

router = APIRouter()

SUMMARIZER_URL = os.getenv("SUMMARIZER_URL", "http://summarizer_service:8003")
AUTH_URL = os.getenv("AUTH_URL", "http://auth_service:8001")


def log_document(doc_type: str, language: str):
    """
    Gọi sang auth_service để ghi log document.
    Không để lỗi chỗ này làm hỏng API tóm tắt.
    """
    try:
        requests.post(
            f"{AUTH_URL}/auth/docs/log",
            json={"doc_type": doc_type, "language": language},
            timeout=2,
        )
    except requests.RequestException:
        # Bỏ qua lỗi log
        pass


@router.post("/summarize")
def summarize(payload: dict):
    try:
        res = requests.post(
            f"{SUMMARIZER_URL}/summarizer/summarize",
            json=payload,
            timeout=10,
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Lỗi gọi summarizer_service: {e}")

    if not res.ok:
        raise HTTPException(status_code=res.status_code, detail=res.json())

    data = res.json()

    # DEMO: mỗi lần tóm tắt coi như xử lý 1 "Đề cương" tiếng Việt
    log_document(doc_type="Đề cương", language="Tiếng Việt")

    return data
