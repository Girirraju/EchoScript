from datetime import datetime, timezone
from enum import StrEnum

from pydantic import BaseModel, Field


class JobStatus(StrEnum):
    CREATED = "CREATED"
    UPLOADED = "UPLOADED"
    RUNNING = "RUNNING"
    TRANSCRIBED = "TRANSCRIBED"
    FAILED = "FAILED"


class VideoStatus(StrEnum):
    NONE = "NONE"
    PENDING = "PENDING"
    RENDERING = "RENDERING"
    DONE = "DONE"
    FAILED = "FAILED"


class OutputLinks(BaseModel):
    transcript: str | None = None
    srt: str | None = None
    vtt: str | None = None
    audio: str | None = None
    video: str | None = None


class Job(BaseModel):
    id: str
    user_sub: str
    filename: str
    content_type: str
    size_bytes: int = Field(ge=1)
    language: str = "auto"
    generate_video: bool = False
    status: JobStatus = JobStatus.CREATED
    video_status: VideoStatus = VideoStatus.NONE
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    started_at: datetime | None = None
    completed_at: datetime | None = None
    duration_seconds: float | None = None
    error_message: str | None = None
    transcript_preview: str | None = None
    outputs: OutputLinks = Field(default_factory=OutputLinks)


class CreateJobRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    content_type: str
    size_bytes: int = Field(gt=0)
    language: str = "auto"
    generate_video: bool = False


class CreateJobResponse(BaseModel):
    job: Job
    upload_url: str
    upload_method: str = "PUT"
    upload_headers: dict[str, str]

