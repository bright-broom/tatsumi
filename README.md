# TATSUMI コーポレート／ブランドサイト

Next.js 15（App Router）+ React 19 + TypeScript。Vercel にそのままデプロイできます。

## 構成
ワンページ（`app/page.tsx`）: Hero スライダー → 3rd / 2nd / 1st Collection → Concept → News → Nameplate → Original Goods → Coffee Stand → Company & Profile → Contact
サブページ: `/news`, `/news/[slug]`, `/goods`（製作の流れ・FAQ）, `/privacy`

| 用途 | ライブラリ |
|---|---|
| Hero フェードスライダー | embla-carousel-react (+ autoplay / fade) |
| ギャラリー拡大表示 | yet-another-react-lightbox |
| お問い合わせフォーム | react-hook-form + zod |
| フォント | next/font（Noto Sans JP / Roboto Condensed） |

## コンテンツ差し替え
- **テキスト・リンク・人物・店舗・ニュース**: すべて `content/site.ts` に集約。現在は TATSUMI 用の仮コピーです。
- **画像**: `public/images/` のプレースホルダーを同名で上書き（hero-1〜3, col3-01〜06, col2-01〜08 など）。
- 旧ブランドの原稿・写真・人物プロフィールを流用する場合は、買収契約で権利が移転しているか、掲載人物・撮影者・外部デザイナーの許諾があるかを確認してから反映してください。

## お問い合わせメール
環境変数を設定すると Resend 経由で送信します（未設定時はサーバーログのみ）。
```
RESEND_API_KEY=...
CONTACT_TO=info@your-domain.jp
CONTACT_FROM="TATSUMI <noreply@your-domain.jp>"
```

## 開発
```
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Vercel
GitHub に push → Vercel で Import（Framework: Next.js、設定変更不要）→ 上記の環境変数を登録。
`content/site.ts` の `site.url` を本番ドメインに変更すると OGP の絶対 URL が正しくなります。
