#!/usr/bin/env bash
# Vague 1 — Structure-only verification of a scaffolded project.
# Usage: bash verify-structure.sh <project-dir> <preset>
# Exit 0 if all checks pass, 1 otherwise. Prints "✗" lines per failure.

set -u

DIR="${1:?missing project dir}"
PRESET="${2:?missing preset}"

C_RED=$'\033[31m'
C_GREEN=$'\033[32m'
C_DIM=$'\033[2m'
C_RESET=$'\033[0m'

fails=0
fail() { echo "  ${C_RED}✗${C_RESET} $1"; fails=$((fails+1)); }
ok()   { echo "  ${C_GREEN}✓${C_RESET} ${C_DIM}$1${C_RESET}"; }

# 1. Core structure
[ -f "$DIR/apps/web/package.json" ] && ok "apps/web/package.json" || fail "apps/web/package.json missing"
[ -d "$DIR/apps/api" ]              && ok "apps/api/"            || fail "apps/api/ missing"
[ -f "$DIR/Makefile" ]               && ok "root Makefile"        || fail "Makefile missing"

# 2. No leaked monorepo refs
if grep -q 'workspace:' "$DIR/apps/web/package.json" 2>/dev/null; then
  fail "workspace:* refs in apps/web/package.json"
else
  ok "no workspace:* refs"
fi

if grep -rqE '@headless/(types|config)' "$DIR/apps/web/src/" 2>/dev/null; then
  fail "@headless/* imports in apps/web/src/"
else
  ok "no @headless/* imports"
fi

if grep -rqE '\{\{[A-Z_]+\}\}' "$DIR/apps/web/src/" 2>/dev/null; then
  fail "unreplaced {{VARS}} in apps/web/src/"
else
  ok "no unreplaced {{VARS}}"
fi

# 3. CSS 4-file convention (theme/utilities/animations + entry)
WEB_STYLES="$DIR/apps/web/src/styles"
for f in theme.css utilities.css animations.css; do
  [ -f "$WEB_STYLES/$f" ] && ok "styles/$f" || fail "styles/$f missing"
done

# 4. Preset assets
if [ "$PRESET" != "none" ]; then
  [ -f "$DIR/apps/web/components.json" ] \
    && ok "components.json" || fail "components.json missing (preset=$PRESET)"
  [ -f "$DIR/apps/web/src/components/ui/button.tsx" ] \
    && ok "button.tsx" || fail "button.tsx missing (preset=$PRESET)"
fi

# 5. Docker (assumes docker=true in Vague 1)
[ -f "$DIR/compose.yml" ]      && ok "compose.yml"      || fail "compose.yml missing"
[ -f "$DIR/compose.prod.yml" ] && ok "compose.prod.yml" || fail "compose.prod.yml missing"
[ -f "$DIR/apps/api/Dockerfile" ] \
  && ok "apps/api/Dockerfile" || fail "apps/api/Dockerfile missing"
ENTRY="$DIR/apps/api/docker/entrypoint.sh"
if [ -f "$ENTRY" ] && [ -x "$ENTRY" ]; then
  ok "docker/entrypoint.sh (exec)"
else
  fail "docker/entrypoint.sh missing or not executable"
fi

# 6. Generated Makefile has Docker section (since docker=true)
if grep -q '^docker-up:' "$DIR/Makefile" 2>/dev/null; then
  ok "Makefile has docker-* targets"
else
  fail "Makefile missing docker-* targets"
fi

# 7. CSS conventions linter (run on the scaffolded project, not the monorepo)
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if [ -x "$ROOT/scripts/check-css-conventions.sh" ]; then
  if (cd "$DIR" && bash "$ROOT/scripts/check-css-conventions.sh") >/dev/null 2>&1; then
    ok "check-css-conventions: 0 violation"
  else
    fail "check-css-conventions reports violations"
  fi
fi

if [ "$fails" -eq 0 ]; then
  echo "  ${C_GREEN}└─ passed${C_RESET}"
  exit 0
else
  echo "  ${C_RED}└─ FAILED ($fails issue(s))${C_RESET}"
  exit 1
fi
