# Cost management

Budgets are defined in every account. Review pricing in the selected region before apply; no fixed estimate is claimed in source because rates change.

Continuously billed resources include the ALB, NAT gateways if enabled, EC2 nodes, EBS volumes, CloudWatch ingestion, and optional managed endpoints. Keep one worker only for an active demonstration, scale application replicas down outside reviews, expire temporary objects, and tear down idle ALBs/NAT gateways when appropriate. Preserve remote state and required output buckets before destruction.

