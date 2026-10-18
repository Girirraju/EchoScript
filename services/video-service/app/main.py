import os
from secrets import compare_digest

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .heygen import HeyGenClient
from .summarizer import summarize

app = FastAPI(title="EchoScript Video Service", version=os.getenv("APP_VERSION", "0.1.0"))


class SummaryRequest(BaseModel):
    transcript: str = Field(min_length=1, max_length=100_000)
    limit: int = Field(default=1500, ge=100, le=5000)


class VideoRequest(BaseModel):
    job_id: str
    script: str = Field(min_length=1, max_length=5000)
    avatar_id: str
    voice_id: str


def authorize(token: str | None) -> None:
    expected = os.getenv("INTERNAL_SERVICE_TOKEN", "local-video-token")
    if not token or not compare_digest(token, expected):
        raise HTTPException(status_code=401, detail="Invalid internal service token")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/internal/summarize")
def create_summary(payload: SummaryRequest, x_internal_token: str | None = Header(default=None)) -> dict[str, str]:
    authorize(x_internal_token)
    return {"summary": summarize(payload.transcript, payload.limit)}


@app.post("/internal/videos")
async def create_video(payload: VideoRequest, x_internal_token: str | None = Header(default=None)) -> dict[str, str]:
    authorize(x_internal_token)
    if os.getenv("MOCK_VIDEO", "true").lower() == "true":
        return {"job_id": payload.job_id, "provider_id": f"mock-{payload.job_id}", "status": "PENDING"}
    api_key = os.getenv("HEYGEN_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="HeyGen integration is not configured")
    provider_id = await HeyGenClient(api_key).create_video(payload.script, payload.avatar_id, payload.voice_id)
    return {"job_id": payload.job_id, "provider_id": provider_id, "status": "PENDING"}

