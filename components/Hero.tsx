"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { hero } from "@/content/site";

export default function Hero() {
  const [ref, api] = useEmblaCarousel({ loop: true, duration: 40 }, [Autoplay({ delay: 5500, stopOnInteraction: false }), Fade()]);
  const [index, setIndex] = useState(0);
  const onSelect = useCallback(() => api && setIndex(api.selectedScrollSnap()), [api]);
  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api, onSelect]);

  return (
    <section id="top" className="hero" aria-label="メインビジュアル">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="label" style={{ margin: 0 }}>{hero.eyebrow}</p>
          <h1>{hero.heading[0]}<br />{hero.heading[1]}</h1>
          <p className="lead">{hero.lead}</p>
          <div className="hero-actions">
            <a className="btn btn-light" href="#onigawara">鬼瓦の製作を見る
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M0 5h15M11 1l4 4-4 4" /></svg>
            </a>
            <a className="btn btn-ghost" href="#visit">工場見学・体験</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="embla" ref={ref}>
            <div className="embla__container">
              {hero.slides.map((s) => (
                <div className="embla__slide" key={s.src}><img src={s.src} alt={s.alt} /></div>
              ))}
            </div>
          </div>
          <div className="hero-dots">
            {hero.slides.map((s, i) => (
              <button key={s.src} className={i === index ? "on" : ""} aria-label={`スライド ${i + 1}：${s.alt}`} onClick={() => api?.scrollTo(i)} />
            ))}
          </div>
          <p className="vt" aria-hidden="true">一に土、二に窯、三に細工。</p>
        </div>
      </div>
      <div className="stats">
        {hero.stats.map((s) => (
          <div key={s.label}><b>{s.value}<span>{s.unit}</span></b><p>{s.label}</p></div>
        ))}
      </div>
    </section>
  );
}
