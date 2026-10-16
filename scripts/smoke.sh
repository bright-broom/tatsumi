#!/usr/bin/env bash
# 本番ビルド (.next) を起動して主要ルートと /api/contact を確認する。
# 事前に `npm run build` が必要。使い方: bash scripts/smoke.sh [port]
set -u
PORT="${1:-3111}"
BASE="http://localhost:${PORT}"
npx next start -p "$PORT" >/dev/null 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null' EXIT

for _ in $(seq 1 30); do
  curl -s -o /dev/null "$BASE/" && break
  sleep 1
done

fail=0
check() { # name expected actual
  if [ "$2" = "$3" ]; then echo "ok   $1 ($3)"; else echo "FAIL $1 expected=$2 actual=$3"; fail=1; fi
}
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

check "GET /"        200 "$(code "$BASE/")"
check "GET /news"    200 "$(code "$BASE/news")"
check "GET /privacy" 200 "$(code "$BASE/privacy")"
check "GET /nope"    404 "$(code "$BASE/nope")"

J='Content-Type: application/json'
check "contact valid"     200 "$(code -X POST "$BASE/api/contact" -H "$J" -d '{"name":"a","email":"a@b.jp","message":"hi","confirmed":true}')"
check "contact unchecked" 400 "$(code -X POST "$BASE/api/contact" -H "$J" -d '{"name":"a","email":"a@b.jp","message":"hi"}')"
check "contact honeypot"  400 "$(code -X POST "$BASE/api/contact" -H "$J" -d '{"name":"a","email":"a@b.jp","message":"hi","confirmed":true,"company":"x"}')"
check "contact bad email" 400 "$(code -X POST "$BASE/api/contact" -H "$J" -d '{"name":"a","email":"x","message":"hi","confirmed":true}')"

exit $fail
