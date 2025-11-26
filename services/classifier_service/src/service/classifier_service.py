# src/service/classifier_service.py
import re
from sentence_transformers import SentenceTransformer, util

class DocumentClassifierService:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.samples = {
            "Căn cước công dân": "Căn cước công dân Việt Nam, số CCCD, họ tên, ngày sinh, quốc tịch.",
            "Thẻ sinh viên": "Thẻ sinh viên, mã số sinh viên, trường đại học, khoa, khóa học.",
            "Đề cương": "Đề cương học phần, môn học, tín chỉ, giảng viên, thời gian học.",
        }

    # Rule-based
    def _rule_based(self, text: str):
        text_lower = text.lower()
        if any(kw in text_lower for kw in ["căn cước công dân", "cmnd", "cccd", "số cccd"]):
            return "Căn cước công dân"
        elif any(kw in text_lower for kw in ["thẻ sinh viên", "mssv", "sinh viên", "trường đại học"]):
            return "Thẻ sinh viên"
        elif any(kw in text_lower for kw in ["đề cương", "tín chỉ", "giảng viên", "môn học"]):
            return "Đề cương"
        else:
            return None

    # Similarity-based fallback
    def _semantic_similarity(self, text: str):
        text_emb = self.model.encode(text, convert_to_tensor=True)
        scores = {label: util.cos_sim(text_emb, self.model.encode(desc, convert_to_tensor=True)).item()
                  for label, desc in self.samples.items()}
        return max(scores, key=lambda x: scores[x])

    # Public
    def classify(self, text: str):
        rule_result = self._rule_based(text)
        if rule_result:
            return {"label": rule_result, "method": "rule"}
        return {"label": self._semantic_similarity(text), "method": "similarity"}