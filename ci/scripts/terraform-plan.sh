#!/usr/bin/env bash
set -euo pipefail
for directory in infrastructure/terraform/account1 infrastructure/terraform/account2 infrastructure/terraform/account3; do
  terraform -chdir="$directory" init
  terraform -chdir="$directory" plan -out=tfplan
done

