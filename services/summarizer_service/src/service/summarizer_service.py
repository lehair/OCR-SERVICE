import re
from collections import Counter
from math import log

# Bộ stopwords nhẹ (VN + EN) để tóm tắt ổn hơn, tránh lặp từ vô nghĩa
STOPWORDS = {
    # Vietnamese
    "và","là","của","cho","trong","một","những","các","được","với","khi","đã","đang","sẽ","này","đó","để","từ",
    "về","theo","tại","trên","dưới","ra","vào","nên","cũng","thì","rằng","như","nếu","hay","hoặc","do","bởi","tới",
    "đến","ở","vì","mà","lại","nữa","thêm","rất","khá","nhiều","ít","hơn","kém","đây","kia","ấy","cùng","nào",
    # English
    "the","a","an","and","or","but","to","of","in","on","for","with","as","at","by","from","is","are","was","were",
    "be","been","being","it","this","that","these","those","i","you","he","she","they","we","me","him","her","them",
    "my","your","our","their","not","no","yes","can","could","will","would","should","may","might","do","does","did",
}

_SENT_SPLIT_RE = re.compile(r'(?<=[\.\?\!\:])\s+|\n+')
_WORD_RE = re.compile(r"[A-Za-zÀ-ỹ0-9]+", re.UNICODE)

def _clean_text(text: str) -> str:
    # Giữ lại xuống dòng để tách câu tốt hơn
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # loại khoảng trắng thừa
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def _split_sentences(text: str):
    # tách câu tương đối ổn cho tiếng Việt/Anh
    parts = _SENT_SPLIT_RE.split(text)
    sents = []
    for p in parts:
        s = p.strip()
        if not s:
            continue
        # tránh lấy câu quá ngắn (thường là tiêu đề rời rạc)
        if len(s) < 20:
            continue
        sents.append(s)
    return sents

def _tokenize(s: str):
    words = [w.lower() for w in _WORD_RE.findall(s)]
    cleaned = []
    for w in words:
        if w in STOPWORDS:
            continue
        # bỏ token quá ngắn
        if len(w) <= 2:
            continue
        cleaned.append(w)
    return cleaned

class SummarizerService:
    def summarize(self, text: str, max_sentences: int = 3, max_chars: int = 300) -> str:
        text = _clean_text(text or "")
        if not text:
            return ""

        sentences = _split_sentences(text)
        if not sentences:
            # fallback: cắt ngắn đoạn
            return (text[:max_chars].rstrip() + "...") if len(text) > max_chars else text

        # Lấy tối đa ~60 câu đầu để tránh chậm khi text quá dài
        sentences = sentences[:60]

        # Tính TF-IDF nhẹ (dạng log) để ưu tiên từ mang thông tin
        tokenized = [ _tokenize(s) for s in sentences ]
        # fallback nếu token rỗng
        all_tokens = [t for toks in tokenized for t in toks]
        if not all_tokens:
            # nếu không có từ khoá, lấy các câu đầu
            summary = " ".join(sentences[:max_sentences])
            return (summary[:max_chars].rstrip() + "...") if len(summary) > max_chars else summary

        tf = Counter(all_tokens)
        # document frequency (số câu chứa token)
        df = Counter()
        for toks in tokenized:
            for w in set(toks):
                df[w] += 1

        N = len(sentences)
        # điểm từ: tf * idf(log)
        word_score = {}
        for w, c in tf.items():
            idf = log((N + 1) / (df[w] + 1)) + 1.0
            word_score[w] = c * idf

        # điểm câu: tổng điểm từ / độ dài; cộng nhẹ trọng số vị trí (câu đầu thường chứa ý chính)
        sent_scores = []
        for idx, (s, toks) in enumerate(zip(sentences, tokenized)):
            if not toks:
                sent_scores.append((idx, 0.0))
                continue
            base = sum(word_score.get(w, 0.0) for w in toks)
            norm = base / (len(toks) ** 0.8)
            pos_boost = 1.0 + (0.12 * (1.0 - idx / max(1, N - 1)))  # câu đầu boost ~+12%
            # boost nhẹ nếu có số (thường là thông tin quan trọng)
            num_boost = 1.08 if re.search(r"\d", s) else 1.0
            sent_scores.append((idx, norm * pos_boost * num_boost))

        # chọn top-k câu theo điểm, giữ nguyên thứ tự gốc
        k = max(1, int(max_sentences))
        top = sorted(sent_scores, key=lambda x: x[1], reverse=True)[:k]
        top_idx = sorted([i for i,_ in top])

        summary = " ".join(sentences[i] for i in top_idx).strip()

        # đảm bảo không vượt max_chars
        if max_chars and len(summary) > max_chars:
            summary = summary[:max_chars].rstrip()
            # cắt đến hết từ
            summary = re.sub(r"\s+\S*$", "", summary).rstrip()
            summary += "..."

        return summary
