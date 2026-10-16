import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contactSchema";
import { turnstileEnabled, verifyTurnstile } from "@/lib/turnstile";
import { MAX_BODY_BYTES, MIN_FILL_MS, clientIp, hasLinkSpam, isCrossOrigin, oneLine, rateLimit } from "@/lib/spamGuard";

/**
 * お問い合わせ受付 API
 * RESEND_API_KEY と CONTACT_TO が設定されていれば Resend 経由でメール送信。
 * 未設定の場合はサーバーログに出すだけ（開発・プレビュー用）。
 *
 * スパム対策（docs/agents/architecture.md 参照）:
 *   サイズ上限 → 他サイトからの送信 → IP レート制限 → 入力検証 → 速すぎる送信
 *   → ハニーポット / リンクスパム（bot には成功を装って破棄する）→ Turnstile（任意）
 */
const silentDrop = (reason: string, ip: string) => {
  console.info("[contact] dropped", { reason, ip });
  return NextResponse.json({ ok: true, delivered: false });
};

export async function POST(req: Request) {
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return NextResponse.json({ ok: false }, { status: 413 });
  if (isCrossOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });

  const ip = clientIp(req);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json({ ok: false }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ ok: false }, { status: 413 });
  const json = (() => { try { return JSON.parse(raw); } catch { return null; } })();
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { name, email, tel, message, startedAt, hp_url_confirm, turnstileToken } = parsed.data;

  const elapsed = Date.now() - startedAt;
  if (elapsed < MIN_FILL_MS) {
    // 時計のずれで未来になった場合も含む。人間なら少し待って再送すれば通る。
    return NextResponse.json({ ok: false, reason: "too_fast" }, { status: 400 });
  }
  if (hp_url_confirm) return silentDrop("honeypot", ip);
  if (hasLinkSpam(name, message)) return silentDrop("link-spam", ip);

  // CAPTCHA（TURNSTILE_SECRET_KEY 設定時のみ）。外部通信を伴うので、安い判定をすべて通った後に行う。
  if (turnstileEnabled()) {
    if (!turnstileToken) return NextResponse.json({ ok: false, reason: "captcha_required" }, { status: 400 });
    const result = await verifyTurnstile(turnstileToken, ip);
    if (result === "failed") return NextResponse.json({ ok: false, reason: "captcha_failed" }, { status: 403 });
    if (result === "unavailable") return NextResponse.json({ ok: false, reason: "captcha_unavailable" }, { status: 503 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM ?? "株式会社タツミ <noreply@tatsumi-oni.co.jp>";

  if (!key || !to) {
    console.info("[contact] (メール未設定のためログ出力のみ)", { name, email, tel });
    return NextResponse.json({ ok: true, delivered: false });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `【お問い合わせ】${oneLine(name)} 様`,
      text: `お名前: ${oneLine(name)}\nメール: ${email}\n電話: ${oneLine(tel || "-")}\n\n${message}`,
    }),
  }).catch((e: unknown) => {
    console.error("[contact] send error", e);
    return null;
  });
  if (!res || !res.ok) {
    console.error("[contact] send failed", res?.status, await res?.text());
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ ok: true, delivered: true });
}
