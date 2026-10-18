# Security model

Production must disable mock authentication and validate Cognito JWT signature, issuer, expiry, `token_use`, and client association against cached JWKS. Browser tokens remain in memory; refresh persistence should use a backend-for-frontend with HttpOnly, Secure, SameSite cookies.

S3 buckets are private, encrypted, versioned, and public access is blocked. IAM policies must name exact bucket/object ARNs. Kubernetes permissions limit ingest-service to creating and inspecting Jobs in the application namespace. Metrics and administrative tools are not exposed through the user ingress.

Use HTTPS before enabling Cognito. CORS is an explicit origin list. Rotate internal service tokens and HeyGen secrets, redact credentials and raw transcript content from logs, and scan dependencies, secrets, Terraform, and images in CI.

