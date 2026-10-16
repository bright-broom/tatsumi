import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { news, site } from "@/content/site";

export const metadata: Metadata = { title: "お知らせ" };

export default function NewsIndex() {
  return (
    <>
      <Header sub />
      <main>
        <div className="page-head"><div className="wrap"><p className="label">NEWS</p><h1 className="h2">お知らせ</h1></div></div>
        <section className="sec"><div className="wrap">
          <ul className="news">
            {news.map((n) => (
              <li key={n.date + n.title}>
                <time dateTime={n.date}>{n.date.replaceAll("-", ".")}</time>
                <span className="cat">{n.category}</span>
                <p>{n.title}{n.note && <small>{n.note}</small>}</p>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 32 }}><a className="link" href={site.blogUrl} target="_blank" rel="noopener noreferrer">ブログで記事を読む ↗</a></p>
        </div></section>
      </main>
      <Footer sub />
    </>
  );
}
