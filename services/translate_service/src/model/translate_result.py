from pydantic import BaseModel

class TranslateResult(BaseModel):
    original_text: str
    translated_text: str
    source_lang: str = "vi"
    target_lang: str = "en"