#!/bin/bash
#
# Run SQLFluff linting in a disposable Docker container
# Usage: ./database/lint-docker.sh

set -e

echo "🔍 Running SQLFluff linter in Docker container..."

docker run --rm \
  -v "$(pwd)/database:/workspace/database:ro" \
  -w /workspace/database \
  python:3.12-slim \
  bash -c "pip install -q sqlfluff==3.2.5 && sqlfluff lint --ignore parsing"

echo "✅ Linting complete!"
