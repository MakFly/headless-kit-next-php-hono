#!/usr/bin/env bash
# BFF Proxy Smoke Test
# Usage: ./scripts/bff-smoke-test.sh [base_url]
# Default: http://localhost:3300

set -euo pipefail

BASE="${1:-http://localhost:3300}"
PASS=0
FAIL=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  ✓ $name"
    ((PASS++))
  else
    echo "  ✗ $name (expected $expected, got $actual)"
    ((FAIL++))
  fi
}

echo "BFF Smoke Test — $BASE"
echo "================================"

# 1. Health check
echo ""
echo "1. Health check"
STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/health")
check "GET /api/health → 200" "200" "$STATUS"

# 2. Streaming response (shop products)
echo ""
echo "2. Streaming (shop products)"
STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/v1/shop/products")
check "GET /api/v1/shop/products → 200" "200" "$STATUS"

# 3. Request ID propagation
echo ""
echo "3. Request ID"
REQ_ID=$(curl -s -D - -o /dev/null "$BASE/api/health" | grep -i 'x-request-id' | head -1 | tr -d '\r')
if [ -n "$REQ_ID" ]; then
  echo "  ✓ x-request-id present: $REQ_ID"
  ((PASS++))
else
  echo "  ✗ x-request-id missing"
  ((FAIL++))
fi

# 4. Body too large (413)
echo ""
echo "4. Body size limit"
LARGE_BODY=$(python3 -c "print('{\"x\":\"' + 'A'*1100000 + '\"}')")
STATUS=$(echo "$LARGE_BODY" | curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d @- "$BASE/api/v1/auth/login")
check "POST 1.1MB body → 413" "413" "$STATUS"

# 5. Unsupported media type (415)
echo ""
echo "5. Content-type enforcement"
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: text/plain' -d 'hello' "$BASE/api/v1/auth/login")
check "POST text/plain → 415" "415" "$STATUS"

# 6. Path traversal blocked (400)
echo ""
echo "6. Path validation"
STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/v1/../../../etc/passwd")
check "GET path traversal → 400" "400" "$STATUS"

# 7. Auth without token (401)
echo ""
echo "7. Auth required"
STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/v1/auth/me")
check "GET /auth/me without token → 401" "401" "$STATUS"

# 8. Rate limiting (429) — send 21 requests fast
echo ""
echo "8. Rate limiting"
for i in $(seq 1 20); do
  curl -s -o /dev/null -X POST -H 'Content-Type: application/json' -d '{"email":"test@test.com","password":"wrong"}' "$BASE/api/v1/auth/login" &
done
wait
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{"email":"test@test.com","password":"wrong"}' "$BASE/api/v1/auth/login")
check "21st auth request → 429" "429" "$STATUS"

# Summary
echo ""
echo "================================"
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
