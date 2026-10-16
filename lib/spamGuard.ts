/** お問い合わせ API のスパム対策（外部サービス・追加依存なし）。 */

export const MAX_BODY_BYTES = 20_000;
/** 画面を開いてから送信までの最短時間。これより速い送信は bot とみなす。 */
export const MIN_FILL_MS = 2_000;
const RATE_LIMIT = { max: 10, windowMs: 10 * 60 * 1000 };
const MAX_TRACKED_IPS = 5_000;

/** Vercel 上では x-real-ip / x-forwarded-for はプラットフォームが付与する。自前ホスティングでは偽装可能。 */
export function clientIp(req: Request): string {
  return req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Origin ヘッダがあり、かつ自サイトのホストと違う場合は他サイトからの送信。ヘッダなし（curl 等）はここでは許可する。 */
export function isCrossOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

const hits = new Map<string, number[]>();

/**
 * IP ごとのスライディングウィンドウ。プロセス内メモリなので、サーバーレスではインスタンスごとに数える
 * （大量送信の抑止にはなるが厳密な上限ではない）。厳密にするなら Upstash / Vercel KV などの共有ストアが必要。
 */
export function rateLimit(ip: string, now = Date.now()): { ok: true } | { ok: false; retryAfterSec: number } {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) {
    hits.set(ip, recent);
    return { ok: false, retryAfterSec: Math.ceil((RATE_LIMIT.windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > MAX_TRACKED_IPS) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(key);
    }
  }
  return { ok: true };
}

const URL_PATTERN = /https?:\/\/|www\./gi;

/** URL が 3 つ以上含まれる問い合わせはリンクスパムとみなす。 */
export function hasLinkSpam(...fields: string[]): boolean {
  return fields.some((f) => (f.match(URL_PATTERN)?.length ?? 0) >= 3);
}

/** メール件名・本文に入れる 1 行テキストから改行・制御文字を除く（ヘッダインジェクション対策）。 */
export function oneLine(s: string): string {
  return s.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ").trim();
}
