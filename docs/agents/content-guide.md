# コンテンツ更新ガイド

文言・画像・お知らせの変更は、原則コードを書かずに `content/` と `public/` だけで完結する。

## 文言・リンク・営業時間などの変更

`content/site.ts` の該当オブジェクトを編集する。対応表は `architecture.md` を参照。
確認事項:
- 住所・電話・FAX は `site` に集約されており、会社案内・Contact・Footer はそこを参照する。ただし水産部の電話・FAX は `suisan.contact` に別管理。変更時は `grep -rn "0799-38" content app components` で取りこぼしを確認する（`news.json` の本文に番号が含まれる場合もある）。
- 料金（工場見学 1,650 円、体験 1,980 円など）は事実情報。出典なしに変えない。

## お知らせの追加

`content/news.json` の **先頭** に追加する（新しい順で表示され、トップは先頭 6 件）。

```json
{ "date": "2026-10-16", "title": "見出し", "category": "NEWS", "note": "補足（なければ空文字）" }
```

- `date` は `YYYY-MM-DD`。`category` は `"NEWS"` か `"BLOG"` のみ（型は `NewsItem`）。
- 追加後は `npm run verify`。型エラーが出たら形式の誤り。
- 手順化したものが `.claude/skills/add-news/`。

## 画像の追加・差し替え

1. ファイルを `public/images/tatsumi/` に置く（JPG/PNG。ファイル名は小文字・ハイフン区切り）。
2. `npm run images:sizes` を実行して `content/image-sizes.json` を更新する（`next/image` に必要な寸法。未登録の画像を `img()` で参照するとビルドが落ち、寸法がズレていると `npm run verify` が落ちる）。
3. `content/site.ts` で `img("ファイル名", "日本語の alt")` を使って参照する。
4. 同名で上書きする場合は、縦横比が大きく変わらないか確認する（`aspect-ratio` で切り抜いている箇所が多い）。
5. 出典・権利が不明な画像は入れない。

## 人間への確認が必要な項目（推測で埋めない）

| 項目 | 場所 |
|---|---|
| 見学・体験の予約サイト URL | `site.reserveUrl`（現在 `#`） |
| Instagram / LINE の URL | `site.instagram`, `site.line`（現在 `#`） |
| 設立年・代表者名・資本金・沿革 | `company.rows`（TODO コメントあり） |
| 水産部の「成分と効用」 | 意図的に非掲載（薬機法・景表法） |
| 本番ドメイン | `site.url` |

`#` のままのリンクは、UI 上は押しても何も起きない。人間から値をもらったら差し替える。
