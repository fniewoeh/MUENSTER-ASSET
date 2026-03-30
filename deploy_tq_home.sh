#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"
python3 "./scripts/deploy_tq_home.py" "$@"
