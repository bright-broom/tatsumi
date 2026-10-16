// アクセシビリティ検査（axe-core）。本番ビルドを起動し、実ブラウザで主要ページを走査する。違反が 1 件でもあれば exit 1。
// 事前に `npm run build` と Chromium（`npx playwright install chromium`）が必要。使い方: npm run a11y [port]
//
// 走査するもの:
//   - 全ページ（/・/news・/privacy）× PC(1280) / スマホ(390) の通常表示
//   - スマホでメニューを開いた状態
//   - PC でお問い合わせフォームのエラー表示（未入力で送信）
// 基準: WCAG 2.0 / 2.1 / 2.2 の A・AA と axe の best-practice。
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const PORT = Number(process.argv[2] ?? 3113);
const BASE = `http://localhost:${PORT}`;
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const PAGES = ["/", "/news", "/privacy"];
const VIEWPORTS = { desktop: { width: 1280, height: 800 }, mobile: { width: 390, height: 844 } };
const axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");

const up = () => fetch(BASE, { signal: AbortSignal.timeout(2000) }).then((r) => r.ok, () => false);

if (await up()) {
  console.error(`port ${PORT} is already in use (stale server?). Stop it and retry.`);
  process.exit(2);
}
const server = spawn("node_modules/.bin/next", ["start", "-p", String(PORT)], { stdio: "ignore" });
let browser;
const cleanup = async () => {
  await browser?.close().catch(() => {});
  server.kill();
};
process.on("SIGINT", () => cleanup().then(() => process.exit(130)));

const failures = [];
let scans = 0;

try {
  for (let i = 0; i < 30 && !(await up()); i++) await new Promise((r) => setTimeout(r, 1000));
  if (!(await up())) throw new Error("server did not start (run `npm run build` first)");
  browser = await chromium.launch();

  const scan = async (page, label) => {
    await page.evaluate(axeSource);
    const result = await page.evaluate((tags) => axe.run(document, { runOnly: { type: "tag", values: tags } }), TAGS);
    scans++;
    for (const v of result.violations) {
      for (const n of v.nodes) failures.push(`${label}  [${v.impact}] ${v.id}: ${v.help}\n      ${n.target.join(" ")}`);
    }
    console.log(`${result.violations.length === 0 ? "ok  " : "FAIL"} ${label}${result.violations.length ? ` (${result.violations.length} rule(s))` : ""}`);
  };

  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    for (const path of PAGES) {
      const ctx = await browser.newContext({ viewport, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(BASE + path, { waitUntil: "load" });
      // スクロールで表示される要素（.reveal・遅延読み込み）を出し、アニメーションを止めてから走査する
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 500) {
        await page.evaluate((top) => scrollTo(0, top), y);
        await page.waitForTimeout(60);
      }
      await page.addStyleTag({ content: "*{transition:none!important;animation:none!important}.reveal{opacity:1!important;transform:none!important}" });
      await page.evaluate(() => scrollTo(0, 0));
      await scan(page, `${path} (${vpName})`);

      if (path === "/" && vpName === "mobile") {
        await page.click(".menu-btn");
        await page.waitForTimeout(300);
        await scan(page, `/ (${vpName}) メニューを開いた状態`);
      }
      if (path === "/" && vpName === "desktop") {
        await page.locator('#contact button[type="submit"]').scrollIntoViewIfNeeded();
        await page.click('#contact button[type="submit"]'); // 未入力のまま送信 → エラー表示
        await page.waitForSelector("#contact .err");
        await scan(page, `/ (${vpName}) フォームのエラー表示`);
      }
      await ctx.close();
    }
  }
} catch (e) {
  console.error(e);
  failures.push(`runner error: ${e instanceof Error ? e.message : e}`);
} finally {
  await cleanup();
}

if (failures.length) {
  console.error(`\n${failures.length} violation(s) in ${scans} scan(s):\n` + failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log(`\nall ${scans} scans clean (axe-core, ${TAGS.join(" / ")})`);
