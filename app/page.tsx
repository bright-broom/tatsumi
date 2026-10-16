import { Fragment } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Pic from "@/components/Pic";
import { localBusinessJsonLd } from "@/lib/structuredData";
import { about, company, gallery, history, kaze, news, onigawara, products, sdgs, shop, site, suisan, visit } from "@/content/site";

const Arrow = () => (
  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M0 5h15M11 1l4 4-4 4" /></svg>
);

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: localBusinessJsonLd() }} />
      <Header />
      <main>
        <Hero />

        {/* 01 Philosophy */}
        <section className="sec" aria-labelledby="about-h">
          <div className="wrap grid2">
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <p className="label">01 — {about.label}</p>
              <h2 className="h2" id="about-h">「{about.heading}」</h2>
              {about.body.map((p) => <p className="lead" key={p}>{p}</p>)}
              <div className="elements">
                {about.elements.map((e) => (
                  <div key={e.en}><b>{e.kanji}</b><p className="mono" style={{ fontSize: 10 }}>{e.en}</p><p>{e.text}</p></div>
                ))}
              </div>
            </div>
            <div className="img-pair reveal">
              {about.images.map((i) => <Pic key={i.src} img={i} sizes="(max-width: 960px) 50vw, 25vw" />)}
            </div>
          </div>
        </section>

        {/* 02 Onigawara */}
        <section id="onigawara" className="sec dark" aria-labelledby="oni-h">
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 56 }}>
            <div className="grid2 reveal">
              <div>
                <p className="label">02 — {onigawara.label}</p>
                <h2 className="h2" id="oni-h">{onigawara.heading}</h2>
              </div>
              <p className="lead">{onigawara.lead}</p>
            </div>
            <div className="grid2 reveal" style={{ alignItems: "center" }}>
              <Pic img={onigawara.onishi.image} sizes={"(max-width: 960px) 100vw, 50vw"} style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 className="h3">{onigawara.onishi.title}</h3>
                <p className="lead">{onigawara.onishi.body}</p>
                <ol className="process" style={{ marginTop: 16 }}>
                  {onigawara.process.map((p) => (
                    <li key={p.no}><span>{p.no}</span><h4>{p.title}</h4><p>{p.text}</p></li>
                  ))}
                </ol>
              </div>
            </div>
            <div>
              <div className="sec-head">
                <h3 className="h3">特注品の製作例</h3>
                <a className="link" href="#contact">特注のご相談はこちら →</a>
              </div>
              <Gallery images={onigawara.categories} variant="wide" captions />
            </div>
          </div>
        </section>

        {/* 03 Products */}
        <section id="products" className="sec" aria-labelledby="products-h">
          <div className="wrap">
            <div className="sec-head reveal">
              <div><p className="label">03 — {products.label}</p><h2 className="h2" id="products-h">{products.heading}</h2></div>
              <p className="lead" style={{ maxWidth: 560 }}>{products.lead}</p>
            </div>
            <Gallery images={products.items} captions light />
          </div>
        </section>

        {/* 04 Kaze */}
        <section id="kaze" className="sec ash2" aria-labelledby="kaze-h">
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            <div className="grid2 reveal" style={{ alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <p className="label" style={{ margin: 0 }}>04 — {kaze.label}</p>
                <h2 className="h2" id="kaze-h">{kaze.heading}<br /><span style={{ fontSize: "0.55em" }}>{kaze.sub}</span></h2>
                <p className="lead">{kaze.lead}</p>
              </div>
              <Pic img={kaze.image} sizes={"(max-width: 960px) 100vw, 50vw"} style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover" }} />
            </div>
            <div className="series">
              {kaze.series.map((s) => (
                <article className="card reveal" key={s.name} style={{ background: "var(--ash)" }}>
                  <Pic img={s.image} sizes="(max-width: 960px) 100vw, 50vw" />
                  <div className="card-body">
                    <p className="label" style={{ margin: 0 }}>{s.en}</p>
                    <h3 className="h3">{s.name}</h3>
                    <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.9 }}>{s.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="reveal">
              <p className="mono" style={{ fontSize: 12, margin: "0 0 12px" }}>MADE TO ORDER — オーダーメイド製作</p>
              <ul className="chips">{kaze.madeToOrder.map((m) => <li key={m}>{m}</li>)}</ul>
            </div>
          </div>
        </section>

        {/* 05 Gallery */}
        <section id="gallery" className="sec dark" aria-labelledby="gallery-h">
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            <div className="grid2 reveal">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <p className="label" style={{ margin: 0 }}>05 — {gallery.label}</p>
                <h2 className="h2" id="gallery-h">{gallery.heading}</h2>
                <p className="lead">{gallery.lead}</p>
              </div>
              <dl className="dl" style={{ alignSelf: "end" }}>
                {gallery.hours.map((h) => (<Fragment key={h.k}><dt>{h.k}</dt><dd>{h.v}</dd></Fragment>))}
              </dl>
            </div>
            <Gallery images={gallery.images} variant="wide" />
          </div>
        </section>

        {/* 06 Visit */}
        <section id="visit" className="sec" aria-labelledby="visit-h">
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            <div className="sec-head reveal">
              <div><p className="label">06 — {visit.label}</p><h2 className="h2" id="visit-h">{visit.heading}</h2></div>
              <a className="btn btn-solid" href={site.reserveUrl}>見学・体験を予約する <Arrow /></a>
            </div>
            <div className="grid2 reveal" style={{ alignItems: "center" }}>
              <Pic img={visit.tour.image} sizes={"(max-width: 960px) 100vw, 50vw"} style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 className="h3">{visit.tour.title}</h3>
                <p className="lead">{visit.tour.text}</p>
                <dl className="dl">
                  {visit.tour.facts.map((f) => (<Fragment key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></Fragment>))}
                </dl>
              </div>
            </div>
            <div>
              <h3 className="h3 reveal" style={{ marginBottom: 24 }}>ワークショップ</h3>
              <div className="ws">
                {visit.workshops.map((w) => (
                  <article key={w.title} className="reveal">
                    <Pic img={w.image} sizes="(max-width: 600px) 100vw, 33vw" />
                    <h4 style={{ margin: "6px 0 0", fontFamily: "var(--mincho)", fontSize: 19, fontWeight: 600 }}>{w.title}</h4>
                    <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.9 }}>{w.text}</p>
                    <div className="meta"><span>⏱ {w.time}</span><span>{w.price}</span></div>
                  </article>
                ))}
              </div>
              <ul className="notes reveal" style={{ marginTop: 32 }}>{visit.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
          </div>
        </section>

        {/* 07 Shop */}
        <section id="shop" className="sec ash2" aria-labelledby="shop-h">
          <div className="wrap">
            <div className="sec-head reveal">
              <div><p className="label">07 — {shop.label}</p><h2 className="h2" id="shop-h">{shop.heading}</h2></div>
              <a className="btn btn-solid" href={site.storeUrl} target="_blank" rel="noopener noreferrer">オンラインショップへ <Arrow /></a>
            </div>
            <p className="lead reveal" style={{ marginBottom: 32 }}>{shop.lead}</p>
            <Gallery images={shop.items} captions light variant="wide" />
          </div>
        </section>

        {/* 08 History */}
        <section id="history" className="sec" aria-labelledby="history-h">
          <div className="wrap grid2">
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p className="label" style={{ margin: 0 }}>08 — {history.label}</p>
              <h2 className="h2" id="history-h">{history.heading}</h2>
              {history.body.map((p) => <p className="lead" key={p.slice(0, 12)}>{p}</p>)}
              <div className="img-pair even" style={{ marginTop: 8 }}>
                {history.images.map((i) => <Pic key={i.src} img={i} sizes="(max-width: 960px) 50vw, 25vw" style={{ aspectRatio: "4 / 3" }} />)}
              </div>
            </div>
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 16, alignSelf: "start", position: "sticky", top: 96 }}>
              <div className="aun">
                {history.aun.images.map((i, k) => (
                  <figure key={i.src}><Pic img={i} sizes="(max-width: 960px) 50vw, 25vw" /><figcaption>{k === 0 ? "阿" : "吽"}</figcaption></figure>
                ))}
              </div>
              <h3 className="h3">{history.aun.title}</h3>
              <p className="lead">{history.aun.text}</p>
            </div>
          </div>
        </section>

        {/* 09 Suisan + SDGs */}
        <section id="suisan" className="sec dark" aria-labelledby="suisan-h">
          <div className="wrap grid2">
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p className="label" style={{ margin: 0 }}>09 — {suisan.label}</p>
              <h2 className="h2" id="suisan-h">{suisan.heading}</h2>
              <p className="lead">{suisan.text}</p>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>水産部 TEL {suisan.contact.tel}／FAX {suisan.contact.fax}</p>
              <div className="img-pair even">
                {suisan.images.map((i) => <Pic key={i.src} img={i} sizes="(max-width: 960px) 50vw, 25vw" style={{ aspectRatio: "4 / 3" }} />)}
              </div>
            </div>
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 20, borderTop: "1px solid rgba(237,236,232,.2)", paddingTop: 28, alignSelf: "end" }}>
              <p className="label" style={{ margin: 0 }}>{sdgs.label} — GOAL 12</p>
              <h3 className="h3">{sdgs.heading}</h3>
              <p className="lead">{sdgs.text}</p>
              <p style={{ margin: 0, fontFamily: "var(--mincho)", fontSize: 56, lineHeight: 1.2 }}>95<span style={{ fontSize: 20 }}>%+</span></p>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>原土の使用率 目標</p>
            </div>
          </div>
        </section>

        {/* 10 News */}
        <section id="news" className="sec" aria-labelledby="news-h">
          <div className="wrap grid2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))" }}>
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p className="label" style={{ margin: 0 }}>10 — NEWS</p>
              <h2 className="h2" id="news-h">お知らせ</h2>
              <a className="link" href="/news" style={{ alignSelf: "flex-start" }}>一覧を見る →</a>
              <a className="link" href={site.blogUrl} target="_blank" rel="noopener noreferrer" style={{ alignSelf: "flex-start" }}>ブログ ↗</a>
            </div>
            <ul className="news news-list reveal">
              {news.slice(0, 6).map((n) => (
                <li key={n.date + n.title}>
                  <time dateTime={n.date}>{n.date.replaceAll("-", ".")}</time>
                  <span className="cat">{n.category}</span>
                  <p>{n.title}{n.note && <small>{n.note}</small>}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 11 Company */}
        <section id="company" className="sec ash2" aria-labelledby="company-h">
          <div className="wrap grid2">
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p className="label" style={{ margin: 0 }}>11 — {company.label}</p>
              <h2 className="h2" id="company-h">{company.heading}</h2>
              <dl className="dl">
                {company.rows.map((r) => (<Fragment key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></Fragment>))}
                <dt>アクセス</dt><dd>{company.access}</dd>
              </dl>
            </div>
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Pic img={company.image} sizes={"(max-width: 960px) 100vw, 50vw"} style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover" }} />
              <iframe
                title="株式会社タツミの地図"
                src="https://maps.google.com/maps?q=%E5%85%B5%E5%BA%AB%E7%9C%8C%E5%8D%97%E3%81%82%E3%82%8F%E3%81%98%E5%B8%82%E6%B4%A5%E4%BA%95976&z=14&output=embed"
                style={{ width: "100%", aspectRatio: "16 / 9", border: 0, filter: "grayscale(1)" }}
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="sec dark" aria-labelledby="contact-h">
          <div className="wrap grid2">
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p className="label" style={{ margin: 0 }}>CONTACT</p>
              <h2 className="h2" id="contact-h">お問い合わせ</h2>
              <p className="lead">特注の鬼瓦・飾り瓦、記念品・贈答品、瓦風 -kaze- のご相談、工場見学・ワークショップのご予約など、お気軽にお問い合わせください。</p>
              <div style={{ marginTop: 8, paddingTop: 24, borderTop: "1px solid rgba(237,236,232,.16)", fontSize: 14, lineHeight: 2, color: "#D9DADC" }}>
                <p style={{ margin: 0 }}>{site.legalName}</p>
                <p style={{ margin: 0 }}>{site.address}</p>
                <p style={{ margin: 0 }}>TEL <a className="tel" href={`tel:${site.tel.replaceAll("-", "")}`}>{site.tel}</a>　FAX {site.fax}</p>
              </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
