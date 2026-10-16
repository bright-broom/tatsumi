"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { nav, site } from "@/content/site";

export default function Header({ sub = false }: { sub?: boolean }) {
  const [open, setOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const href = (h: string) => (sub && h.startsWith("#") ? `/${h}` : h);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // メニューを開いたら閉じるボタンへ、閉じたら開くボタンへフォーカスを移す（閉じた中身は inert でキーボードから外す）
  useEffect(() => {
    if (open) closeBtn.current?.focus();
    else if (wasOpen.current) menuBtn.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <header className="header">
      <div className="header-in">
        <a href={sub ? "/" : "#top"} className="brand" aria-label={`${site.legalName} トップへ`}>
          <span className="brand-mark">TATSUMI</span>
          <span className="brand-sub">淡路鬼瓦 指定窯元</span>
        </a>
        <nav className="gnav" aria-label="グローバルナビゲーション">
          {nav.map((n) => (
            <a key={n.href} href={href(n.href)}>{n.label}<small>{n.en}</small></a>
          ))}
          <a className="cta" href={site.storeUrl} target="_blank" rel="noopener noreferrer">オンラインショップ</a>
        </nav>
        <button ref={menuBtn} className="menu-btn" aria-label="メニューを開く" aria-expanded={open} onClick={() => setOpen(true)}>
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M0 1h20M0 7h20M0 13h20" /></svg>
        </button>
      </div>
      <div className={clsx("drawer", open && "open")} inert={!open}>
        <button ref={closeBtn} className="drawer-close" aria-label="メニューを閉じる" onClick={() => setOpen(false)}>×</button>
        <ul>
          {nav.map((n) => (
            <li key={n.href}><a href={href(n.href)} onClick={() => setOpen(false)}>{n.label}<small>{n.en}</small></a></li>
          ))}
          <li><a href={href("#news")} onClick={() => setOpen(false)}>お知らせ<small>NEWS</small></a></li>
          <li><a href={href("#contact")} onClick={() => setOpen(false)}>お問い合わせ<small>CONTACT</small></a></li>
          <li><a href={site.storeUrl} target="_blank" rel="noopener noreferrer">オンラインショップ<small>SHOP ↗</small></a></li>
        </ul>
      </div>
    </header>
  );
}
