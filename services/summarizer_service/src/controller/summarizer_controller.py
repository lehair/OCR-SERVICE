from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.service.summarizer_service import SummarizerService
from src.model.summarizer_result import SummaryResult

router = APIRouter()
summarizer = SummarizerService()


class TextIn(BaseModel):
    text: str
    max_sentences: int = 3
    max_chars: int = 300


@router.post("/summarize", response_model=SummaryResult)
def summarize_text(payload: TextIn):
    try:
        text = (payload.text or "").strip()
        if not text:
            return SummaryResult(summary="")

        summary = summarizer.summarize(
            text=text,
            max_sentences=payload.max_sentences,
            max_chars=payload.max_chars,
        )

        return SummaryResult(summary=summary)

    except Exception as e:
        print("Summarize error:", repr(e))
        raise HTTPException(status_code=500, detail="Error while summarizing")
