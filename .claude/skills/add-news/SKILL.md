---
name: add-news
description: content/news.json にお知らせを追加する。サイトのお知らせ・休業案内・新商品告知などを載せるときに使う。
---

# add-news

## 入力として必要なもの

- 日付（`YYYY-MM-DD`）、見出し、カテゴリ（`NEWS` または `BLOG`）、補足（任意）
- **情報源が与えられていない内容は書かない**（休業日・料金などの事実を推測で作らない）。足りなければ人間に聞く。

## 手順

1. `content/news.json` を読み、既存の書式（インデント、キー順）に合わせる。
2. 配列の **先頭** に新しい項目を追加する（新しい順で表示される。トップは先頭 6 件）。

   ```json
   { "date": "YYYY-MM-DD", "title": "見出し", "category": "NEWS", "note": "" }
   ```

   `note` がなければ空文字にする（キーは省略しない）。
3. JSON として正しいか確認する: `node -e "JSON.parse(require('fs').readFileSync('content/news.json','utf8'))"`
4. `npm run verify` を実行する（型 `NewsItem` に合わないとここで落ちる）。
5. 表示を確認する: トップのお知らせ欄と `/news` に先頭で出ること。
6. ブランチを切ってコミットし、ドラフト PR を作る。
