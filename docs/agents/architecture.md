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
  | Turnstile（`TURNSTILE_SECRET_KEY` 設定時のみ） | トークンなし 400 `captcha_required` / 検証失敗 403 `captcha_failed` / Cloudflare に到達不能 503 `captcha_unavailable` | 外部通信を伴うので、安い判定をすべて通った後に行う（bot の破棄では Cloudflare を呼ばない） |

- 限界（人間に伝えること）:
  - レート制限はプロセス内メモリ。サーバーレス（Vercel）ではインスタンスごとに数えるので、大量送信の抑止にはなるが厳密な上限ではない。厳密にするなら Upstash / Vercel KV 等の共有ストアが必要。
  - IP は `x-real-ip` / `x-forwarded-for` から取る。Vercel では信頼できるが、自前ホスティングでは偽装できる。
  - `startedAt` と `Origin` は、API を直接叩く標的型の bot には偽装できる。それを止めるのが Turnstile（下記。キーを設定したときだけ有効）。
- **Turnstile（Cloudflare の CAPTCHA）**: 既定は無効。2 つの環境変数を**両方**設定したときだけ有効になる。
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`（公開してよい値。**ビルド時に埋め込まれる**ので、変更後は再デプロイが必要）→ フォームにウィジェットを表示し、トークン取得まで送信ボタンを無効化する（`components/Turnstile.tsx`）。Cloudflare のスクリプトはこのキーがあるときだけ読み込む。
  - `TURNSTILE_SECRET_KEY`（秘密。サーバー側のみ）→ `lib/turnstile.ts` が siteverify でトークンを検証する。トークンは 1 回限りなので、フォームは送信のたびにウィジェットを取り直す。
  - どちらか片方だけだと壊れる（サイトキーのみ → 送信が通るが検証されない。シークレットのみ → ウィジェットがなく常に 400）。**必ず両方**。
  - Cloudflare に到達できないときは fail closed（503）。可用性より CAPTCHA の意味を優先している。
  - 導入前に必要なこと: ① Cloudflare でサイトを作りキーを発行（人間） ② `/privacy` に Cloudflare Turnstile の利用を記載（現状 `/privacy` は本文未掲載のため、クライアント確認が先）。
  - テストには Cloudflare の公式テストキー（サイトキー `1x00000000000000000000AA` / シークレット `1x0000000000000000000000000000000AA`、常に成功）が使える。
  - **本物の Cloudflare との疎通は自動テストで確認していない**（この開発環境から Cloudflare に接続できないため）。`npm run smoke` はローカルのモックを `TURNSTILE_VERIFY_URL` で差し込んで、リクエスト形式と結果ごとの振り分けだけを検証する（`TURNSTILE_VERIFY_URL` はテスト専用。本番では設定しない）。本番でキーを設定したら、実際に 1 通送って確認すること。
- `RESEND_API_KEY` と `CONTACT_TO` がそろえば Resend で送信（失敗・到達不能は 502）。未設定ならログ出力のみで `{ ok: true, delivered: false }` を返す。
- 送信元は `CONTACT_FROM`（省略時 `株式会社タツミ <noreply@tatsumi-oni.co.jp>`）。件名・本文に入れる 1 行項目は改行・制御文字を除去する。
- `npm run smoke` は `node_modules/.bin/next` を直接起動する（`npx` 経由だと終了時に next-server が残り、次回の実行が古いサーバーに繋がって不安定になる）。ダミーの Resend 設定でサーバーを起動し、「送信を試みた = 502」「bot として破棄 = 200」の違いで上記の振り分けを検証する（実際にメールは送られない）。

## スタイル

`app/globals.css` 1 枚（約 200 行）。フォントは `next/font/google` で Shippori Mincho / Zen Kaku Gothic New / IBM Plex Mono を取得。
ビルド時に Google Fonts へアクセスするため、**ネットワークが遮断された環境では `npm run build` が失敗する**。
画像は `components/Pic.tsx`（`next/image`）で描画する。寸法は `content/image-sizes.json`（`scripts/image-sizes.mjs` が生成、`npm run images:check` で検証）。CSS の `img { height: auto }` と各所の `aspect-ratio` / `object-fit` で表示サイズを決めており、`width`/`height` 属性は縦横比の予約にだけ使う。Hero の 1 枚目のみ `priority`、他のスライドは `loading="eager"`（フェード切替で遅延読み込みが見えるのを避けるため）。`sizes` は配置ごとに指定している。
スクロール表示は `Reveal`（IntersectionObserver で `.reveal` に `.in` を付与）。

## アクセシビリティ

- スマホのメニュー（`.drawer`）は閉じている間 `inert`。開くと閉じるボタンへ、閉じると開くボタンへフォーカスを移す（Escape でも閉じる）。`aria-hidden` だけでは中のリンクにキーボードで入れてしまう。
- 文章中のリンク（電話番号）は色だけに頼らず下線を付ける（`a.tel`）。
- 暗い背景（`.page-head`、`.dark` セクション）のラベルは `--accent-dark`。明るい背景用の `--accent` だとコントラストが 2.9:1 で不足する。
- キャプション付きの一覧では画像の `alt` を `""` にする（キャプションと二重読み上げになるため。`Pic` の `alt` で上書き）。
- 色を足すときは、背景ごとにコントラスト比 4.5:1（大きな文字は 3:1）を満たすか確認する。
- `aria-label` で見えている文字と別の名前を付けない（WCAG 2.5.3 Label in Name。ロゴリンクはこれで違反していたので、名前は見えている文字から取る）。
- **`npm run a11y`**（`scripts/a11y.mjs`）が CI で退行を防ぐ。axe-core（WCAG 2.0/2.1/2.2 A・AA + best-practice）を、全ページ × PC/スマホ、スマホのメニュー開、PC のフォームのエラー表示で走査し、違反が 1 件でもあれば失敗する。ページや状態（モーダルなど）を足したら `scripts/a11y.mjs` の走査対象にも足す。Playwright は devDependency（バージョンはサンドボックスの Chromium に合わせて固定）。

## SEO・セキュリティ設定

- `app/robots.ts` / `app/sitemap.ts`（`site.url` を基準に生成）。**ページを追加したら `app/sitemap.ts` の `paths` にも足す**（`npm run smoke` が 3 件であることを確認するので、件数も更新する）。
- canonical は `app/layout.tsx` の `alternates.canonical: "./"` でページごとに付く。
- 構造化データ: トップに schema.org `LocalBusiness`（`lib/structuredData.ts`）。値は `content/site.ts` の確定済み項目（社名・住所・電話・FAX・画像）だけ。営業時間などは確認が取れてから足す。
- セキュリティヘッダー（`next.config.ts`）: `X-Content-Type-Options: nosniff` / `X-Frame-Options: DENY` / `Referrer-Policy: strict-origin-when-cross-origin` / `Permissions-Policy`（カメラ等を無効化）。`X-Powered-By` は無効。HSTS はホスティング（Vercel）側に任せている。
- **CSP（Content-Security-Policy）は未設定。** Next の inline スクリプト用に nonce が必要で、Turnstile・Google Maps の iframe も許可リストが要るため、実際にキーを設定して動作を確認できる段階で入れる（先に入れると本番のフォームや地図が壊れるリスクがある）。
- **favicon は未設定**（`/favicon.ico` は 404）。手元の `logo.png` は 169×40 の横長ワードマークで、そのまま使うとぼやける。クライアントから正方形のシンボルマーク（SVG か 512px 以上）をもらい、`app/icon.png`（または `app/icon.svg`）と `app/apple-icon.png` に置く。

## 既知の事項

- ビルド警告は 0 件（`align-items: end` を flex 側で `flex-end` にして解消済み）。新規の警告は直す。
- 依存の脆弱性: `npm audit --omit=dev` は 0 件。Next 15.5 は PostCSS 8.4.31 を固定で同梱しており、これに既知の脆弱性（PostCSS 8.5.22 以下）があるため、`package.json` の `overrides` で `next` が使う PostCSS を `^8.5.30` に上げている。ビルド後の CSS が上書き前とバイト単位で同一であることを確認済み。**Next を更新して PostCSS 8.5.23 以上を同梱するようになったら `overrides` を削除する。** 週次の Dependabot（`.github/dependabot.yml`、メジャー更新は除外）が更新を提案する。
- ESLint 9（`eslint.config.mjs`、`next/core-web-vitals` + `next/typescript`）。テストフレームワークはなし。品質ゲートは `npm run verify` と `npm run smoke`。
- 画像は現行サイトから取得した Web 用解像度。高解像度の元データへの差し替えは未了。
