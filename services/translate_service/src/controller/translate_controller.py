from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.service.translate_service import TranslateService

router = APIRouter()
translate_service = TranslateService()

class TranslateRequest(BaseModel):
    text: str
    target_lang: str = "en"
    source_lang: str = "auto"

@router.post("/translate")
async def translate_text(request: TranslateRequest):
    try:
        print(f"Received translation request: {request.text[:100]}...")
        
        if not request.text or not request.text.strip():
            return {
                'success': False,
                'error': 'Không có văn bản để dịch'
            }
        
        # Xác định ngôn ngữ nguồn
        source_lang = request.source_lang
        if source_lang == 'auto':
            source_lang = translate_service.detect_language(request.text)
        
        print(f"Source lang: {source_lang}, Target lang: {request.target_lang}")
        
        # Thực hiện dịch
        result = translate_service.translate_text(
            request.text, 
            request.target_lang, 
            source_lang
        )
        
        print(f"Translation result: {result}")
        
        return result
            
    except Exception as e:
        print(f"Translation controller error: {str(e)}")
        return {
            'success': False,
            'error': f"Lỗi server: {str(e)}"
        }