"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { Img } from "@/content/site";

type Props = { images: Img[]; captions?: boolean; variant?: "square" | "wide"; light?: boolean };

export default function Gallery({ images, captions = false, variant, light }: Props) {
  const [index, setIndex] = useState(-1);
  return (
    <>
      <div className={`tiles reveal ${variant ?? ""} ${light ? "on-light" : ""}`}>
        {images.map((img, i) => (
          <button key={img.src} type="button" className="tile" onClick={() => setIndex(i)} aria-label={`${img.alt}を拡大`}>
            <img src={img.src} alt={img.alt} loading="lazy" />
            {captions && <span className="cap">{img.alt}</span>}
          </button>
        ))}
      </div>
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={images.map((i) => ({ src: i.src, alt: i.alt, title: i.alt }))}
        plugins={[Captions]}
      />
    </>
  );
}
