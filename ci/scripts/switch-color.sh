#!/usr/bin/env bash
set -euo pipefail
NAMESPACE=${NAMESPACE:-echoscript}
COLOR=${1:?usage: switch-color.sh blue|green}
case "$COLOR" in blue|green) ;; *) echo "invalid color" >&2; exit 2 ;; esac
for service in gateway-ui ingest-service video-service; do
  kubectl -n "$NAMESPACE" rollout status "deployment/${service}-${COLOR}" --timeout=180s
done
curl --fail --silent "${SMOKE_URL:?SMOKE_URL required}/health"
for service in gateway-ui ingest-service video-service; do
  kubectl -n "$NAMESPACE" patch service "$service" --type merge -p "{\"spec\":{\"selector\":{\"app\":\"$service\",\"color\":\"$COLOR\"}}}"
done
echo "$COLOR" > .active-color

