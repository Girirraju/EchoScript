# Terraform deployment

Each account is initialized and planned independently to keep state isolated. Configure an encrypted S3 backend and DynamoDB lock table in a separate bootstrap step, then run `terraform init`, `terraform fmt -check`, `terraform validate`, and `terraform plan` in each account directory. Do not run `apply` from CI without the manual approval gate.

The CIDRs are `10.10.0.0/16`, `10.20.0.0/16`, and `10.30.0.0/16`. Cross-account VPC peering requires requester/accepter roles and routes in both directions. Add those only after the three account IDs and role ARNs are known. VPC peering is not a shared VPC; AWS RAM shared-subnet architecture is a separately approved alternative.

