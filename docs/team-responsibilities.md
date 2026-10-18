# Team responsibilities

- Member 1 owns Account 1 networking, S3, Cognito, IAM, worker ASG, ingest-service, and infrastructure CI.
- Member 2 owns Account 2 networking, k3s control plane, ECR, ALB, frontend, Jenkins, and blue/green delivery.
- Member 3 owns Account 3 networking, transcription worker, video-service, HeyGen integration, Prometheus, Grafana, and runtime CI.

Shared contracts under `shared/contracts` are reviewed by all members. Changes to job states, object keys, auth claims, or service endpoints require coordinated versioning. No member places account credentials in Git or copies long-lived keys between accounts.

