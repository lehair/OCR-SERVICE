from fastapi import APIRouter
from pydantic import BaseModel
from src.service.classifier_service import DocumentClassifierService

router = APIRouter()
classifier_service = DocumentClassifierService()

class TextInput(BaseModel):
    text: str

@router.post("/by_text")
def classify_text(payload: TextInput):
    result = classifier_service.classify(payload.text)
    return result