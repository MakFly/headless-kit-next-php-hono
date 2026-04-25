#!/usr/bin/env bash
# Scaffold every combo from a matrix file and verify each one.
# Usage: bash scripts/test-all-scaffolds.sh [wave1|...]    (default: wave1)
#        bash scripts/test-all-scaffolds.sh wave1 --keep   (don't cleanup)

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WAVE="${1:-wave1}"
KEEP=0
[[ "${2:-}" == "--keep" ]] && KEEP=1

MATRIX="$ROOT/scripts/matrices/${WAVE}-smoke.txt"
VERIFY="$ROOT/scripts/lib/verify-structure.sh"
[ -f "$MATRIX" ] || { echo "Matrix not found: $MATRIX" >&2; exit 2; }
[ -f "$VERIFY" ] || { echo "Verifier not found: $VERIFY" >&2; exit 2; }

C_BOLD=$'\033[1m'
C_DIM=$'\033[2m'
C_CYAN=$'\033[36m'
C_RED=$'\033[31m'
C_GREEN=$'\033[32m'
C_RESET=$'\033[0m'

TS=$(date +%Y%m%d-%H%M%S)
WORK="$ROOT/install-test/matrix-$TS"
REPORT="$WORK/REPORT.md"
mkdir -p "$WORK"

echo ""
echo "${C_BOLD}${C_CYAN}━━━ Matrix test — $WAVE ━━━${C_RESET}"
echo "${C_DIM}Workdir: $WORK${C_RESET}"
echo ""

# Build CLI once
echo "${C_CYAN}► Building CLI...${C_RESET}"
(cd "$ROOT/packages/create-headless-app" && bun run build >/dev/null 2>&1) \
  || { echo "${C_RED}CLI build failed${C_RESET}"; exit 1; }
echo "  ${C_GREEN}✓${C_RESET} built"
echo ""

CLI_DIST="$ROOT/packages/create-headless-app/dist/scaffold.js"

passed=0
failed=0
declare -a results

while IFS= read -r line <&3; do
  # Skip blank lines and comments
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  read -r backend frontend preset <<< "$line"
  name="t-${backend}-${frontend}-${preset}"
  proj="$WORK/$name"

  echo "${C_BOLD}┌ $backend × $frontend × $preset${C_RESET} ${C_DIM}→ $name${C_RESET}"

  # Scaffold via programmatic API
  if ! (cd "$WORK" && node </dev/null -e "
    const { scaffold } = await import('$CLI_DIST');
    await scaffold({
      projectName: '$name',
      backend: '$backend',
      frontend: '$frontend',
      modules: [],
      database: 'sqlite',
      preset: '$preset',
      docker: true,
    });
  " >"$proj.scaffold.log" 2>&1); then
    echo "  ${C_RED}✗ scaffold failed (see $proj.scaffold.log)${C_RESET}"
    results+=("| $backend × $frontend × $preset | ✗ | scaffold failed |")
    failed=$((failed+1))
    continue
  fi

  if bash "$VERIFY" "$proj" "$preset"; then
    results+=("| $backend × $frontend × $preset | ✓ | — |")
    passed=$((passed+1))
  else
    results+=("| $backend × $frontend × $preset | ✗ | structure check failed |")
    failed=$((failed+1))
  fi
  echo ""
done 3< "$MATRIX"

# Report
{
  echo "# Matrix Test Report — $WAVE"
  echo ""
  echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "Workdir: \`$WORK\`"
  echo ""
  echo "## Summary"
  echo ""
  echo "- Passed: **$passed**"
  echo "- Failed: **$failed**"
  echo "- Total:  **$((passed+failed))**"
  echo ""
  echo "## Results"
  echo ""
  echo "| Combo | Status | Notes |"
  echo "|---|---|---|"
  printf '%s\n' "${results[@]}"
} > "$REPORT"

echo "${C_BOLD}━━━ Result: $passed/$((passed+failed)) passed ━━━${C_RESET}"
echo "${C_DIM}Report: $REPORT${C_RESET}"

if [ $KEEP -eq 0 ] && [ $failed -eq 0 ]; then
  echo "${C_DIM}Cleaning up scaffolded projects (use --keep to preserve)...${C_RESET}"
  # Remove project dirs but keep REPORT.md and *.log
  find "$WORK" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +
fi

[ $failed -eq 0 ] && exit 0 || exit 1
