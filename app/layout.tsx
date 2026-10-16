import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const mincho = Shippori_Mincho({ weight: ["400", "600", "800"], subsets: ["latin"], variable: "--f-mincho", display: "swap", preload: false });
const gothic = Zen_Kaku_Gothic_New({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--f-gothic", display: "swap", preload: false });
const mono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--f-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.legalName}｜淡路鬼瓦の指定窯元`, template: `%s｜${site.legalName}` },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: site.legalName,
    title: `${site.legalName}｜淡路鬼瓦の指定窯元`,
    description: site.description,
    images: [{ url: site.ogImage, width: 1500, height: 700 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#17181A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${mincho.variable} ${gothic.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
