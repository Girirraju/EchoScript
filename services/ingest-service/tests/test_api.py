import os
from pathlib import Path

os.environ["DATA_DIR"] = str(Path(__file__).parent / ".test-data")
os.environ["MOCK_AUTH"] = "true"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_and_version():
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/version").status_code == 200


def test_job_lifecycle_starts():
    audio = b"fake-audio"
    response = client.post("/api/jobs", json={"filename": "meeting.mp3", "content_type": "audio/mpeg", "size_bytes": len(audio), "language": "auto", "generate_video": False})
    assert response.status_code == 201
    job_id = response.json()["job"]["id"]
    assert client.put(f"/api/uploads/{job_id}", content=audio).status_code == 204
    assert client.post(f"/api/jobs/{job_id}/start").status_code == 200


def test_rejects_unsupported_type():
    response = client.post("/api/jobs", json={"filename": "notes.txt", "content_type": "text/plain", "size_bytes": 5})
    assert response.status_code == 422

