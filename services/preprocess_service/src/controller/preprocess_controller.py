from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np
import cv2
import base64
from src.service.preprocess_service import PreprocessService

router = APIRouter()
service = PreprocessService()

def read_image(file: UploadFile) -> np.ndarray:
    """Đọc UploadFile thành numpy array"""
    content = file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    arr = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Cannot decode image")

    return img

def encode_image(img: np.ndarray) -> str:
    """Encode ảnh numpy -> data:image/png;base64,..."""
    ok, encoded = cv2.imencode(".png", img)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to encode image")

    b64 = base64.b64encode(encoded.tobytes()).decode("utf-8")
    return f"data:image/png;base64,{b64}"

# ==================== ENHANCE (Sharpen) ====================
@router.post("/enhance")
def enhance_image(file: UploadFile = File(...)):
    img = read_image(file)
    result = service.sharpen(img)
    return {"enhanced_image": encode_image(result)}

# ==================== THRESHOLD ===========================
@router.post("/threshold")
def threshold_image(file: UploadFile = File(...)):
    img = read_image(file)
    result = service.threshold(img)
    return {"image": encode_image(result)}

# ==================== DESKEW ==============================
@router.post("/deskew")
def deskew_image(file: UploadFile = File(...)):
    img = read_image(file)
    result = service.deskew(img)
    return {"image": encode_image(result)}

# ==================== FULL PIPELINE =======================
@router.post("/full")
def full_preprocess(file: UploadFile = File(...)):
    img = read_image(file)
    img = service.deskew(img)
    img = service.sharpen(img)
    img = service.threshold(img)
    return {"image": encode_image(img)}
