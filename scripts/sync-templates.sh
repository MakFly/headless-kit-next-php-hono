#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# Headless Kit — Sync monorepo apps → CLI templates
# ─────────────────────────────────────────────────────────────────────
#
# Usage:
#   bash scripts/sync-templates.sh              # full sync (dry-run)
#   bash scripts/sync-templates.sh --apply      # full sync (apply changes)
#   bash scripts/sync-templates.sh --check      # CI mode: exit 1 if drift
#   bash scripts/sync-templates.sh --diff       # show diffs only
#
# What it does:
#   Copies source files from apps/ to packages/create-headless-app/templates/
#   applying template variable substitutions where needed.
#
# Design:
#   apps/ = source of truth (you develop here)
#   templates/ = distribution copy (synced from apps/)
#   The script handles 5 rules:
#     Rule 1 — 1:1 copy (most files)
#     Rule 2 — template var substitution (package.json, index.ts, etc.)
#     Rule 3 — excluded files (CLAUDE.md, data.db, node_modules, etc.)
#     Rule 4 — template-only files (simpler middleware, flat routes)
#     Rule 5 — back-port monorepo improvements
# ─────────────────────────────────────────────────────────────────────

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATES="$ROOT/packages/create-headless-app/templates"
MODE="${1:---dry-run}"

SYNCED=0
SKIPPED=0
DRIFTED=0
SUBSTITUTED=0

# ─────────────────────────────────────────────
# Rule 3 — Excluded patterns (never sync)
# ─────────────────────────────────────────────

EXCLUDE_PATTERNS=(
  "CLAUDE.md"
  ".claude/"
  "node_modules/"
  "vendor/"
  "data.db"
  "drizzle/"
  ".phpunit.cache/"
  "var/"
  ".turbo/"
  ".next/"
  "dist/"
  "*.lock"          # composer.lock, bun.lockb — templates ship their own
  "tsconfig.tsbuildinfo"
  "next-env.d.ts"
  ".env"            # generated per project, not synced
  ".env.test"
  ".env.local"
)

# Rule 4 — Template-only files (never overwrite from monorepo)
TEMPLATE_ONLY=(
  "src/middleware.ts"
  "src/app/auth/"
  "src/app/dashboard/page.tsx"
)

should_exclude() {
  local file="$1"
  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    case "$file" in
      *"$pattern"*) return 0 ;;
    esac
  done
  return 1
}

is_template_only() {
  local file="$1"
  for pattern in "${TEMPLATE_ONLY[@]}"; do
    case "$file" in
      *"$pattern"*) return 0 ;;
    esac
  done
  return 1
}

# ─────────────────────────────────────────────
# Rule 2 — Template variable substitutions
# ─────────────────────────────────────────────

apply_substitutions() {
  local content="$1"
  local app_type="$2"  # backend-hono, backend-laravel, backend-symfony, frontend-nextjs, frontend-tanstack

  case "$app_type" in
    backend-hono)
      content="${content//@headless\/api-hono/\{\{PROJECT_NAME\}\}-api}"
      content="${content//\"3333\"/\"{{API_PORT}}\"}"
      content="${content//\'3333\'/\'{{API_PORT}}\'}"
      content="${content//localhost:3301/localhost:{{FRONTEND_PORT}}}"
      content="${content//localhost:3300/localhost:{{FRONTEND_PORT}}}"
      ;;
    backend-laravel)
      content="${content//@headless\/api-laravel/\{\{PROJECT_NAME\}\}-api}"
      content="${content//localhost:8002/localhost:{{API_PORT}}}"
      content="${content//localhost:3300/localhost:{{FRONTEND_PORT}}}"
      content="${content//localhost:3301/localhost:{{FRONTEND_PORT}}}"
      ;;
    backend-symfony)
      content="${content//localhost:8001/localhost:{{API_PORT}}}"
      content="${content//localhost:3300/localhost:{{FRONTEND_PORT}}}"
      content="${content//localhost:3301/localhost:{{FRONTEND_PORT}}}"
      ;;
    frontend-nextjs)
      content="${content//@headless\/web/@\{\{PROJECT_NAME\}\}\/web}"
      content="${content//--port 3300/--port {{FRONTEND_PORT}}}"
      content="${content//-p 3300/-p {{FRONTEND_PORT}}}"
      ;;
    frontend-tanstack)
      content="${content//--port 3301/--port {{FRONTEND_PORT}}}"
      content="${content//-p 3301/-p {{FRONTEND_PORT}}}"
      ;;
  esac

  echo "$content"
}

needs_substitution() {
  local file="$1"
  case "$file" in
    */package.json) return 0 ;;
    */src/index.ts) return 0 ;;
    */.env*) return 0 ;;
  esac
  return 1
}

# ─────────────────────────────────────────────
# Sync function
# ─────────────────────────────────────────────

