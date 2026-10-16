# 株式会社タツミ コーポレートサイト

兵庫県伝統的工芸品「淡路鬼瓦」指定窯元・株式会社タツミ（https://tatsumi-oni.co.jp）のサイトです。
Next.js 15（App Router）+ React 19 + TypeScript。Vercel にそのままデプロイできます。

## ページ構成

ワンページ（`app/page.tsx`）に次のセクションが並びます。

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

サブページ: `/news`（お知らせ一覧）、`/privacy`（プライバシーポリシー）

## 使用ライブラリ

| 用途 | ライブラリ |
|---|---|
| Hero フェードスライダー | embla-carousel-react（+ autoplay / fade） |
| ギャラリー拡大表示 | yet-another-react-lightbox |
| お問い合わせフォーム | react-hook-form + zod（`lib/contactSchema.ts`） |
| クラス結合 | clsx |

## ディレクトリ

```
app/            ページ・レイアウト・グローバル CSS・API（api/contact）
components/     Header / Hero / Gallery / ContactForm / Footer / Reveal
content/        site.ts（全テキスト・画像参照）, news.json（お知らせ）
lib/            contactSchema.ts（フォーム検証）
public/images/tatsumi/   サイトで使う画像
```

## コンテンツの更新

- **テキスト・リンク・営業時間・体験メニューなど**: `content/site.ts` に集約されています。
- **お知らせ**: `content/news.json` に `{ date, title, category("NEWS" | "BLOG"), note }` を追加します（トップには新しい順で 6 件表示、全件は `/news`）。
- **画像**: `public/images/tatsumi/` に置き、`content/site.ts` の `img("ファイル名", "alt テキスト")` で参照します。
- **ナビゲーション**: `content/site.ts` の `nav`。

### 未確定の項目（`content/site.ts` の TODO）

- `site.reserveUrl` — 工場見学・ワークショップ予約専用サイトの URL（現在 `#`）
- `site.instagram` / `site.line` — 公式アカウント URL（現在 `#`）
- `company` — 設立年・代表者名・資本金・沿革
- 画像は現行サイトから取得した Web 用解像度です。本番前に元データへの差し替えを推奨します。
- 水産部の「成分と効用」は薬機法・景表法の観点で掲載を見送っています（要クライアント確認）。

## お問い合わせメール

`POST /api/contact` が入力を検証し、環境変数が設定されていれば Resend 経由でメール送信します。
未設定の場合はサーバーログに出力するだけです（開発・プレビュー用）。

```
RESEND_API_KEY=...
CONTACT_TO=info@your-domain.jp
CONTACT_FROM="株式会社タツミ <noreply@your-domain.jp>"   # 省略時は noreply@tatsumi-oni.co.jp
```

## 開発

```
npm install
npm run dev        # http://localhost:3000（Turbopack）
npm run typecheck
npm run build
npm run verify    # typecheck + build（変更後の標準チェック）
npm run smoke     # build 後に主要ルートと /api/contact を確認
```

> ESLint は未設定のため `npm run lint` は使えません（対話プロンプトで止まります）。

## デプロイ（Vercel）

GitHub に push → Vercel で Import（Framework: Next.js、設定変更不要）→ 上記の環境変数を登録。
`content/site.ts` の `site.url` が OGP の絶対 URL に使われます。

## エージェント向けドキュメント

`CLAUDE.md`（入口）/ `AGENTS.md` / `docs/agents/`（architecture・content-guide・workflow）/ `.claude/skills/`（verify・add-news）。
CI は `.github/workflows/ci.yml`（`verify` + `smoke`）。
