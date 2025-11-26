# src/controller/ocr_controller.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import os

from src.service.ocr_service import OCRService
from src.utils.file_helper import save_temp_file
from src.model.result import OCRResult

router = APIRouter()
ocr_service = OCRService()

@router.post("/read", response_model=OCRResult)
async def read_text(file: UploadFile = File(...)):
    file_path = save_temp_file(file)
    try:
        text = ocr_service.read_text(file_path)
    finally:
        try:
            os.remove(file_path)
        except:
            pass
    # nếu ocr_service.read_text trả dict, chuyển thành string phù hợp
    if isinstance(text, dict):
        # ưu tiên trường raw_text hoặc text nếu có
        text_str = text.get("raw_text") or text.get("text") or str(text)
    else:
        text_str = str(text)
    return OCRResult(filename=file.filename, text=text_str)