sync_file() {
  local src="$1"
  local dst="$2"
  local app_type="$3"
  local rel_src="${src#$ROOT/}"

  if should_exclude "$rel_src"; then
    SKIPPED=$((SKIPPED + 1))
    return
  fi

  if is_template_only "$rel_src"; then
    SKIPPED=$((SKIPPED + 1))
    return
  fi

  if [ ! -f "$src" ]; then
    return
  fi

  # Check if substitution needed
  if needs_substitution "$src"; then
    local src_content
    src_content=$(cat "$src")
    local expected
    expected=$(apply_substitutions "$src_content" "$app_type")

    if [ -f "$dst" ]; then
      local dst_content
      dst_content=$(cat "$dst")
      if [ "$expected" = "$dst_content" ]; then
        SYNCED=$((SYNCED + 1))
        return
      fi
    fi

    DRIFTED=$((DRIFTED + 1))
    SUBSTITUTED=$((SUBSTITUTED + 1))
    echo -e "  ${YELLOW}DRIFT${NC} (subst) $rel_src"

    if [ "$MODE" = "--diff" ]; then
      diff <(echo "$expected") "$dst" 2>/dev/null | head -20 || true
      echo ""
    fi

    if [ "$MODE" = "--apply" ]; then
      mkdir -p "$(dirname "$dst")"
      echo "$expected" > "$dst"
      echo -e "  ${GREEN}FIXED${NC} $rel_src"
    fi
    return
  fi

  # Direct 1:1 compare
  if [ -f "$dst" ]; then
    if diff -q "$src" "$dst" > /dev/null 2>&1; then
      SYNCED=$((SYNCED + 1))
      return
    fi
  fi

  DRIFTED=$((DRIFTED + 1))
  echo -e "  ${YELLOW}DRIFT${NC} $rel_src"

  if [ "$MODE" = "--diff" ]; then
    diff "$src" "$dst" 2>/dev/null | head -20 || true
    echo ""
  fi

  if [ "$MODE" = "--apply" ]; then
    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
    echo -e "  ${GREEN}FIXED${NC} $rel_src"
  fi
}

sync_dir() {
  local src_dir="$1"
  local dst_dir="$2"
  local app_type="$3"

  if [ ! -d "$src_dir" ]; then
    return
  fi

  while IFS= read -r -d '' file; do
    local rel="${file#$src_dir/}"
    sync_file "$file" "$dst_dir/$rel" "$app_type"
  done < <(/usr/bin/find "$src_dir" -type f -print0 2>/dev/null)
}

# ─────────────────────────────────────────────
# Main sync
# ─────────────────────────────────────────────

echo -e "${BOLD}Headless Kit Template Sync${NC} ${DIM}(mode: $MODE)${NC}\n"

# Backend: Hono
echo -e "${BOLD}Backend: Hono${NC}"
sync_dir "$ROOT/apps/api-hono/src" "$TEMPLATES/backend/hono/src" "backend-hono"
sync_file "$ROOT/apps/api-hono/package.json" "$TEMPLATES/backend/hono/package.json" "backend-hono"
sync_file "$ROOT/apps/api-hono/tsconfig.json" "$TEMPLATES/backend/hono/tsconfig.json" "backend-hono"
sync_file "$ROOT/apps/api-hono/drizzle.config.ts" "$TEMPLATES/backend/hono/drizzle.config.ts" "backend-hono"
echo ""

# Backend: Laravel
echo -e "${BOLD}Backend: Laravel${NC}"
sync_dir "$ROOT/apps/api-laravel/app" "$TEMPLATES/backend/laravel/app" "backend-laravel"
sync_dir "$ROOT/apps/api-laravel/config" "$TEMPLATES/backend/laravel/config" "backend-laravel"
sync_dir "$ROOT/apps/api-laravel/database" "$TEMPLATES/backend/laravel/database" "backend-laravel"
sync_dir "$ROOT/apps/api-laravel/routes" "$TEMPLATES/backend/laravel/routes" "backend-laravel"
sync_dir "$ROOT/apps/api-laravel/tests" "$TEMPLATES/backend/laravel/tests" "backend-laravel"
sync_file "$ROOT/apps/api-laravel/composer.json" "$TEMPLATES/backend/laravel/composer.json" "backend-laravel"
sync_file "$ROOT/apps/api-laravel/phpunit.xml" "$TEMPLATES/backend/laravel/phpunit.xml" "backend-laravel"
echo ""

# Backend: Symfony
echo -e "${BOLD}Backend: Symfony${NC}"
sync_dir "$ROOT/apps/api-sf/src" "$TEMPLATES/backend/symfony/src" "backend-symfony"
sync_dir "$ROOT/apps/api-sf/config" "$TEMPLATES/backend/symfony/config" "backend-symfony"
sync_dir "$ROOT/apps/api-sf/migrations" "$TEMPLATES/backend/symfony/migrations" "backend-symfony"
sync_dir "$ROOT/apps/api-sf/tests" "$TEMPLATES/backend/symfony/tests" "backend-symfony"
sync_dir "$ROOT/apps/api-sf/translations" "$TEMPLATES/backend/symfony/translations" "backend-symfony"
sync_file "$ROOT/apps/api-sf/composer.json" "$TEMPLATES/backend/symfony/composer.json" "backend-symfony"
sync_file "$ROOT/apps/api-sf/phpunit.dist.xml" "$TEMPLATES/backend/symfony/phpunit.dist.xml" "backend-symfony"
echo ""

