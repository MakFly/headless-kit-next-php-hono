#!/usr/bin/env bash
# CSS conventions linter for the headless-kit monorepo.
#
# Rejects violations of the 4-file CSS architecture documented in:
#   - apps/web/.claude/rules/css-architecture.md
#   - apps/web-tanstack/.claude/rules/css-architecture.md
#
# Default scope: live apps only (apps/web/src, apps/web-tanstack/src).
# Pass `--all` to also scan packages/create-headless-app/templates/{frontend,presets}/
# (CI will switch to --all after Wave C of the CSS refactor migrates the templates.)
#
# Usage:
#   bash scripts/check-css-conventions.sh           # live apps only
#   bash scripts/check-css-conventions.sh --all     # live apps + CLI templates
# Exit:
#   0 — no violation
#   1 — at least one violation (printed as `path:line: message`)

set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
violations=0
include_templates=0

for arg in "$@"; do
  case "$arg" in
    --all|--templates) include_templates=1 ;;
    *) echo "Unknown flag: $arg" >&2; exit 2 ;;
  esac
done

SEARCH_ROOTS=(
  "$ROOT/apps/web/src"
  "$ROOT/apps/web-tanstack/src"
)
if [ "$include_templates" -eq 1 ]; then
  SEARCH_ROOTS+=(
    "$ROOT/packages/create-headless-app/templates/frontend"
    "$ROOT/packages/create-headless-app/templates/presets"
  )
fi

mapfile -t CSS_FILES < <(
  for root in "${SEARCH_ROOTS[@]}"; do
    [ -d "$root" ] && find "$root" -type f -name "*.css" 2>/dev/null
  done
)

if [ ${#CSS_FILES[@]} -eq 0 ]; then
  echo "check-css-conventions: no .css files found in monitored paths."
  exit 0
fi

# scan_pattern <file> <regex> — emits "lineno:content" for every line matching
# regex, with CSS block comments (/* ... */, single or multi-line) stripped out.
# This avoids false positives on rule descriptions inside header comments.
scan_pattern() {
  local file="$1" pattern="$2"
  awk -v pat="$pattern" '
    {
      raw = $0
      stripped = ""
      i = 1
      n = length(raw)
      while (i <= n) {
        if (in_block) {
          end = index(substr(raw, i), "*/")
          if (end == 0) { i = n + 1 }
          else { in_block = 0; i = i + end + 1 }
        } else {
          start = index(substr(raw, i), "/*")
          if (start == 0) {
            stripped = stripped substr(raw, i)
            i = n + 1
          } else {
            stripped = stripped substr(raw, i, start - 1)
            i = i + start + 1
            in_block = 1
          }
        }
      }
      if (stripped ~ pat) print NR ":" stripped
    }
  ' "$file"
}

report() {
  echo "$1"
  violations=$((violations + 1))
}

for f in "${CSS_FILES[@]}"; do
  rel="${f#$ROOT/}"
  base="$(basename "$f")"

  if [ "$base" != "theme.css" ]; then
    while IFS=: read -r line _; do
      [ -n "$line" ] && report "$rel:$line: hardcoded oklch() — move the color to theme.css and reference via var(--token)"
    done < <(scan_pattern "$f" 'oklch\\(' 2>/dev/null || true)
  fi

  if [ "$base" != "globals.css" ] && [ "$base" != "styles.css" ]; then
    while IFS=: read -r line _; do
      [ -n "$line" ] && report "$rel:$line: @theme outside entry file — only globals.css / styles.css may declare @theme inline"
    done < <(scan_pattern "$f" '@theme' 2>/dev/null || true)
  fi

  if [ "$base" != "animations.css" ]; then
    while IFS=: read -r line _; do
      [ -n "$line" ] && report "$rel:$line: @keyframes outside animations.css — move it (and its .animate-* utility) to animations.css"
    done < <(scan_pattern "$f" '@keyframes' 2>/dev/null || true)
  fi

  while IFS=: read -r line _; do
    [ -n "$line" ] && report "$rel:$line: Tailwind v3 directive — migrate to @import '"'"'tailwindcss'"'"' (v4)"
  done < <(scan_pattern "$f" '^[[:space:]]*@tailwind[[:space:]]+(base|components|utilities)' 2>/dev/null || true)
done

# TS/TSX checks (live apps only).
TSX_ROOTS=(
  "$ROOT/apps/web/src"
  "$ROOT/apps/web-tanstack/src"
)
for root in "${TSX_ROOTS[@]}"; do
  [ -d "$root" ] || continue

  while IFS=: read -r file line _; do
    [ -n "$file" ] && report "${file#$ROOT/}:$line: .module.css import — use Tailwind utilities or extract a shared utility class"
  done < <(grep -rnE "from\s+['\"][^'\"]*\.module\.css['\"]" "$root" --include='*.ts' --include='*.tsx' 2>/dev/null || true)

  while IFS=: read -r file line _; do
    [ -n "$file" ] && report "${file#$ROOT/}:$line: styled-components import — banned, use Tailwind"
  done < <(grep -rnE "from\s+['\"]styled-components['\"]" "$root" --include='*.ts' --include='*.tsx' 2>/dev/null || true)

  while IFS=: read -r file line _; do
    [ -n "$file" ] && report "${file#$ROOT/}:$line: <style jsx> block — banned, use Tailwind"
  done < <(grep -rnE "<style[^>]*\bjsx\b" "$root" --include='*.tsx' 2>/dev/null || true)
done

if [ "$violations" -gt 0 ]; then
  echo
  echo "check-css-conventions: $violations violation(s) found."
  echo "See apps/web/.claude/rules/css-architecture.md for the convention."
  exit 1
fi

echo "check-css-conventions: OK (${#CSS_FILES[@]} CSS files scanned, 0 violation)."
exit 0
