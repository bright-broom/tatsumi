"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

/** Cloudflare Turnstile のサイトキー（公開してよい値）。未設定なら CAPTCHA は無効。ビルド時に埋め込まれる。 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
const api = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;

type Props = {
  /** 検証済みトークン。期限切れ・エラー時と reset 時は null。setState をそのまま渡せる（参照が安定していること）。 */
  onToken: (token: string | null) => void;
  /** 値が増えるたびにウィジェットをやり直す（トークンは 1 回しか使えないため、送信のたびに増やす）。 */
  resetKey: number;
};

export default function Turnstile({ onToken, resetKey }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !ready || !box.current) return;
    widget.current = api()?.render(box.current, {
      sitekey: TURNSTILE_SITE_KEY,
      language: "ja",
      theme: "dark",
      callback: (token: string) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
    });
    return () => {
      if (widget.current) api()?.remove(widget.current);
      widget.current = undefined;
    };
  }, [ready, onToken]);

  useEffect(() => {
    if (resetKey > 0 && widget.current) {
      api()?.reset(widget.current);
      onToken(null);
    }
  }, [resetKey, onToken]);

  if (!TURNSTILE_SITE_KEY) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="lazyOnload" onReady={() => setReady(true)} />
      <div ref={box} data-testid="turnstile" />
    </>
  );
}
