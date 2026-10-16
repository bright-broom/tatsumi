# CLAUDE.md — 株式会社タツミ コーポレートサイト

淡路鬼瓦の指定窯元・株式会社タツミのコーポレートサイト。Next.js 15 (App Router) / React 19 / TypeScript。DB・認証なし。
人間向けの概要は `README.md`、エージェント向けの詳細は `docs/agents/` を参照（他のエージェント用の入口は `AGENTS.md`）。

## コマンド

| 目的 | コマンド | 備考 |
|---|---|---|
| 依存導入 | `npm ci` | |
| 開発サーバー | `npm run dev` | http://localhost:3000 |
| 型チェック | `npm run typecheck` | 数秒 |
| Lint | `npm run lint` | ESLint 9 + `next/core-web-vitals` + `next/typescript`。警告 0 件を維持（`--max-warnings 0`） |
| 本番ビルド | `npm run build` | 約 40 秒。Google Fonts を取得するので外部ネットワークが必要 |
| 画像寸法 | `npm run images:sizes` | `public/images/tatsumi/` に画像を追加・差し替えたら実行し、`content/image-sizes.json` をコミット |
| **標準の検証** | `npm run verify` | typecheck + lint + 画像寸法チェック + build。変更後は必ずこれを通す |
| スモークテスト | `npm run smoke` | `build` 後に実行。主要ルートと `/api/contact` を確認 |

ESLint の設定は `eslint.config.mjs`。ルールを無効化して通すのではなく、コードを直す。やむを得ず無効化する場合は理由をコメントに書く（現在、無効化しているルールはない）。
テストフレームワークはない。品質ゲートは `verify` + `smoke`。

## 構造（要点）

- `content/site.ts` … 全テキスト・リンク・画像参照の **唯一の情報源**。文言変更はほぼここだけで済む。
- `content/news.json` … お知らせ（新しい順。トップは先頭 6 件、`/news` は全件）。
- `app/page.tsx` … ワンページ本体。`content/site.ts` の各オブジェクトを 01〜11 のセクションに描画。
- `app/api/contact/route.ts` + `lib/contactSchema.ts` + `lib/spamGuard.ts` … お問い合わせ。スパム対策（サイズ・Origin・レート制限・検証・送信時間・ハニーポット・リンク検出）→ Resend で送信（環境変数未設定ならログのみ）。判定順と限界は `docs/agents/architecture.md`。
- `components/` … Header / Hero / Gallery / ContactForm / Footer / Reveal。クライアントコンポーネントは `"use client"` 付きのみ。
- `app/globals.css` … スタイルはここ 1 枚（CSS Modules / Tailwind は不使用）。
- `public/images/tatsumi/` … 画像。`content/site.ts` から `img("ファイル名", "alt")` で参照。寸法は `content/image-sizes.json`（生成物）から引く。
- `components/Pic.tsx` … `next/image` のラッパー。**`<img>` を直接書かない**（lint ではなく規約）。`sizes` は必ず指定する。

詳細: `docs/agents/architecture.md`、コンテンツ更新手順: `docs/agents/content-guide.md`。

## 規約

- 型は strict。`any` を使わない。import は `@/` エイリアス。
- 文言・URL・画像パスを JSX に直書きしない。`content/site.ts` に足して参照する。
- 画像には必ず意味のある `alt` を付ける（日本語）。
- 新しい依存を足す前に、既存ライブラリ（embla / yet-another-react-lightbox / react-hook-form / zod / clsx）で足りないか確認する。
- コミットメッセージは英語の命令形で簡潔に。日本語の PR 説明は可。

## 触ってはいけない / 人間の確認が必要なもの

- `content/site.ts` の TODO（`reserveUrl`, `instagram`, `line`、会社概要の設立年・代表者・資本金・沿革）は **推測で埋めない**。クライアント確認事項。
- 水産部の「成分と効用」は薬機法・景表法の観点で意図的に非掲載。復活させない。
- `site.url`（OGP の絶対 URL）、`.env*`、Resend の送信元ドメインは本番設定。勝手に変えない。
- 画像の差し替え・追加は権利確認が前提。出典不明の画像を入れない。
- `main` へ直接 push しない。ブランチを切って PR（ドラフト）を作る。
- **ホスティング（Vercel）の設定やシークレットには触れない。**

## 完了の定義

1. `npm run verify` が通る（警告の増減も確認。既存の autoprefixer 警告 1 件は既知）。
2. 動作に影響する変更は `npm run build && npm run smoke` も通る。
3. UI 変更は実際に表示して確認（`npm run dev` またはビルド後の `next start`）。型が通ることは見た目が正しい証拠にならない。
4. `git status` が意図した差分だけ。`dev.log` などのログ、`.next`、`node_modules` をコミットしない。
