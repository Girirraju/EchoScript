# Architecture

EchoScript separates the synchronous user API from CPU-heavy and provider-dependent work.

```text
Browser -> Cognito PKCE -> ALB/Traefik -> gateway-ui
                                      -> ingest-service -> private S3 metadata and outputs
                                                        -> Kubernetes transcription Job
                                                        -> internal video-service
Transcription Job -> faster-whisper -> TXT/SRT/VTT -> S3
Video Job -> HeyGen adapter -> MP4 copy -> Account 3 S3
```

Production uses three independently owned VPCs with non-overlapping CIDRs and full-mesh peering. Peering provides routability only; security groups, routes, DNS settings, CNI configuration, and network policies are still required. The k3s server lives in Account 2, CPU workers in Account 1, and application/monitoring capacity in Account 3.

Job metadata is behind a repository abstraction. Local mode uses atomic JSON files. Production uses private S3 objects under `status/{user_sub}/{job_id}.json`; video state should use a separate object to reduce concurrent write conflicts. S3 listing and optimistic concurrency limits are documented migration triggers for DynamoDB.

## Security boundaries

- Cognito access tokens are validated at the ingest API; IAM credentials never enter the browser.
- Uploads and downloads use short-lived presigned requests and explicit content types.
- Every job lookup includes the verified Cognito `sub`.
- The video API is cluster-internal and protected by a rotated service token plus network policy.
- Worker nodes use instance roles and private buckets with Block Public Access and encryption.

