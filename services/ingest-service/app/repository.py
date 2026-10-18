import json
from pathlib import Path
from threading import RLock

from .models import Job


class LocalJobRepository:
    def __init__(self, data_dir: Path):
        self.root = data_dir / "status"
        self.root.mkdir(parents=True, exist_ok=True)
        self._lock = RLock()

    def _path(self, user_sub: str, job_id: str) -> Path:
        return self.root / user_sub.replace("/", "_") / f"{job_id}.json"

    def save(self, job: Job) -> Job:
        path = self._path(job.user_sub, job.id)
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(".tmp")
        with self._lock:
            temporary.write_text(job.model_dump_json(indent=2), encoding="utf-8")
            temporary.replace(path)
        return job

    def get(self, user_sub: str, job_id: str) -> Job | None:
        path = self._path(user_sub, job_id)
        if not path.exists():
            return None
        with self._lock:
            return Job.model_validate_json(path.read_text(encoding="utf-8"))

    def list(self, user_sub: str) -> list[Job]:
        folder = self._path(user_sub, "placeholder").parent
        if not folder.exists():
            return []
        with self._lock:
            jobs = [Job.model_validate(json.loads(path.read_text(encoding="utf-8"))) for path in folder.glob("*.json")]
        return sorted(jobs, key=lambda item: item.created_at, reverse=True)

