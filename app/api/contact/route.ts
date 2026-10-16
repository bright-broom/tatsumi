import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contactSchema";

/**
 * お問い合わせ受付 API
 * RESEND_API_KEY と CONTACT_TO が設定されていれば Resend 経由でメール送信。
 * 未設定の場合はサーバーログに出すだけ（開発・プレビュー用）。
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { name, email, tel, message } = parsed.data;

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
      subject: `【お問い合わせ】${name} 様`,
      text: `お名前: ${name}\nメール: ${email}\n電話: ${tel || "-"}\n\n${message}`,
    }),
  });
  if (!res.ok) {
    console.error("[contact] send failed", res.status, await res.text());
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ ok: true, delivered: true });
}
