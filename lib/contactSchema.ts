import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "お名前を入力してください").max(100),
  email: z.string().trim().email("メールアドレスの形式が正しくありません"),
  tel: z.string().trim().regex(/^[0-9+\-() ]*$/, "電話番号は数字とハイフンで入力してください").max(20).optional().or(z.literal("")),
  message: z.string().trim().min(1, "お問い合わせ内容を入力してください").max(4000),
  confirmed: z.literal(true, { message: "内容をご確認の上、チェックを入れてください" }),
  /** ボット対策のハニーポット（人間は空のまま送信する） */
  company: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
