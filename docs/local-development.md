# Local development

## Docker

```powershell
Copy-Item .env.example .env
docker compose -f docker-compose.yml -f docker-compose.video.yml up --build
```

Open `http://localhost:5173`. Demo authentication is intentionally enabled only by environment configuration. Uploaded files and generated outputs are written to `data/`.

## Real transcription

Build the worker and run it against an audio file:

```powershell
docker build -t echoscript-worker services/transcribe-worker
docker run --rm -v ${PWD}:/work echoscript-worker --input /work/sample.mp3 --output /work/results --language auto
```

The first run downloads the configured faster-whisper model. `tiny.en` and CPU `int8` are local defaults; use a persistent `/models` volume for the model cache.

## Windows commands

Use `docker compose up --build`, `npm run build`, and `pytest -q` directly when GNU Make is unavailable.

## Frontend organization

The frontend lives in `frontend/src`:

- `App.tsx` defines routes, and `main.tsx` sets up application providers.
- `pages/` contains the screen components for each route.
- `components/` contains shared UI and the authentication gate.
- `hooks/` contains shared query hooks.
- `auth/` contains Cognito session and PKCE helpers.
- `lib/` contains audio and upload utilities with regression tests.
- `api.ts` defines API calls, and `types.ts` defines shared API types.

From `frontend/`, run `npm run lint`, `npm test -- --run`, and `npm run build` before pushing frontend changes. The tests use mocked browser APIs and do not require a running backend or Cognito account.

