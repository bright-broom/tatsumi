# アーキテクチャ

## 全体像

静的生成中心の Next.js サイト。サーバー処理は `/api/contact` の 1 本だけ。

```
content/site.ts ─┐
content/news.json ┼─> app/page.tsx, app/news/page.tsx, components/*  ─> HTML（静的）
public/images/*  ─┘
ContactForm (client) ─POST─> app/api/contact/route.ts ─> Resend（任意）
```

ビルド結果（`npm run build`）: `/`, `/news`, `/privacy`, `/_not-found` は静的 (○)、`/api/contact` のみ動的 (ƒ)。

## ルーティング

| パス | ファイル | 備考 |
|---|---|---|
| `/` | `app/page.tsx` | ワンページ。セクションは下表 |
| `/news` | `app/news/page.tsx` | お知らせ全件 |
| `/privacy` | `app/privacy/page.tsx` | プライバシーポリシー |
| `POST /api/contact` | `app/api/contact/route.ts` | 下記 |

`/news/[slug]` や `/goods` は **存在しない**（旧ブランド時代の記述が残っていたら誤り）。

## トップページのセクション

| # | ID | データ (`content/site.ts`) |
|---|---|---|
| Hero | – | `hero`（`components/Hero.tsx`、embla フェード + autoplay） |
| 01 Philosophy | – | `about` |
| 02 淡路鬼瓦 | `#onigawara` | `onigawara` |
| 03 取扱商品 | `#products` | `products` |
| 04 瓦風 -kaze- | `#kaze` | `kaze` |
| 05 瓦廊 | `#gallery` | `gallery` |
| 06 見学・体験 | `#visit` | `visit`（予約ボタンは `site.reserveUrl`） |
| 07 オンラインショップ | `#shop` | `shop`（`site.storeUrl`） |
| 08 歴史 | `#history` | `history` |
| 09 水産部 + SDGs | `#suisan` | `suisan`, `sdgs` |
| 10 お知らせ | `#news` | `news` |
| 11 会社案内 | `#company` | `company`（Google Maps iframe 埋め込み） |
| Contact | `#contact` | `ContactForm` |

ヘッダーのナビ（`nav`）は `#onigawara #products #kaze #gallery #visit #company` を指す。**セクション ID を変えたら `nav` も直す。**
サブページでは Header/Footer に `sub` を渡し、ハッシュリンクを `/#...` に変換している。

## お問い合わせ API

- 検証は `lib/contactSchema.ts`（zod）。フォームとサーバーで同じスキーマを共有。
  - 必須: `name`, `email`, `message`, `confirmed`（確認チェック。`true` のみ可）
  - 任意: `tel`（数字・`+-() ` のみ）
  - `company` はハニーポット。**値が入っていれば 400**。フォームでは非表示の空欄。
- `RESEND_API_KEY` と `CONTACT_TO` がそろえば Resend で送信（失敗は 502）。未設定ならログ出力のみで `{ ok: true, delivered: false }` を返す。
- 送信元は `CONTACT_FROM`（省略時 `株式会社タツミ <noreply@tatsumi-oni.co.jp>`）。
- レート制限・CAPTCHA は未実装（既知の制約。必要なら人間に提案する）。

## スタイル

`app/globals.css` 1 枚（約 200 行）。フォントは `next/font/google` で Shippori Mincho / Zen Kaku Gothic New / IBM Plex Mono を取得。
ビルド時に Google Fonts へアクセスするため、**ネットワークが遮断された環境では `npm run build` が失敗する**。
画像は `components/Pic.tsx`（`next/image`）で描画する。寸法は `content/image-sizes.json`（`scripts/image-sizes.mjs` が生成、`npm run images:check` で検証）。CSS の `img { height: auto }` と各所の `aspect-ratio` / `object-fit` で表示サイズを決めており、`width`/`height` 属性は縦横比の予約にだけ使う。Hero の 1 枚目のみ `priority`、他のスライドは `loading="eager"`（フェード切替で遅延読み込みが見えるのを避けるため）。`sizes` は配置ごとに指定している。
スクロール表示は `Reveal`（IntersectionObserver で `.reveal` に `.in` を付与）。

## 既知の事項

- ビルド警告: `globals.css` の autoprefixer 警告（`end value has mixed support, consider using flex-end`）が 1 件。動作には影響なし。
- ESLint 9（`eslint.config.mjs`、`next/core-web-vitals` + `next/typescript`）。テストフレームワークはなし。品質ゲートは `npm run verify` と `npm run smoke`。
- 画像は現行サイトから取得した Web 用解像度。高解像度の元データへの差し替えは未了。
