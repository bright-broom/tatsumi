import { site } from "@/content/site";

/**
 * 検索エンジン向けの構造化データ（schema.org の LocalBusiness）。
 * 値は content/site.ts の確定済みの項目だけから作る。営業時間などは確認が取れてから足す。
 */
export function localBusinessJsonLd(): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    description: site.description,
    image: `${site.url}${site.ogImage}`,
    telephone: `+81-${site.tel.replace(/^0/, "")}`,
    faxNumber: `+81-${site.fax.replace(/^0/, "")}`,
    address: {
      "@type": "PostalAddress",
      postalCode: "656-0341",
      addressRegion: "兵庫県",
      addressLocality: "南あわじ市",
      streetAddress: "津井976",
      addressCountry: "JP",
    },
  };
  // <script> 内に埋めるので、"</script>" で閉じられないよう "<" をエスケープする
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
