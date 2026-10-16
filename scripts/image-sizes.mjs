// public/images/tatsumi/ の全画像の寸法を content/image-sizes.json に書き出す。
// next/image に width/height を渡すために content/site.ts の img() が参照する。
//   node scripts/image-sizes.mjs          … JSON を更新
//   node scripts/image-sizes.mjs --check  … JSON が最新か検証（ズレていたら exit 1）
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { imageSize } from "image-size";

const DIR = "public/images/tatsumi";
const OUT = "content/image-sizes.json";

const sizes = {};
for (const name of readdirSync(DIR).sort()) {
  if (!/\.(jpe?g|png|webp|avif|gif)$/i.test(name)) continue;
  const { width, height } = imageSize(readFileSync(`${DIR}/${name}`));
  sizes[name] = [width, height];
}
const next = "{\n" + Object.entries(sizes).map(([k, v]) => ` ${JSON.stringify(k)}: [${v[0]}, ${v[1]}]`).join(",\n") + "\n}\n";

if (process.argv.includes("--check")) {
  let current = "";
  try { current = readFileSync(OUT, "utf8"); } catch {}
  if (current !== next) {
    console.error(`${OUT} が画像と一致しません。 npm run images:sizes を実行してコミットしてください。`);
    process.exit(1);
  }
  console.log(`ok ${OUT} (${Object.keys(sizes).length} files)`);
} else {
  writeFileSync(OUT, next);
  console.log(`wrote ${OUT} (${Object.keys(sizes).length} files)`);
}
