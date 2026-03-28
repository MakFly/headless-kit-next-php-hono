#!/usr/bin/env bash
# Headless Kit — Project Health Verification
# Run after scaffolding or updating to verify everything works.
# Usage: bash scripts/verify.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

pass() { echo -e "  ${GREEN}PASS${NC} $1"; ((PASS++)); }
fail() { echo -e "  ${RED}FAIL${NC} $1"; ((FAIL++)); }
warn() { echo -e "  ${YELLOW}WARN${NC} $1"; ((WARN++)); }
section() { echo -e "\n${BOLD}$1${NC}"; }

# Detect project root (script is in scripts/)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Read version from README
VERSION=$(grep -oP 'v\K[0-9]+\.[0-9]+\.[0-9]+' README.md 2>/dev/null | head -1 || echo "unknown")
echo -e "${BOLD}Headless Kit Health Check${NC} ${DIM}(v${VERSION})${NC}\n"

# ─────────────────────────────────────────────
section "1. Project Structure"
# ─────────────────────────────────────────────

[ -d "apps/web" ] && pass "apps/web/ exists" || fail "apps/web/ missing"
[ -d "apps/api" ] && pass "apps/api/ exists" || fail "apps/api/ missing"
[ -f "turbo.json" ] && pass "turbo.json exists" || fail "turbo.json missing"
[ -f "package.json" ] && pass "root package.json exists" || fail "root package.json missing"
[ -f "apps/web/package.json" ] && pass "frontend package.json exists" || fail "frontend package.json missing"

# ─────────────────────────────────────────────
section "2. Environment Files"
# ─────────────────────────────────────────────

if [ -f "apps/web/.env.local" ]; then
  pass "apps/web/.env.local exists"
  # Check for placeholder values that should be replaced
  if grep -q 'change-me\|change_me\|xxx\|your-secret' apps/web/.env.local 2>/dev/null; then
    warn "apps/web/.env.local contains placeholder secrets"
  fi
else
  fail "apps/web/.env.local missing"
fi

if [ -f "apps/api/.env" ]; then
  pass "apps/api/.env exists"
else
  fail "apps/api/.env missing"
fi

# ─────────────────────────────────────────────
section "3. Dependencies"
# ─────────────────────────────────────────────

if [ -d "node_modules" ]; then
  pass "node_modules/ installed"
else
  warn "node_modules/ not installed — run 'bun install'"
fi

# Check frontend deps
if [ -f "apps/web/node_modules/.package-lock.json" ] || [ -d "node_modules/@tanstack" ] || [ -d "node_modules/next" ]; then
  pass "frontend deps available"
else
  warn "frontend deps may not be installed"
fi

# ─────────────────────────────────────────────
section "4. Template Variables"
# ─────────────────────────────────────────────

# Check for unreplaced template variables in source files
TVAR_PATTERN='\{\{[A-Z_]*\}\}'
UNREPLACED=$(grep -rl "$TVAR_PATTERN" apps/web/src/ apps/api/src/ 2>/dev/null | grep -v node_modules | grep -v '.md$' || true)
if [ -z "$UNREPLACED" ]; then
  pass "no unreplaced template variables in source files"
else
  fail "unreplaced template vars found in: $(echo "$UNREPLACED" | tr '\n' ' ')"
fi

# ─────────────────────────────────────────────
section "5. Backend Detection"
# ─────────────────────────────────────────────

# Detect backend type
if [ -f "apps/api/artisan" ]; then
  BACKEND="laravel"
  pass "backend detected: Laravel"
elif [ -f "apps/api/bin/console" ]; then
  BACKEND="symfony"
  pass "backend detected: Symfony"
elif [ -f "apps/api/src/index.ts" ]; then
  BACKEND="hono"
  pass "backend detected: Hono"
else
  BACKEND="unknown"
  fail "cannot detect backend type"
fi

# ─────────────────────────────────────────────
section "6. Adapter Cleanup"
# ─────────────────────────────────────────────

ADAPTERS_DIR="apps/web/src/lib/adapters"
if [ -d "$ADAPTERS_DIR" ]; then
  ADAPTER_COUNT=$(ls -d "$ADAPTERS_DIR"/laravel "$ADAPTERS_DIR"/symfony "$ADAPTERS_DIR"/node 2>/dev/null | wc -l | tr -d ' ')
  if [ "$ADAPTER_COUNT" -le 1 ]; then
    pass "only 1 backend adapter present (clean)"
  else
    warn "$ADAPTER_COUNT backend adapters present — unused ones should be removed"
  fi
else
  warn "adapters directory not found"
fi

