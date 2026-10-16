import Image from "next/image";
import type { ComponentProps } from "react";
import type { Img } from "@/content/site";

type Props = { img: Img; sizes: string } & Omit<ComponentProps<typeof Image>, "src" | "alt" | "width" | "height" | "sizes">;

/** content/site.ts の Img を next/image で描画する。寸法は content/image-sizes.json から来る。 */
export default function Pic({ img, sizes, ...rest }: Props) {
  return <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes={sizes} {...rest} />;
}
