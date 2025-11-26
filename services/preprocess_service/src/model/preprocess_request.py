from pydantic import BaseModel

class PreprocessRequest(BaseModel):
    brightness: float = 1.0
    contrast: float = 1.0
    sharpen: bool = False
    threshold: bool = False
    deskew: bool = False