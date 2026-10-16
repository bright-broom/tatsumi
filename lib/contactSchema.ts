import { z } from "zod";

/** フォームの入力項目（ブラウザ側の検証にも使う）。 */
export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "お名前を入力してください").max(100),
  email: z.string().trim().email("メールアドレスの形式が正しくありません"),
  tel: z.string().trim().regex(/^[0-9+\-() ]*$/, "電話番号は数字とハイフンで入力してください").max(20).optional().or(z.literal("")),
  message: z.string().trim().min(1, "お問い合わせ内容を入力してください").max(4000),
  confirmed: z.literal(true, { message: "内容をご確認の上、チェックを入れてください" }),
  /** ボット対策のハニーポット（人間は空のまま送信する）。ブラウザの自動入力に反応しない名前にしている。 */
  hp_url_confirm: z.string().max(200).optional(),
});

/** API が受け取る本文。フォーム項目に、画面を開いた時刻（epoch ms。速すぎる送信の検出用）と CAPTCHA トークンを足したもの。 */
export const contactSchema = contactFormSchema.extend({
  startedAt: z.number().int().positive(),
  /** Cloudflare Turnstile のトークン。TURNSTILE_SECRET_KEY 設定時のみ必須（route.ts で判定）。 */
  turnstileToken: z.string().max(2048).optional(),
});

export type ContactInput = z.infer<typeof contactFormSchema>;
