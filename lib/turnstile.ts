/**
 * Cloudflare Turnstile（CAPTCHA）のサーバー側検証。
 * TURNSTILE_SECRET_KEY が設定されているときだけ有効（未設定なら何もしない）。
 * フォーム側の表示は NEXT_PUBLIC_TURNSTILE_SITE_KEY（components/Turnstile.tsx）。
 */

const DEFAULT_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 5_000;

export const turnstileEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY);

export type TurnstileResult = "ok" | "failed" | "unavailable";

/**
 * トークンを Cloudflare で検証する。トークンは 1 回しか使えない。
 * Cloudflare に到達できない場合は "unavailable"（呼び出し側は fail closed = 送信を受け付けない）。
 * TURNSTILE_VERIFY_URL はテスト（scripts/smoke.sh のモック）用の上書き。本番では設定しない。
 */
export async function verifyTurnstile(token: string, ip: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return "ok";
  const body = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") body.set("remoteip", ip);
  try {
    const res = await fetch(process.env.TURNSTILE_VERIFY_URL ?? DEFAULT_VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return "unavailable";
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) console.info("[contact] turnstile rejected", data["error-codes"]);
    return data.success ? "ok" : "failed";
  } catch (e) {
    console.error("[contact] turnstile verify error", e);
    return "unavailable";
  }
}
