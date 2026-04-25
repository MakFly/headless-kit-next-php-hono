#!/usr/bin/env bash
# Build create-headless-app and run it inside ./install-test/
# Usage: bash scripts/install-cli.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI_DIR="$ROOT/packages/create-headless-app"
TARGET="$ROOT/install-test"

echo "► Building CLI..."
(cd "$CLI_DIR" && bun install --silent && bun run build)

mkdir -p "$TARGET"
echo "► Launching CLI in $TARGET"
echo ""

cd "$TARGET" && bun "$CLI_DIR/src/index.ts"
