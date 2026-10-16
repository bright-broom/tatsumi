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
# npx 経由だと終了時に next-server が残り、次回の実行でポートを占有して古いサーバーに接続してしまうため、
# next を直接起動する（PID がそのまま next-server になる）。
NEXT=node_modules/.bin/next
for p in "$PORT" $((PORT + 1)); do
  if curl -s -o /dev/null -m 2 "http://localhost:${p}/"; then
    echo "port ${p} is already in use (stale server?). Stop it and retry." >&2
    exit 2
  fi
done
RESEND_API_KEY=smoke-fake-key CONTACT_TO=smoke@example.invalid "$NEXT" start -p "$PORT" >/dev/null 2>&1 &
PID=$!
PID2=''; MOCK=''
trap 'kill $PID $PID2 $MOCK 2>/dev/null; wait 2>/dev/null' EXIT

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

# SEO・セキュリティ関連
check "robots.txt"  200 "$(code "$BASE/robots.txt")"
check "robots lists sitemap" 1 "$(curl -s "$BASE/robots.txt" | grep -c '^Sitemap: https://')"
check "sitemap has 3 urls"   3 "$(curl -s "$BASE/sitemap.xml" | grep -o '<loc>' | wc -l | tr -d ' ')"
check "canonical on /news"   1 "$(curl -s "$BASE/news" | grep -c '<link rel="canonical" href="https://[^"]*/news"')"
check "json-ld on /"         1 "$(curl -s "$BASE/" | grep -c 'application/ld+json')"
HDRS="$(curl -sI "$BASE/")"
check "header nosniff"       1 "$(echo "$HDRS" | grep -ci '^x-content-type-options: nosniff')"
check "header frame deny"    1 "$(echo "$HDRS" | grep -ci '^x-frame-options: DENY')"
check "header referrer"      1 "$(echo "$HDRS" | grep -ci '^referrer-policy:')"
check "no x-powered-by"      0 "$(echo "$HDRS" | grep -ci '^x-powered-by')"

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

# --- Turnstile（CAPTCHA）---
# Cloudflare の代わりにローカルのモックを siteverify として使う。トークン "pass" だけ成功。
# 本物の Cloudflare との疎通はここでは確認できない（リクエストの形式と、結果ごとの振り分けだけを検証する）。
MOCK_PORT=$((PORT + 20)); TS_PORT=$((PORT + 1)); MOCK_LOG="$(mktemp)"
node -e '
const http = require("http"), fs = require("fs");
http.createServer((req, res) => {
  let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => {
    fs.appendFileSync(process.argv[2], b + "\n");
    const ok = new URLSearchParams(b).get("response") === "pass";
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(ok ? { success: true } : { success: false, "error-codes": ["invalid-input-response"] }));
  });
}).listen(Number(process.argv[1]));
' "$MOCK_PORT" "$MOCK_LOG" &
MOCK=$!
RESEND_API_KEY=smoke-fake-key CONTACT_TO=smoke@example.invalid TURNSTILE_SECRET_KEY=smoke-secret \
  TURNSTILE_VERIFY_URL="http://localhost:${MOCK_PORT}/siteverify" "$NEXT" start -p "$TS_PORT" >/dev/null 2>&1 &
PID2=$!
for _ in $(seq 1 30); do curl -s -o /dev/null "http://localhost:${TS_PORT}/" && break; sleep 1; done

TS="http://localhost:${TS_PORT}/api/contact"
tbody() { printf '{"name":"smoke","email":"a@b.jp","message":"hello","confirmed":true,"startedAt":%s%s}' "$OLD" "${1:-}"; }
tpost() { code -X POST "$TS" -H "$J" -H "x-real-ip: $1" -d "$2"; }
check "turnstile: no token"            400 "$(tpost 10.1.0.1 "$(tbody)")"
check "turnstile: bad token"           403 "$(tpost 10.1.0.2 "$(tbody ',"turnstileToken":"nope"')")"
check "turnstile: good token -> sent"  502 "$(tpost 10.1.0.3 "$(tbody ',"turnstileToken":"pass"')")"
check "turnstile: bot dropped before captcha call" 200 "$(tpost 10.1.0.4 "$(tbody ',"hp_url_confirm":"x"')")"
check "turnstile: request has secret+response" 1 "$(grep -c 'secret=smoke-secret&response=pass' "$MOCK_LOG" | tr -d ' ')"
check "turnstile: mock called only for real attempts" 2 "$(grep -c . "$MOCK_LOG" | tr -d ' ')"
kill "$MOCK" 2>/dev/null; wait "$MOCK" 2>/dev/null
check "turnstile: Cloudflare unreachable -> 503" 503 "$(tpost 10.1.0.5 "$(tbody ',"turnstileToken":"pass"')")"
rm -f "$MOCK_LOG"

exit $fail
