import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/** 公開ページの一覧。ページを追加したらここにも足す（scripts/smoke.sh が件数を確認する）。 */
const paths = ["/", "/news", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({ url: `${site.url}${path === "/" ? "" : path}` }));
}
