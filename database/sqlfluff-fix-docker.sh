#!/bin/bash
#
# Run SQLFluff auto-fix in a disposable Docker container
# Usage: ./database/fix-docker.sh

set -e

echo "🔧 Running SQLFluff auto-fix in Docker container..."

docker run --rm \
  -v "$(pwd)/database:/workspace/database" \
  -w /workspace/database \
  python:3.12-slim \
  bash -c "pip install -q sqlfluff==3.2.5 && sqlfluff fix --ignore parsing -v"

echo "✅ Auto-fix complete!"
