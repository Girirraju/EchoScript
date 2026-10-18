# EchoScript Studio

EchoScript Studio is an AWS-ready AI audio SaaS reference implementation for uploading audio, tracking transcription jobs, downloading TXT/SRT/VTT outputs, and producing optional AI recap videos.

## Local quick start

1. Copy `.env.example` to `.env`.
2. Run `docker compose up --build`.
3. Open `http://localhost:5173` and choose **Enter demo workspace**.

The local profile uses explicit mock authentication and a deterministic processor. Set `MOCK_PROCESSING=false` and run the transcribe worker for real CPU transcription with faster-whisper.

## Commands

- `make dev` starts the local stack.
- `make test` runs automated tests.
- `make build` creates production images.
- `make smoke` checks the running API.
- `make down` stops the stack.

See `docs/architecture.md`, `docs/local-development.md`, and `docs/deployment.md` for production guidance.

