#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-http://localhost:3000}"

check() {
  local method="$1" path="$2" expect="$3"
  local code
  code=$(curl -s -o /tmp/gitshow-verify-body.json -w '%{http_code}' -X "$method" "$BASE$path")
  if [[ "$code" != "$expect" ]]; then
    echo "FAIL $method $path expected $expect got $code"
    cat /tmp/gitshow-verify-body.json
    exit 1
  fi
  echo "OK   $method $path -> $code"
}

check POST /api/refresh 200
sleep 1
check GET /api/health 200
check GET /api/settings 200
check GET /api/admin/settings 200
check GET /api/repos 200
check GET /api/heatmap 200
check GET /api/stats 200
check GET /api/stars-history 200
check GET /api/following 200
check GET /api/feed 200
check GET /api/activity 200
check GET /rss 404

code=$(curl -s -o /tmp/gitshow-verify-body.json -w '%{http_code}' -X POST "$BASE/api/admin/login" \
  -H 'Content-Type: application/json' -d '{"password":""}')
if [[ "$code" != "200" ]]; then
  echo "FAIL POST /api/admin/login expected 200 got $code"
  cat /tmp/gitshow-verify-body.json
  exit 1
fi
echo "OK   POST /api/admin/login -> $code"

echo "All API smoke checks passed."