# Check for @headless/ or workspace:* references
WORKSPACE_REFS=$(grep -rl 'workspace:\|@headless/' apps/ 2>/dev/null | grep -v node_modules | grep -v '.lock$' || true)
if [ -z "$WORKSPACE_REFS" ]; then
  pass "no workspace:* or @headless/ references"
else
  fail "monorepo references found in: $(echo "$WORKSPACE_REFS" | tr '\n' ' ')"
fi

# ─────────────────────────────────────────────
section "7. Port Consistency"
# ─────────────────────────────────────────────

# Extract ports from env files
if [ -f "apps/web/.env.local" ]; then
  FRONTEND_PORT=$(grep -oP 'localhost:\K[0-9]+' apps/web/.env.local | head -1 || echo "?")
  BACKEND_PORT=$(grep -oP '(LARAVEL_API_URL|SYMFONY_API_URL|NODE_API_URL)=http://localhost:\K[0-9]+' apps/web/.env.local || echo "?")
  pass "frontend port: $FRONTEND_PORT"
  [ -n "$BACKEND_PORT" ] && pass "backend port: $BACKEND_PORT" || warn "backend port not found in .env.local"
fi

# Check package.json port matches
if [ -f "apps/web/package.json" ]; then
  PKG_PORT=$(grep -oP 'port \K[0-9]+' apps/web/package.json | head -1 || echo "?")
  if [ "$PKG_PORT" = "$FRONTEND_PORT" ]; then
    pass "package.json port matches .env.local ($PKG_PORT)"
  elif [ "$PKG_PORT" != "?" ]; then
    fail "package.json port ($PKG_PORT) != .env.local port ($FRONTEND_PORT)"
  fi
fi

# ─────────────────────────────────────────────
section "8. Backend Health"
# ─────────────────────────────────────────────

case "$BACKEND" in
  laravel)
    if [ -f "apps/api/vendor/autoload.php" ]; then
      pass "composer dependencies installed"
    else
      warn "composer dependencies not installed — run 'cd apps/api && composer install'"
    fi
    if [ -f "apps/api/database/database.sqlite" ] || [ -f "apps/api/database/data.db" ]; then
      pass "SQLite database file exists"
    else
      warn "database not initialized — run 'cd apps/api && php artisan migrate'"
    fi
    ;;
  symfony)
    if [ -f "apps/api/vendor/autoload.php" ]; then
      pass "composer dependencies installed"
    else
      warn "composer dependencies not installed — run 'cd apps/api && composer install'"
    fi
    ;;
  hono)
    if [ -f "apps/api/package.json" ]; then
      pass "Hono package.json present"
    fi
    ;;
esac

# ─────────────────────────────────────────────
section "9. TypeScript Compilation"
# ─────────────────────────────────────────────

if command -v bunx &> /dev/null && [ -d "node_modules" ]; then
  if (cd apps/web && bunx tsc --noEmit 2>/dev/null); then
    pass "frontend TypeScript compiles"
  else
    fail "frontend TypeScript compilation errors"
  fi
else
  warn "skipped TypeScript check (bun not available or deps not installed)"
fi

# ─────────────────────────────────────────────
section "10. Backend Tests"
# ─────────────────────────────────────────────

case "$BACKEND" in
  laravel)
    if [ -f "apps/api/vendor/autoload.php" ]; then
      if (cd apps/api && php artisan test --no-interaction 2>/dev/null); then
        pass "Laravel tests pass"
      else
        fail "Laravel tests failing"
      fi
    else
      warn "skipped Laravel tests (deps not installed)"
    fi
    ;;
  symfony)
    if [ -f "apps/api/vendor/autoload.php" ]; then
      if (cd apps/api && php bin/phpunit 2>/dev/null); then
        pass "Symfony tests pass"
      else
        fail "Symfony tests failing"
      fi
    else
      warn "skipped Symfony tests (deps not installed)"
    fi
    ;;
  hono)
    if [ -d "node_modules" ]; then
      if (cd apps/api && bun test 2>/dev/null); then
        pass "Hono tests pass"
      else
        fail "Hono tests failing"
      fi
    else
      warn "skipped Hono tests (deps not installed)"
    fi
    ;;
esac

# ─────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}$PASS passed${NC}  ${YELLOW}$WARN warnings${NC}  ${RED}$FAIL failed${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$FAIL" -gt 0 ]; then
  echo -e "\n${RED}Project has $FAIL issue(s) that need fixing.${NC}"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo -e "\n${YELLOW}Project is functional but has $WARN warning(s).${NC}"
  exit 0
else
  echo -e "\n${GREEN}Project is healthy!${NC}"
  exit 0
fi
