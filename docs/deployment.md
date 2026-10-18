# Deployment checklist

1. Bootstrap separate encrypted Terraform state for each AWS account.
2. Configure short-lived cross-account deployment roles and trusted principals.
3. Review CIDRs, private DNS, route tables, peering accepter roles, and CNI traffic.
4. Run `terraform fmt -check`, `terraform validate`, security scanning, and `terraform plan`.
5. Apply only after human approval; record outputs without secrets.
6. Install the Account 2 k3s server, then join Account 1 workers and the Account 3 app node using an SSM-protected token.
7. Configure ECR repositories and immutable commit-SHA image tags.
8. Store Cognito values, bucket names, service token, and HeyGen key in Secrets Manager/Kubernetes secrets.
9. Replace example image registry, domain, and TLS secret values in manifests.
10. Deploy both blue and green colors, smoke-test the inactive color, then patch stable Service selectors.
11. Confirm Cognito uses Authorization Code + PKCE and an HTTPS callback URL.
12. Verify per-user job isolation, presigned URL expiry, network policies, alerts, backups, and rollback.

No AWS resources are applied by this repository automatically.

