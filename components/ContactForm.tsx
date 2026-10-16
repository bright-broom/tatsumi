"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactInput } from "@/lib/contactSchema";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "ok" | "error" | "retry">("idle");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactInput>({ resolver: zodResolver(contactFormSchema) });

  const onSubmit = async (data: ContactInput) => {
    setStatus("idle");
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, startedAt }) });
    if (res.ok) { setStatus("ok"); reset(); setStartedAt(Date.now()); return; }
    const reason = await res.json().then((j: { reason?: string }) => j.reason).catch(() => undefined);
    setStatus(reason === "too_fast" ? "retry" : "error");
  };

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="row">
        <label>
          <span>お名前<span className="req">必須</span></span>
          <input type="text" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <span className="err">{errors.name.message}</span>}
        </label>
        <label>
          <span>メールアドレス<span className="req">必須</span></span>
          <input type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email && <span className="err">{errors.email.message}</span>}
        </label>
      </div>
      <label>
        <span>電話番号</span>
        <input type="tel" autoComplete="tel" {...register("tel")} />
        {errors.tel && <span className="err">{errors.tel.message}</span>}
      </label>
      <label>
        <span>お問い合わせ内容<span className="req">必須</span></span>
        <textarea {...register("message")} aria-invalid={!!errors.message} placeholder="特注の鬼瓦、記念品、工場見学のご予約など、お気軽にどうぞ。" />
        {errors.message && <span className="err">{errors.message.message}</span>}
      </label>
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden {...register("hp_url_confirm")} />
      <label className="check">
        <input type="checkbox" {...register("confirmed")} />
        <span>入力内容を確認しました</span>
      </label>
      {errors.confirmed && <span className="err">{errors.confirmed.message}</span>}
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "送信中…" : "送信する"}</button>
      {status === "ok" && <p className="form-msg" role="status">送信しました。担当者よりご連絡いたします。</p>}
      {status === "retry" && <p className="form-msg" role="alert">送信が早すぎたため受け付けられませんでした。数秒おいて、もう一度お試しください。</p>}
      {status === "error" && <p className="form-msg" role="alert">送信に失敗しました。お手数ですがお電話でお問い合わせください。</p>}
    </form>
  );
}
