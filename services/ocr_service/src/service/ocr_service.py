import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import easyocr

class OCRService:
    def __init__(self, lang_list=None):
        if lang_list is None:
            lang_list = ['en', 'vi']
        self.reader = easyocr.Reader(lang_list)

    def read_text(self, image_path: str) -> str:
        results = self.reader.readtext(image_path, detail=0)
        return "\n".join(results)