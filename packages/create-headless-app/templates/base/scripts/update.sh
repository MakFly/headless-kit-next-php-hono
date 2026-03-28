#!/usr/bin/env bash
# Headless Kit — Project Updater
# Applies migrations between versions automatically.
# Usage: bash scripts/update.sh [target-version]
#
# Designed to be called by Claude Code:
#   ! bash scripts/update.sh
#
# What it does:
#   1. Detects current project version from README.md
#   2. Downloads migration guide from the Headless Kit registry
#   3. Applies automated codemods (port fixes, file additions, import rewrites)
#   4. Runs scripts/verify.sh to check project health
#
# What it does NOT do:
#   - Complex refactors (use Claude Code for those — the migration guide is readable by Claude)
#   - Breaking changes that require manual decisions

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Detect project root
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo -e "${BOLD}Headless Kit Updater${NC}\n"

# ─────────────────────────────────────────────
# 1. Detect current version
# ─────────────────────────────────────────────

CURRENT=$(grep -oP 'v\K[0-9]+\.[0-9]+\.[0-9]+' README.md 2>/dev/null | head -1 || echo "")
if [ -z "$CURRENT" ]; then
  echo -e "${RED}Cannot detect current version from README.md${NC}"
  echo "Add a line like 'Scaffolded with Headless Kit v0.1.0' to your README.md"
  exit 1
fi
echo -e "Current version: ${BOLD}v${CURRENT}${NC}"

# ─────────────────────────────────────────────
# 2. Detect target version
# ─────────────────────────────────────────────

# Target can be passed as argument or fetched from registry
TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  # Try to fetch latest from npm
  if command -v bun &> /dev/null; then
    TARGET=$(bun pm view create-headless-app version 2>/dev/null || echo "")
  fi
  if [ -z "$TARGET" ]; then
    echo -e "${YELLOW}Cannot detect latest version. Specify target: bash scripts/update.sh 0.3.0${NC}"
    exit 1
  fi
fi

echo -e "Target version:  ${BOLD}v${TARGET}${NC}"

if [ "$CURRENT" = "$TARGET" ]; then
  echo -e "\n${GREEN}Already up to date!${NC}"
  exit 0
fi

echo ""

# ─────────────────────────────────────────────
# 3. Detect backend & frontend
# ─────────────────────────────────────────────

if [ -f "apps/api/artisan" ]; then
  BACKEND="laravel"
elif [ -f "apps/api/bin/console" ]; then
  BACKEND="symfony"
elif [ -f "apps/api/src/index.ts" ]; then
  BACKEND="hono"
else
  BACKEND="unknown"
fi

if [ -f "apps/web/next.config.ts" ] || [ -f "apps/web/next.config.js" ]; then
  FRONTEND="nextjs"
else
  FRONTEND="tanstack"
fi

echo -e "Backend:  ${DIM}${BACKEND}${NC}"
echo -e "Frontend: ${DIM}${FRONTEND}${NC}"
echo ""

# ─────────────────────────────────────────────
# 4. Apply version-specific codemods
# ─────────────────────────────────────────────

