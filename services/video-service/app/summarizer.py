import re
from collections import Counter


def summarize(text: str, limit: int = 1500, sentence_count: int = 5) -> str:
    sentences = [item.strip() for item in re.split(r"(?<=[.!?])\s+", text.strip()) if item.strip()]
    if len(sentences) <= sentence_count:
        return text[:limit].strip()
    words = re.findall(r"[a-zA-Z]{4,}", text.lower())
    stop_words = {"that", "this", "with", "from", "have", "were", "they", "their", "about", "into", "when", "what", "your"}
    frequency = Counter(word for word in words if word not in stop_words)
    ranked = sorted(enumerate(sentences), key=lambda pair: sum(frequency[word] for word in re.findall(r"[a-zA-Z]{4,}", pair[1].lower())), reverse=True)[:sentence_count]
    selected = " ".join(sentence for _, sentence in sorted(ranked))
    return selected[:limit].strip()

