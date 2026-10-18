from app.summarizer import summarize


def test_summary_is_deterministic_and_bounded():
    text = "Audio becomes knowledge. Teams record meetings. Audio contains useful decisions. EchoScript creates transcripts. Teams reuse knowledge."
    result = summarize(text, limit=80, sentence_count=2)
    assert len(result) <= 80
    assert result == summarize(text, limit=80, sentence_count=2)

