from worker.subtitles import Segment, timestamp, to_srt, to_vtt


def test_timestamps_and_formats():
    segments = [Segment(0.125, 2.5, "Hello world")]
    assert timestamp(0.125) == "00:00:00,125"
    assert "00:00:00,125 --> 00:00:02,500" in to_srt(segments)
    assert to_vtt(segments).startswith("WEBVTT")

