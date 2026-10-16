# 株式会社タツミ コーポレートサイト

兵庫県伝統的工芸品「淡路鬼瓦」指定窯元・株式会社タツミ（https://tatsumi-oni.co.jp）のサイトです。
Next.js 15（App Router）+ React 19 + TypeScript。Vercel にそのままデプロイできます。DB・認証はありません。

> 図は [Mermaid](https://mermaid.js.org/) で書いています（GitHub 上でそのまま表示されます）。

## 目次

[全体像](#全体像) ・ [ページ構成](#ページ構成) ・ [コンテンツの更新](#コンテンツの更新) ・ [画像の扱い](#画像の扱い) ・ [お問い合わせフォーム](#お問い合わせフォーム) ・ [開発](#開発) ・ [CI と品質ゲート](#ci-と品質ゲート) ・ [デプロイ](#デプロイvercel) ・ [環境変数](#環境変数) ・ [ディレクトリ](#ディレクトリ)

---

## 全体像

文言・お知らせ・画像は `content/` と `public/` に置き、ページはそれを読んで静的に生成します。サーバー処理は問い合わせ API の 1 本だけです。

```mermaid
flowchart LR
  subgraph Content["コンテンツ（編集するのはここ）"]
    site["content/site.ts<br/>全テキスト・リンク・画像参照"]
    news["content/news.json<br/>お知らせ"]
    imgs["public/images/tatsumi/<br/>画像"]
    sizes["content/image-sizes.json<br/>画像の寸法（自動生成）"]
  end

  subgraph Pages["ページ（ビルド時に静的生成）"]
    home["/<br/>ワンページ"]
    newsp["/news"]
    priv["/privacy"]
    seo["/robots.txt<br/>/sitemap.xml"]
  end

  subgraph Server["サーバー処理（唯一）"]
    api["POST /api/contact"]
  end

  site --> home
  site --> newsp
  site --> seo
  news --> home
  news --> newsp
  imgs --> opt["/_next/image<br/>WebP / AVIF に最適化"]
  sizes --> site
  opt --> home

  form["ContactForm<br/>ブラウザ"] -->|"JSON"| api
  api -.->|"任意"| cf["Cloudflare Turnstile"]
  api -->|"環境変数があれば"| resend["Resend<br/>メール送信"]

  classDef edit fill:#fff4d6,stroke:#c9a227,color:#222
  class site,news,imgs edit
```

| 区分 | 技術 |
|---|---|
| フレームワーク | Next.js 15（App Router）/ React 19 / TypeScript（strict） |
| スタイル | `app/globals.css` 1 枚（CSS Modules / Tailwind は不使用） |
| 画像 | `next/image`（`components/Pic.tsx` 経由） |
| フォーム | react-hook-form + zod（フォームとサーバーで同じスキーマ） |
| スライダー / 拡大表示 | embla-carousel（autoplay・fade）/ yet-another-react-lightbox |
| 品質 | ESLint 9・tsc・スモークテスト・GitHub Actions |

---

## ページ構成

トップは 1 ページに次のセクションが縦に並びます。ヘッダーのナビは `#onigawara #products #kaze #gallery #visit #company` へのアンカーです。

```mermaid
flowchart TB
  hero["Hero<br/>フェードスライダー + 実績の数字"]
  s01["01 Philosophy"]
  s02["02 淡路鬼瓦 特注品の製作<br/>#onigawara"]
  s03["03 取扱商品<br/>#products"]
  s04["04 瓦風 -kaze-<br/>#kaze"]
  s05["05 Ibushi Gallery 瓦廊<br/>#gallery"]
  s06["06 見学・体験<br/>#visit"]
  s07["07 オンラインショップ<br/>#shop"]
  s08["08 淡路瓦の歴史<br/>#history"]
  s09["09 水産部 + SDGs<br/>#suisan"]
  s10["10 お知らせ<br/>#news"]
  s11["11 会社案内 + 地図<br/>#company"]
  contact["お問い合わせ<br/>#contact"]
  hero --> s01 --> s02 --> s03 --> s04 --> s05 --> s06 --> s07 --> s08 --> s09 --> s10 --> s11 --> contact
```

| # | セクション | ID | データ（`content/site.ts`） |
|---|---|---|---|
| – | Hero（スライダー） | – | `hero` |
| 01 | Philosophy | – | `about` |
| 02 | 淡路鬼瓦 特注品の製作 | `#onigawara` | `onigawara` |
| 03 | 取扱商品 | `#products` | `products` |
| 04 | 瓦風 -kaze- | `#kaze` | `kaze` |
| 05 | Ibushi Gallery 瓦廊 | `#gallery` | `gallery` |
| 06 | 見学・体験（工場見学／ワークショップ） | `#visit` | `visit` |
| 07 | オンラインショップ | `#shop` | `shop` |
| 08 | 淡路瓦の歴史 | `#history` | `history` |
| 09 | 水産部 ＋ SDGs | `#suisan` | `suisan`, `sdgs` |
| 10 | お知らせ | `#news` | `news`（`content/news.json`） |
| 11 | 会社案内（地図つき） | `#company` | `company` |
| – | お問い合わせ | `#contact` | `site`, `ContactForm` |

サブページ: `/news`（お知らせ一覧）、`/privacy`（プライバシーポリシー）。
SEO: `/robots.txt`・`/sitemap.xml`、全ページの canonical、トップの構造化データ（LocalBusiness）。

---

## コンテンツの更新

コードを書かずに `content/` と `public/` だけで更新できます。何を変えたいかで、触るファイルが決まります。

```mermaid
flowchart TD
  start(["何を変える？"]) --> q{"変更の種類"}
  q -->|"文言・リンク・営業時間・料金<br/>体験メニュー・ナビ"| a["content/site.ts を編集"]
  q -->|"お知らせを追加"| b["content/news.json の<br/>先頭に 1 件追加"]
  q -->|"画像を追加・差し替え"| c["public/images/tatsumi/ に置く"]
  c --> c2["npm run images:sizes"]
  c2 --> c3["content/site.ts で<br/>img に ファイル名と alt を書く"]
  a --> v
  b --> v
  c3 --> v["npm run verify"]
  v --> pr["ブランチ → Pull Request"]
```

- **お知らせ**: `{ date, title, category("NEWS" | "BLOG"), note }`。トップには新しい順に 6 件、全件は `/news` に出ます。
- **画像**: 必ず意味のある日本語の `alt` を付けます。出典・権利が不明な画像は入れないでください。
- 住所・電話・FAX は `site` に集約されています（会社案内・お問い合わせ・フッターはそこを参照）。水産部の電話・FAX だけ `suisan.contact` です。

### 未確定の項目（`content/site.ts` の TODO）

| 項目 | 場所 | 状況 |
|---|---|---|
| 見学・体験の予約サイト URL | `site.reserveUrl` | 現在 `#`（クライアント確認待ち） |
| Instagram / LINE | `site.instagram` / `site.line` | 現在 `#`（クライアント確認待ち） |
| 設立年・代表者名・資本金・沿革 | `company` | 未記入 |
| favicon | `app/icon.*` | 未設定。正方形のシンボルマーク（SVG か 512px 以上）が必要 |
| 画像の解像度 | `public/images/tatsumi/` | 現行サイトの Web 用解像度。本番前に元データへ差し替え推奨 |
| 水産部の「成分と効用」 | – | 薬機法・景表法の観点で掲載を見送り（要クライアント確認） |
| プライバシーポリシー本文 | `/privacy` | 未掲載（Turnstile を有効にする前に必要） |

---

## 画像の扱い

すべての画像は `next/image` で表示し、配信時に WebP / AVIF へ変換されます（例: 384KB の JPG が 14〜23KB）。`next/image` に必要な寸法は `content/image-sizes.json` に自動生成して持ち、**画像を足したら生成し直す**運用です。

```mermaid
flowchart LR
  add["画像を<br/>public/images/tatsumi/ に追加"] --> gen["npm run images:sizes"]
  gen --> json["content/image-sizes.json<br/>幅 x 高さ"]
  json --> imgfn["site.ts の img()<br/>ファイル名 から 寸法を引く"]
  imgfn --> pic["components/Pic.tsx<br/>next/image + sizes"]
  pic --> req["/_next/image?w=…"]
  req --> out["WebP / AVIF で配信"]

  check{{"npm run verify"}} -.->|"寸法がズレていたら失敗"| json
  imgfn -.->|"未登録ならビルド失敗"| gen
```

`<img>` を直接書かず、`Pic` を使います（`sizes` は配置ごとに必須）。Hero の 1 枚目だけ `priority`、残りのスライドは先読みです。

---

## お問い合わせフォーム

`POST /api/contact` は、外部サービスを使わない多層のスパム対策を持ち、任意で Cloudflare Turnstile を足せます。環境変数がそろえば Resend でメールを送ります（未設定ならサーバーログに出すだけで、開発・プレビュー向けです）。

### 送信の流れ

```mermaid
sequenceDiagram
  autonumber
  participant U as 訪問者
  participant F as ContactForm<br/>ブラウザ
  participant A as /api/contact
  participant C as Cloudflare<br/>Turnstile 任意
  participant R as Resend

  U->>F: フォームを開く
  Note over F: 開いた時刻 startedAt を保持
  opt Turnstile 有効時のみ
    F->>C: ウィジェット読み込み
    C-->>F: トークン（送信ボタンはそれまで無効）
  end
  U->>F: 入力して送信
  F->>A: JSON と startedAt と turnstileToken
  A->>A: スパム判定（次の図）
  opt Turnstile 有効時のみ
    A->>C: トークンを検証
    C-->>A: 成功 / 失敗
  end
  alt メール設定あり
    A->>R: メール送信
    R-->>A: 結果
  else 未設定
    A->>A: ログ出力のみ
  end
  A-->>F: 結果
  F->>F: トークンを取り直す（1 回限り）
  F-->>U: 完了 / エラー表示
```

### スパム判定の順序

上から順に判定します。安い判定を先に、外部通信を伴うものを最後に置いています。

```mermaid
flowchart TD
  req(["POST /api/contact"]) --> s1{"本文が 20KB 超"}
  s1 -->|"はい"| r413["413"]
  s1 -->|"いいえ"| s2{"Origin が<br/>自サイトと違う"}
  s2 -->|"はい"| r403a["403"]
  s2 -->|"いいえ"| s3{"同一 IP が 10 分で<br/>11 回目以降"}
  s3 -->|"はい"| r429["429 + Retry-After"]
  s3 -->|"いいえ"| s4{"スキーマ違反<br/>必須項目・形式・確認チェック"}
  s4 -->|"はい"| r400a["400"]
  s4 -->|"いいえ"| s5{"フォームを開いて<br/>2 秒未満"}
  s5 -->|"はい"| r400b["400 too_fast<br/>画面に再送を促す"]
  s5 -->|"いいえ"| s6{"ハニーポットに値あり<br/>または URL が 3 個以上"}
  s6 -->|"はい"| drop["200 で成功を装い破棄<br/>bot に失敗を教えない"]
  s6 -->|"いいえ"| s7{"Turnstile 有効"}
  s7 -->|"はい"| t{"トークン検証"}
  t -->|"なし"| r400c["400 captcha_required"]
  t -->|"不正"| r403b["403 captcha_failed"]
  t -->|"Cloudflare に届かない"| r503["503 captcha_unavailable<br/>fail closed"]
  t -->|"成功"| s8
  s7 -->|"いいえ"| s8{"Resend の設定あり"}
  s8 -->|"なし"| ok0["200 delivered false<br/>ログのみ"]
  s8 -->|"あり"| send{"送信"}
  send -->|"成功"| ok1["200 delivered true"]
  send -->|"失敗・到達不能"| r502["502"]

  classDef bad fill:#fde2e2,stroke:#c0392b,color:#222
  classDef good fill:#e3f6e8,stroke:#2e8b57,color:#222
  classDef quiet fill:#eee,stroke:#888,color:#222
  class r413,r403a,r403b,r429,r400a,r400b,r400c,r503,r502 bad
  class ok1 good
  class ok0,drop quiet
```

**限界**: レート制限はサーバーのメモリ上で数えるため、Vercel ではインスタンスごとの集計です（厳密な上限は共有ストアが必要）。送信時間と `Origin` は、API を直接叩く標的型の bot には偽装できます。それを止めるのが Turnstile です。詳細は `docs/agents/architecture.md`。

### Cloudflare Turnstile（任意・既定は無効）

環境変数を **2 つとも**設定したときだけ有効になります（片方だけだと動きません）。未設定なら Cloudflare への通信は一切ありません。

```mermaid
flowchart LR
  a["Cloudflare で<br/>サイトを作成しキーを発行"] --> b["Vercel に環境変数を 2 つ設定"]
  b --> c["再デプロイ<br/>サイトキーはビルド時に埋め込み"]
  c --> d["/privacy に<br/>Turnstile の利用を記載"]
  d --> e["本番かプレビューで<br/>1 通送って確認"]
```

> 本物の Cloudflare との疎通は自動テストでは確認できていません（開発環境から接続できないため）。有効にしたら、必ず実際に 1 通送って確認してください。公式のテストキーなら先に試せます。

---

## 開発

```bash
npm install
npm run dev        # http://localhost:3000（Turbopack）
```

| コマンド | 内容 |
|---|---|
| `npm run typecheck` | 型チェック（`tsc --noEmit`） |
| `npm run lint` | ESLint（警告 0 件を維持） |
| `npm run images:sizes` | 画像の寸法を `content/image-sizes.json` に書き出す |
| `npm run images:check` | 寸法 JSON が画像と一致しているか検証 |
| `npm run build` | 本番ビルド（Google Fonts を取得するため外部ネットワークが必要） |
| **`npm run verify`** | **typecheck + lint + 画像寸法チェック + build（変更後の標準チェック）** |
| `npm run smoke` | build 後に実行。ルート・SEO・ヘッダー・画像最適化・問い合わせ API の全判定を確認 |
| `npm run a11y` | build 後に実行。axe-core で全ページを走査（PC/スマホ・メニュー開・フォームのエラー表示）。違反 0 件が条件。Chromium が要る（`npx playwright install chromium`） |

---

## CI と品質ゲート

PR と `main` への push で GitHub Actions が `verify`・`smoke`・`a11y` を実行します。Dependabot が依存の更新を週次で提案します（メジャー更新は除く）。

```mermaid
flowchart LR
  subgraph verify["npm run verify"]
    direction LR
    t["typecheck"] --> l["lint<br/>警告 0"] --> i["images:check"] --> b["build<br/>警告 0"]
  end
  pr(["Pull Request / main への push"]) --> ci["GitHub Actions"]
  ci --> verify
  verify --> sm["npm run smoke<br/>34 項目"]
  sm --> ax["npm run a11y<br/>axe-core 8 走査"]
  ax --> ok{"すべて成功"}
  ok -->|"はい"| merge["マージ可能"]
  ok -->|"いいえ"| fix["原因を直して再 push"]
  dep["Dependabot<br/>週次・メジャー除く"] -.-> pr
```

スモークテストは、本番ビルドを実際に起動して確認します。

```mermaid
flowchart TB
  smoke["npm run smoke"] --> g1["ルートと 404"]
  smoke --> g2["SEO<br/>robots・sitemap・canonical・JSON-LD"]
  smoke --> g3["セキュリティヘッダー<br/>nosniff・frame deny・referrer・x-powered-by なし"]
  smoke --> g4["画像最適化<br/>WebP で返る"]
  smoke --> g5["問い合わせ API<br/>送信試行 502 / 破棄 200 / 各エラー / レート制限"]
  smoke --> g6["Turnstile<br/>ローカルのモックで<br/>リクエスト形式と結果ごとの振り分け"]
```

メールは実際には送られません。ダミーの Resend 設定で起動し、「送信を試みた = 502」「bot として破棄 = 200」の違いで振り分けを検証します。

アクセシビリティは `npm run a11y`（axe-core + Playwright）が、本番ビルドを実ブラウザで走査します。違反が 1 件でもあれば失敗し、CI で退行を防ぎます。

```mermaid
flowchart LR
  run["npm run a11y"] --> std["基準<br/>WCAG 2.0 / 2.1 / 2.2 の A・AA<br/>+ axe best-practice"]
  run --> pages["通常表示<br/>/ ・ /news ・ /privacy<br/>x PC 1280 / スマホ 390"]
  run --> st1["スマホ<br/>メニューを開いた状態"]
  run --> st2["PC<br/>フォームのエラー表示<br/>未入力で送信"]
  pages --> res{"違反 0 件"}
  st1 --> res
  st2 --> res
  res -->|"はい"| okk["成功"]
  res -->|"いいえ"| ng["失敗 exit 1<br/>ルール・要素を表示"]
```

---

## デプロイ（Vercel）

1. GitHub に push → Vercel で Import（Framework: Next.js、設定変更不要）
2. 下の環境変数を登録して再デプロイ
3. `content/site.ts` の `site.url` が OGP・sitemap・canonical・構造化データの絶対 URL に使われます（本番ドメインであることを確認）

レスポンスには `X-Content-Type-Options` / `X-Frame-Options` / `Referrer-Policy` / `Permissions-Policy` を付けています（`next.config.ts`）。CSP は未設定です（Turnstile・地図の許可リストを確認できる段階で導入）。

## 環境変数

| 変数 | 必須 | 内容 |
|---|---|---|
| `RESEND_API_KEY` | メール送信に必要 | Resend の API キー（秘密） |
| `CONTACT_TO` | メール送信に必要 | 受信先アドレス |
| `CONTACT_FROM` | 任意 | 送信元。省略時は `株式会社タツミ <noreply@tatsumi-oni.co.jp>` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile 用 | 公開してよい値。**ビルド時に埋め込まれる**ので、設定後に再デプロイ |
| `TURNSTILE_SECRET_KEY` | Turnstile 用 | 秘密。**サイトキーと必ず両方**設定 |

`RESEND_API_KEY` と `CONTACT_TO` が未設定だと、問い合わせはメールで届かず、サーバーログに残るだけです。

---

## ディレクトリ

```text
.
├── app/
│   ├── page.tsx              ワンページ本体（content/site.ts を 01〜11 のセクションに描画）
│   ├── news/  privacy/       サブページ
│   ├── api/contact/route.ts  問い合わせ API
│   ├── robots.ts  sitemap.ts SEO
│   ├── layout.tsx            メタデータ・フォント・canonical
│   └── globals.css           スタイル（これ 1 枚）
├── components/               Header / Hero / Gallery / Pic / ContactForm / Turnstile / Footer / Reveal
├── content/
│   ├── site.ts               全テキスト・リンク・画像参照（唯一の情報源）
│   ├── news.json             お知らせ
│   └── image-sizes.json      画像の寸法（自動生成）
├── lib/                      contactSchema / spamGuard / turnstile / structuredData
├── public/images/tatsumi/    画像
├── scripts/                  smoke.sh / image-sizes.mjs
├── docs/agents/              エージェント向けの詳細ドキュメント
├── .claude/                  エージェント向けスキル（verify・add-news）と権限設定
└── .github/                  CI（ci.yml）と Dependabot
```

## エージェント向けドキュメント

AI エージェント（Claude Code など）で作業する場合の入口は **`CLAUDE.md`**（`AGENTS.md` から参照）です。詳細は `docs/agents/`:

| ファイル | 内容 |
|---|---|
| `architecture.md` | ルーティング・問い合わせ API の判定順と限界・SEO/セキュリティ設定・既知の事項 |
| `content-guide.md` | 文言・お知らせ・画像の更新手順と、推測で埋めてはいけない項目 |
| `workflow.md` | 自律作業の線引き（自分で決めてよいこと / 先に確認すること）と次の一手 |
