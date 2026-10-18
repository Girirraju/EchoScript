from dataclasses import dataclass


@dataclass(frozen=True)
class Segment:
    start: float
    end: float
    text: str


def timestamp(seconds: float, webvtt: bool = False) -> str:
    milliseconds = max(0, round(seconds * 1000))
    hours, milliseconds = divmod(milliseconds, 3_600_000)
    minutes, milliseconds = divmod(milliseconds, 60_000)
    whole_seconds, milliseconds = divmod(milliseconds, 1000)
    separator = "." if webvtt else ","
    return f"{hours:02}:{minutes:02}:{whole_seconds:02}{separator}{milliseconds:03}"


def to_srt(segments: list[Segment]) -> str:
    return "\n\n".join(f"{index}\n{timestamp(segment.start)} --> {timestamp(segment.end)}\n{segment.text.strip()}" for index, segment in enumerate(segments, 1)) + "\n"


def to_vtt(segments: list[Segment]) -> str:
    body = "\n\n".join(f"{timestamp(segment.start, True)} --> {timestamp(segment.end, True)}\n{segment.text.strip()}" for segment in segments)
    return f"WEBVTT\n\n{body}\n"

