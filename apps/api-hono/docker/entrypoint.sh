#!/bin/sh
set -eu

DATA_DIR="$(dirname "${DATABASE_URL:-/app/data/hono.db}")"
mkdir -p "$DATA_DIR"

echo "[entrypoint] Running migrations against ${DATABASE_URL}"
bun run scripts/migrate.ts

echo "[entrypoint] Starting: $*"
exec "$@"
