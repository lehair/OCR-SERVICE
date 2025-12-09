import re

class SummarizerService:
    def summarize(self, text: str, max_sentences=3, max_chars=300):
        sentences = re.split(r'[.!?]', text)
        sentences = [s.strip() for s in sentences if s.strip()]

        summary = ". ".join(sentences[:max_sentences])

        if len(summary) > max_chars:
            summary = summary[:max_chars].rstrip() + "..."

        return summary