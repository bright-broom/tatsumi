#!/usr/bin/env bash
# 本番ビルド (.next) を起動して主要ルート・画像最適化・/api/contact のスパム対策を確認する。
# 事前に `npm run build` が必要。使い方: bash scripts/smoke.sh [port]
#
# 問い合わせ API は「メール送信を試みたか」で振り分けを判定する。ダミーの Resend 設定で起動するので、
#   送信を試みた  → Resend が拒否（または到達不能）→ 502
#   bot として破棄 → 200（送信は試みない）
# となる。実際にメールが送られることはない。
set -u
PORT="${1:-3111}"
BASE="http://localhost:${PORT}"
RESEND_API_KEY=smoke-fake-key CONTACT_TO=smoke@example.invalid npx next start -p "$PORT" >/dev/null 2>&1 &
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

# next/image の最適化（sharp）が動き、WebP で返ること
IMG='/_next/image?url=%2Fimages%2Ftatsumi%2Fhero-1.jpg&w=1080&q=75'
check "image optimizer" 200 "$(code -H 'Accept: image/webp' "$BASE$IMG")"
check "image is webp"   "image/webp" "$(curl -s -o /dev/null -w "%{content_type}" -H 'Accept: image/webp' "$BASE$IMG")"

# --- /api/contact ---
J='Content-Type: application/json'
OLD=$(( ($(date +%s) - 60) * 1000 ))   # 60 秒前にフォームを開いた
NOW=$(( $(date +%s) * 1000 ))
body() { # message startedAt [extra json fields]
  printf '{"name":"smoke","email":"a@b.jp","message":"%s","confirmed":true,"startedAt":%s%s}' "$1" "$2" "${3:-}"
}
post() { # ip body [extra curl args...]
  local ip="$1" data="$2"; shift 2
  code -X POST "$BASE/api/contact" -H "$J" -H "x-real-ip: $ip" -d "$data" "$@"
}

check "contact valid -> delivery attempted" 502 "$(post 10.0.0.1 "$(body hello "$OLD")")"
check "contact too fast"        400 "$(post 10.0.0.2 "$(body hello "$NOW")")"
check "contact no startedAt"    400 "$(post 10.0.0.3 '{"name":"a","email":"a@b.jp","message":"hi","confirmed":true}')"
check "contact unchecked"       400 "$(post 10.0.0.4 "$(printf '{"name":"a","email":"a@b.jp","message":"hi","startedAt":%s}' "$OLD")")"
check "contact bad email"       400 "$(post 10.0.0.5 "$(printf '{"name":"a","email":"x","message":"hi","confirmed":true,"startedAt":%s}' "$OLD")")"
check "contact honeypot dropped"   200 "$(post 10.0.0.6 "$(body hello "$OLD" ',"hp_url_confirm":"x"')")"
check "contact link spam dropped"  200 "$(post 10.0.0.7 "$(body 'http://a.example http://b.example www.c.example' "$OLD")")"
check "contact cross-origin"    403 "$(post 10.0.0.8 "$(body hello "$OLD")" -H 'Origin: https://evil.example')"
check "contact same-origin ok"  502 "$(post 10.0.0.9 "$(body hello "$OLD")" -H "Origin: $BASE")"
check "contact oversize"        413 "$(post 10.0.0.10 "$(body "$(head -c 25000 /dev/zero | tr '\0' a)" "$OLD")")"

# レート制限: 同一 IP から 10 回までは通り、11 回目で 429（検証エラーも回数に数える）
last=""
for _ in $(seq 1 11); do last="$(post 10.9.9.9 '{}')"; done
check "contact rate limit (11th)" 429 "$last"
check "rate limit is per IP"      400 "$(post 10.9.9.10 '{}')"

exit $fail
