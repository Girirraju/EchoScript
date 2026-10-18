# Architecture decisions

1. Horizontal navigation matches the enterprise reference and avoids an unnecessary sidebar.
2. Transcription and video states are independent so recap failure never invalidates a transcript.
3. Direct object-storage upload keeps large audio away from the synchronous API.
4. Repository and worker adapters allow local JSON/background processing and production S3/Kubernetes execution.
5. Blue/green colors are labels behind stable Services, enabling an atomic selector switch and quick rollback.
6. S3 metadata is acceptable for the demonstration but DynamoDB is the migration path for concurrency and listing scale.

