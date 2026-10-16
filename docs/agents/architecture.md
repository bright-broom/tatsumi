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

- 検証は `lib/contactSchema.ts`（zod）。`contactFormSchema`（フォーム項目。ブラウザの `zodResolver` でも使う）と、それに `startedAt` を足した `contactSchema`（API が受け取る本文）がある。
  - 必須: `name`, `email`, `message`, `confirmed`（確認チェック。`true` のみ可）。任意: `tel`（数字・`+-() ` のみ）。
  - `hp_url_confirm` はハニーポット（画面外に置いた空欄。ブラウザの自動入力に反応しないよう `company` などの名前は避けている）。
  - `startedAt` はフォームを開いた時刻（epoch ms）。`ContactForm` が送信時に付ける。
- スパム対策（`lib/spamGuard.ts` + `app/api/contact/route.ts`）。上から順に判定する:

  | 判定 | 結果 | 備考 |
  |---|---|---|
  | 本文が 20KB 超 | 413 | `Content-Length` と実サイズの両方を見る |
  | `Origin` が自サイトと違う | 403 | `Origin` なし（curl 等）は許可 |
  | 同一 IP が 10 分で 11 回目 | 429 + `Retry-After` | 検証エラーも回数に数える |
  | スキーマ違反 | 400 | |
  | 画面を開いて 2 秒未満で送信 | 400 `reason: "too_fast"` | 人間なら数秒後の再送で通るので、画面にその旨を表示 |
  | ハニーポットに値あり | 200（破棄） | bot に失敗を教えないため成功を装う。ログに `dropped` |
  | URL が 3 個以上 | 200（破棄） | 同上 |

- 限界（人間に伝えること）:
  - レート制限はプロセス内メモリ。サーバーレス（Vercel）ではインスタンスごとに数えるので、大量送信の抑止にはなるが厳密な上限ではない。厳密にするなら Upstash / Vercel KV 等の共有ストアが必要。
  - IP は `x-real-ip` / `x-forwarded-for` から取る。Vercel では信頼できるが、自前ホスティングでは偽装できる。
  - `startedAt` と `Origin` は、APIを直接叩く標的型の bot には偽装できる。最終的な対策は CAPTCHA（Cloudflare Turnstile 等）で、アカウント・キーの用意と、第三者スクリプト読み込みのプライバシーポリシーへの記載が必要（現状 `/privacy` は本文が未掲載）。**人間に確認してから**導入する。
- `RESEND_API_KEY` と `CONTACT_TO` がそろえば Resend で送信（失敗・到達不能は 502）。未設定ならログ出力のみで `{ ok: true, delivered: false }` を返す。
- 送信元は `CONTACT_FROM`（省略時 `株式会社タツミ <noreply@tatsumi-oni.co.jp>`）。件名・本文に入れる 1 行項目は改行・制御文字を除去する。
- `npm run smoke` はダミーの Resend 設定でサーバーを起動し、「送信を試みた = 502」「bot として破棄 = 200」の違いで上記の振り分けを検証する（実際にメールは送られない）。

## スタイル

`app/globals.css` 1 枚（約 200 行）。フォントは `next/font/google` で Shippori Mincho / Zen Kaku Gothic New / IBM Plex Mono を取得。
ビルド時に Google Fonts へアクセスするため、**ネットワークが遮断された環境では `npm run build` が失敗する**。
画像は `components/Pic.tsx`（`next/image`）で描画する。寸法は `content/image-sizes.json`（`scripts/image-sizes.mjs` が生成、`npm run images:check` で検証）。CSS の `img { height: auto }` と各所の `aspect-ratio` / `object-fit` で表示サイズを決めており、`width`/`height` 属性は縦横比の予約にだけ使う。Hero の 1 枚目のみ `priority`、他のスライドは `loading="eager"`（フェード切替で遅延読み込みが見えるのを避けるため）。`sizes` は配置ごとに指定している。
スクロール表示は `Reveal`（IntersectionObserver で `.reveal` に `.in` を付与）。

## 既知の事項

- ビルド警告: `globals.css` の autoprefixer 警告（`end value has mixed support, consider using flex-end`）が 1 件。動作には影響なし。
- ESLint 9（`eslint.config.mjs`、`next/core-web-vitals` + `next/typescript`）。テストフレームワークはなし。品質ゲートは `npm run verify` と `npm run smoke`。
- 画像は現行サイトから取得した Web 用解像度。高解像度の元データへの差し替えは未了。
