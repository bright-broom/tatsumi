# AGENTS.md

このリポジトリのエージェント向け指示は **`CLAUDE.md`** にまとめてあります。まずそれを読んでください。
詳細ドキュメントは `docs/agents/` にあります（architecture / content-guide / workflow）。

最低限のルール:
- 変更後は `npm run verify`（typecheck + lint + build）を通す。lint は警告 0 件を維持する。
- 文言・URL・画像参照は `content/site.ts` に集約。JSX に直書きしない。
- TODO の項目（予約 URL・SNS・会社概要の詳細）は推測で埋めない。
- `main` に直接 push せず、ブランチ + ドラフト PR で出す。
