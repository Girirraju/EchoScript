# API contracts

- `POST /api/jobs` creates owned metadata and returns upload instructions.
- `PUT <upload_url>` uploads bytes directly without a bearer token.
- `POST /api/jobs/{id}/start` is idempotent and starts one processing job.
- `GET /api/jobs` lists only the current principal's jobs.
- `GET /api/jobs/{id}` returns separate transcription and video lifecycles.
- `POST /api/jobs/{id}/video` starts a recap after transcription.
- `GET /api/capabilities` supplies limits, languages, avatars, and voices.
- `GET /health`, `/ready`, `/version`, and `/metrics` support operations.

Transcription states are `CREATED`, `UPLOADED`, `RUNNING`, `TRANSCRIBED`, and `FAILED`. Video states are `NONE`, `PENDING`, `RENDERING`, `DONE`, and `FAILED`.

