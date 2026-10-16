import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "個人情報保護について" };

export default function PrivacyPage() {
  return (
    <>
      <Header sub />
      <main>
        <div className="page-head"><div className="wrap"><p className="label">PRIVACY POLICY</p><h1 className="h2">個人情報保護について</h1></div></div>
        <section className="sec"><div className="wrap" style={{ maxWidth: 800 }}>
          <p className="lead">（現行サイトの「個人情報保護について」ページの本文を、クライアント確認のうえ掲載してください。）</p>
        </div></section>
      </main>
      <Footer sub />
    </>
  );
}