# Frontend: Next.js (base template — only core files, not preset/module content)
echo -e "${BOLD}Frontend: Next.js (base)${NC}"
sync_dir "$ROOT/apps/web/src/lib/actions/_shared" "$TEMPLATES/frontend/nextjs/src/lib/actions/_shared" "frontend-nextjs"
sync_dir "$ROOT/apps/web/src/lib/adapters" "$TEMPLATES/frontend/nextjs/src/lib/adapters" "frontend-nextjs"
sync_dir "$ROOT/apps/web/src/lib/auth" "$TEMPLATES/frontend/nextjs/src/lib/auth" "frontend-nextjs"
sync_dir "$ROOT/apps/web/src/lib/config" "$TEMPLATES/frontend/nextjs/src/lib/config" "frontend-nextjs"
sync_dir "$ROOT/apps/web/src/lib/http" "$TEMPLATES/frontend/nextjs/src/lib/http" "frontend-nextjs"
sync_dir "$ROOT/apps/web/src/lib/logger" "$TEMPLATES/frontend/nextjs/src/lib/logger" "frontend-nextjs"
sync_dir "$ROOT/apps/web/src/lib/security" "$TEMPLATES/frontend/nextjs/src/lib/security" "frontend-nextjs"
sync_dir "$ROOT/apps/web/src/lib/services" "$TEMPLATES/frontend/nextjs/src/lib/services" "frontend-nextjs"
sync_dir "$ROOT/apps/web/src/stores" "$TEMPLATES/frontend/nextjs/src/stores" "frontend-nextjs"
sync_dir "$ROOT/apps/web/src/types" "$TEMPLATES/frontend/nextjs/src/types" "frontend-nextjs"
sync_file "$ROOT/apps/web/package.json" "$TEMPLATES/frontend/nextjs/package.json" "frontend-nextjs"
echo ""

# Frontend: TanStack (base)
echo -e "${BOLD}Frontend: TanStack (base)${NC}"
sync_dir "$ROOT/apps/web-tanstack/src/lib" "$TEMPLATES/frontend/tanstack/src/lib" "frontend-tanstack"
sync_dir "$ROOT/apps/web-tanstack/src/stores" "$TEMPLATES/frontend/tanstack/src/stores" "frontend-tanstack"
sync_dir "$ROOT/apps/web-tanstack/src/types" "$TEMPLATES/frontend/tanstack/src/types" "frontend-tanstack"
sync_file "$ROOT/apps/web-tanstack/package.json" "$TEMPLATES/frontend/tanstack/package.json" "frontend-tanstack"
echo ""

# Module: support-chat (hono backend)
echo -e "${BOLD}Module: support-chat/backend/hono${NC}"
sync_dir "$ROOT/apps/api-hono/src/features/support" "$TEMPLATES/modules/support-chat/backend/hono/src/features/support" "backend-hono"
echo ""

# Module: ai-assistant
echo -e "${BOLD}Module: ai-assistant${NC}"
sync_dir "$ROOT/apps/web/src/components/assistant-ui" "$TEMPLATES/modules/ai-assistant/frontend/nextjs/src/components/assistant-ui" "frontend-nextjs"
sync_dir "$ROOT/apps/web/src/lib/ai" "$TEMPLATES/modules/ai-assistant/frontend/nextjs/src/lib/ai" "frontend-nextjs"
sync_dir "$ROOT/apps/web-tanstack/src/components/assistant-ui" "$TEMPLATES/modules/ai-assistant/frontend/tanstack/src/components/assistant-ui" "frontend-tanstack"
sync_dir "$ROOT/apps/web-tanstack/src/lib/ai" "$TEMPLATES/modules/ai-assistant/frontend/tanstack/src/lib/ai" "frontend-tanstack"
echo ""

# ─────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────

echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}$SYNCED in sync${NC}  ${YELLOW}$DRIFTED drifted${NC}  ${DIM}$SKIPPED skipped${NC}"
if [ "$SUBSTITUTED" -gt 0 ]; then
  echo -e "  ${DIM}($SUBSTITUTED with template var substitution)${NC}"
fi
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$MODE" = "--check" ] && [ "$DRIFTED" -gt 0 ]; then
  echo -e "\n${RED}$DRIFTED file(s) out of sync. Run: bash scripts/sync-templates.sh --apply${NC}"
  exit 1
fi

if [ "$MODE" = "--dry-run" ] && [ "$DRIFTED" -gt 0 ]; then
  echo -e "\n${YELLOW}$DRIFTED file(s) would be updated. Run with --apply to fix.${NC}"
fi

if [ "$DRIFTED" -eq 0 ]; then
  echo -e "\n${GREEN}All templates in sync!${NC}"
fi
