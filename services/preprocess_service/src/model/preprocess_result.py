from pydantic import BaseModel

class PreprocessResult(BaseModel):
    filename: str
    image_base64: str