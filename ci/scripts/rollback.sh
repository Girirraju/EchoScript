#!/usr/bin/env bash
set -euo pipefail
CURRENT=${1:-blue}
if [ "$CURRENT" = blue ]; then TARGET=green; else TARGET=blue; fi
exec "$(dirname "$0")/switch-color.sh" "$TARGET"

