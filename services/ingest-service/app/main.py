from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest

from .auth import Principal, get_principal
from .config import get_settings
from .models import CreateJobRequest, CreateJobResponse, Job, JobStatus, VideoStatus
from .processor import process_mock_job, process_mock_video
from .repository import LocalJobRepository

settings = get_settings()
repository = LocalJobRepository(settings.data_dir)
app = FastAPI(title="EchoScript Ingest Service", version=settings.app_version)
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, allow_credentials=False, allow_methods=["GET", "POST", "PUT", "OPTIONS"], allow_headers=["Authorization", "Content-Type"])

job_submissions = Counter("echoscript_job_submissions_total", "Submitted jobs")
active_jobs = Gauge("echoscript_active_jobs", "Active jobs")
request_duration = Histogram("echoscript_http_request_duration_seconds", "API latency", ["method", "route"])


@app.middleware("http")
async def secure_response(request: Request, call_next):
    with request_duration.labels(request.method, request.url.path).time():
        response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


def require_job(principal: Principal, job_id: str) -> Job:
    job = repository.get(principal.sub, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready")
def ready() -> dict[str, str]:
    return {"status": "ready"}


@app.get("/version")
def version() -> dict[str, str]:
    return {"version": settings.app_version, "commit": settings.commit_sha, "color": settings.deployment_color}


@app.get("/metrics")
def metrics() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/api/capabilities")
def capabilities() -> dict:
    return {
        "audio_types": ["audio/mpeg", "audio/wav", "audio/x-m4a", "audio/mp4"],
        "extensions": ["mp3", "wav", "m4a"],
        "max_upload_bytes": settings.max_upload_bytes,
        "languages": [{"value": "auto", "label": "Auto-detect"}, {"value": "en", "label": "English"}],
        "video": {
            "enabled": True, "mock": settings.mock_video, "max_script_characters": 1500,
            "avatars": [{"id": "demo-nova", "name": "Nova", "role": "Knowledge guide"}, {"id": "demo-mateo", "name": "Mateo", "role": "Business presenter"}, {"id": "demo-aria", "name": "Aria", "role": "Learning coach"}],
            "voices": [{"id": "demo-clear", "name": "Clear & warm"}, {"id": "demo-studio", "name": "Studio neutral"}]
        }
    }


@app.post("/api/jobs", response_model=CreateJobResponse, status_code=201)
def create_job(payload: CreateJobRequest, principal: Principal = Depends(get_principal)) -> CreateJobResponse:
    if payload.size_bytes > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="Audio exceeds the configured upload limit")
    if payload.content_type not in {"audio/mpeg", "audio/wav", "audio/x-m4a", "audio/mp4"}:
        raise HTTPException(status_code=422, detail="Unsupported audio type")
    job = Job(id=uuid4().hex, user_sub=principal.sub, **payload.model_dump())
    repository.save(job)
    job_submissions.inc()
    return CreateJobResponse(job=job, upload_url=f"{settings.public_api_url}/api/uploads/{job.id}", upload_headers={"Content-Type": payload.content_type})


@app.put("/api/uploads/{job_id}", status_code=204)
async def upload_audio(job_id: str, request: Request) -> Response:
    job = repository.get("demo-user-001", job_id) if settings.mock_auth else None
    if not job:
        raise HTTPException(status_code=404, detail="Upload target not found")
    body = await request.body()
    if not body or len(body) != job.size_bytes:
        raise HTTPException(status_code=400, detail="Uploaded size does not match job metadata")
    upload_dir = settings.data_dir / "uploads" / job.user_sub
    upload_dir.mkdir(parents=True, exist_ok=True)
    (upload_dir / f"{job.id}-{Path(job.filename).name}").write_bytes(body)
    job.status = JobStatus.UPLOADED
    job.updated_at = datetime.now(timezone.utc)
    repository.save(job)
    return Response(status_code=204)


@app.post("/api/jobs/{job_id}/start")
def start_job(job_id: str, background: BackgroundTasks, principal: Principal = Depends(get_principal)) -> Job:
    job = require_job(principal, job_id)
    if job.status in {JobStatus.RUNNING, JobStatus.TRANSCRIBED}:
        return job
    if job.status != JobStatus.UPLOADED:
        raise HTTPException(status_code=409, detail="Audio upload must complete before processing")
    if not settings.mock_processing:
        raise HTTPException(status_code=503, detail="External worker mode requires Kubernetes orchestration")
    job.status = JobStatus.RUNNING
    job.started_at = datetime.now(timezone.utc)
    job.updated_at = job.started_at
    repository.save(job)
    active_jobs.inc()
    background.add_task(process_mock_job, repository, settings.data_dir, principal.sub, job.id)
    return job


@app.get("/api/jobs")
def list_jobs(status_filter: str | None = Query(default=None, alias="status"), principal: Principal = Depends(get_principal)) -> list[Job]:
    jobs = repository.list(principal.sub)
    return [job for job in jobs if not status_filter or job.status.value == status_filter.upper()]


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str, principal: Principal = Depends(get_principal)) -> Job:
    return require_job(principal, job_id)


@app.post("/api/jobs/{job_id}/video")
def request_video(job_id: str, background: BackgroundTasks, principal: Principal = Depends(get_principal)) -> Job:
    job = require_job(principal, job_id)
    if job.status != JobStatus.TRANSCRIBED:
        raise HTTPException(status_code=409, detail="Transcription must complete first")
    if job.video_status in {VideoStatus.PENDING, VideoStatus.RENDERING, VideoStatus.DONE}:
        return job
    job.video_status = VideoStatus.PENDING
    repository.save(job)
    background.add_task(process_mock_video, repository, settings.data_dir, principal.sub, job.id)
    return job


@app.get("/api/jobs/{job_id}/files/{filename}")
def download_file(job_id: str, filename: str, principal: Principal = Depends(get_principal)) -> FileResponse:
    require_job(principal, job_id)
    if filename not in {"transcript.txt", "subtitles.srt", "subtitles.vtt", "recap.mp4"}:
        raise HTTPException(status_code=404, detail="File not found")
    path = settings.data_dir / "outputs" / principal.sub / job_id / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not ready")
    return FileResponse(path, filename=filename)


@app.get("/api/jobs/{job_id}/audio")
def stream_audio(job_id: str, principal: Principal = Depends(get_principal)) -> FileResponse:
    job = require_job(principal, job_id)
    matches = list((settings.data_dir / "uploads" / principal.sub).glob(f"{job.id}-*"))
    if not matches:
        raise HTTPException(status_code=404, detail="Audio not found")
    return FileResponse(matches[0], media_type=job.content_type)

