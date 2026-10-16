import { nav, site } from "@/content/site";

export default function Footer({ sub = false }: { sub?: boolean }) {
  const href = (h: string) => (sub && h.startsWith("#") ? `/${h}` : h);
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <p className="brand-mark" style={{ margin: 0 }}>TATSUMI</p>
          <p style={{ margin: "12px 0 0", lineHeight: 1.9 }}>
            {site.legalName}<br />兵庫県伝統的工芸品「淡路鬼瓦」指定窯元<br />{site.address}<br />
            TEL <a className="tel" href={`tel:${site.tel.replaceAll("-", "")}`} style={{ color: "var(--ash)" }}>{site.tel}</a>／FAX {site.fax}
          </p>
        </div>
        <nav aria-label="サイト内リンク">
          {nav.map((n) => <a key={n.href} href={href(n.href)}>{n.label}</a>)}
        </nav>
        <nav aria-label="その他のリンク">
          <a href={href("#history")}>淡路瓦の歴史</a>
          <a href={href("#suisan")}>水産部</a>
          <a href="/news">お知らせ一覧</a>
          <a href={href("#contact")}>お問い合わせ</a>
          <a href="/privacy">個人情報保護について</a>
          <a href={site.storeUrl} target="_blank" rel="noopener noreferrer">オンラインショップ ↗</a>
          <a href={site.blogUrl} target="_blank" rel="noopener noreferrer">ブログ ↗</a>
        </nav>
      </div>
      <div className="wrap footer-bottom">
        <span>©{new Date().getFullYear()} Tatsumi Corporation</span>
        <span>当サイト内の文章・画像等の無断転載及び複製等はご遠慮ください。</span>
      </div>
    </footer>
  );
}