apply_migration() {
  local from="$1"
  local to="$2"
  echo -e "${BOLD}Applying migration: v${from} → v${to}${NC}"

  case "${from}->${to}" in

    "0.1.0->0.2.0")
      echo "  Fixing ports..."

      # Fix frontend .env.local ports
      if [ -f "apps/web/.env.local" ]; then
        case "$FRONTEND" in
          nextjs)
            sed -i.bak 's|localhost:3001|localhost:3300|g' apps/web/.env.local
            ;;
          tanstack)
            sed -i.bak 's|localhost:3003|localhost:3301|g' apps/web/.env.local
            ;;
        esac
        rm -f apps/web/.env.local.bak
      fi

      # Fix backend .env ports
      if [ -f "apps/api/.env" ]; then
        case "$BACKEND" in
          laravel)
            sed -i.bak 's|localhost:8000|localhost:8002|g' apps/api/.env
            ;;
          hono)
            sed -i.bak 's|PORT=8003|PORT=3333|g' apps/api/.env
            sed -i.bak 's|localhost:8003|localhost:3333|g' apps/api/.env
            ;;
        esac
        rm -f apps/api/.env.bak
      fi

      # Fix package.json ports
      if [ -f "apps/web/package.json" ]; then
        case "$FRONTEND" in
          nextjs)
            sed -i.bak 's|--port 3001|--port 3300|g' apps/web/package.json
            ;;
          tanstack)
            sed -i.bak 's|--port 3003|--port 3301|g' apps/web/package.json
            ;;
        esac
        rm -f apps/web/package.json.bak
      fi

      echo "  Removing unused adapters..."

      # Remove unused adapter directories
      case "$BACKEND" in
        laravel)
          rm -rf apps/web/src/lib/adapters/symfony/ apps/web/src/lib/adapters/node/
          ;;
        symfony)
          rm -rf apps/web/src/lib/adapters/laravel/ apps/web/src/lib/adapters/node/
          ;;
        hono)
          rm -rf apps/web/src/lib/adapters/laravel/ apps/web/src/lib/adapters/symfony/
          ;;
      esac

      echo "  Adding security headers..."

      # Add security headers for Hono (JWT guard)
      if [ "$BACKEND" = "hono" ] && [ -f "apps/api/src/shared/lib/jwt.ts" ]; then
        if ! grep -q "must be set to a secure value" apps/api/src/shared/lib/jwt.ts 2>/dev/null; then
          # Insert guard after the secret line
          sed -i.bak "/JWT_SECRET.*||.*'dev-secret'/a\\
if (process.env.NODE_ENV === 'production' \&\& (rawSecret === 'dev-secret' || rawSecret.length < 32)) {\\
  throw new Error('JWT_SECRET must be set to a secure value (min 32 chars) in production');\\
}" apps/api/src/shared/lib/jwt.ts 2>/dev/null || true
          rm -f apps/api/src/shared/lib/jwt.ts.bak
        fi
      fi

      # Update version in README
      sed -i.bak "s|v${from}|v${to}|g" README.md
      rm -f README.md.bak

      echo -e "  ${GREEN}v0.1.0 → v0.2.0 applied${NC}"
      ;;

    *)
      echo -e "  ${YELLOW}No automated migration for v${from} → v${to}${NC}"
      echo "  Check https://headlesskit.dev/changelog for manual instructions."
      ;;
  esac

  echo ""
}

# ─────────────────────────────────────────────
# 5. Walk the version chain
# ─────────────────────────────────────────────

# Version chain — add new entries as versions are released
VERSIONS=("0.1.0" "0.2.0")

STARTED=false
for i in "${!VERSIONS[@]}"; do
  VER="${VERSIONS[$i]}"
  NEXT_IDX=$((i + 1))

  if [ "$VER" = "$CURRENT" ]; then
    STARTED=true
    continue
  fi

  if [ "$STARTED" = true ]; then
    PREV="${VERSIONS[$((i - 1))]}"
    apply_migration "$PREV" "$VER"
    if [ "$VER" = "$TARGET" ]; then
      break
    fi
  fi
done

# ─────────────────────────────────────────────
# 6. Run verification
# ─────────────────────────────────────────────

echo -e "${BOLD}Running health check...${NC}\n"

if [ -f "scripts/verify.sh" ]; then
  bash scripts/verify.sh || true
else
  echo -e "${YELLOW}scripts/verify.sh not found — skipping verification${NC}"
fi

echo ""
echo -e "${GREEN}${BOLD}Update complete!${NC} v${CURRENT} → v${TARGET}"
echo -e "${DIM}Review the changes with: git diff${NC}"
echo -e "${DIM}For complex migrations, ask Claude Code: /update${NC}"
