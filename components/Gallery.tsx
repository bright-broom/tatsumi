"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { Img } from "@/content/site";
import Pic from "@/components/Pic";

type Props = { images: Img[]; captions?: boolean; variant?: "square" | "wide"; light?: boolean };

export default function Gallery({ images, captions = false, variant, light }: Props) {
  const [index, setIndex] = useState(-1);
  // 4 列で最終行が余る枚数（9 枚など）は 3 列にする
  const cols3 = images.length % 4 !== 0 && images.length % 3 === 0;
  return (
    <>
      <div className={`tiles reveal ${variant ?? ""} ${light ? "on-light" : ""} ${cols3 ? "cols-3" : ""}`}>
        {images.map((img, i) => (
          <button key={img.src} type="button" className="tile" onClick={() => setIndex(i)} aria-label={`${img.alt}を拡大`}>
            <Pic img={img} alt={captions ? "" : undefined} sizes="(max-width: 480px) 100vw, (max-width: 1080px) 33vw, 25vw" />
            {captions && <span className="cap">{img.alt}</span>}
          </button>
        ))}
      </div>
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={images.map((i) => ({ src: i.src, alt: i.alt, title: i.alt, width: i.width, height: i.height }))}
        plugins={[Captions]}
      />
    </>
  );
}
