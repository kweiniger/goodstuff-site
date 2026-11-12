// Regenerates the PNG favicons and the social share image in /public.
// Run with: node scripts/generate-assets.mjs  (needs Playwright + Chromium available)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// require() so a globally installed Playwright also works.
const { chromium } = createRequire(import.meta.url)("playwright");

const root = fileURLToPath(new URL("..", import.meta.url));
const font = (style) =>
  readFileSync(
    `${root}node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-${style}.woff2`,
  ).toString("base64");

const svg = readFileSync(`${root}public/favicon.svg`, "utf8");

const og = `<!doctype html><html><head><style>
@font-face { font-family: N; font-weight: 200 800; font-style: normal; src: url(data:font/woff2;base64,${font("normal")}) format("woff2"); }
@font-face { font-family: N; font-weight: 200 800; font-style: italic; src: url(data:font/woff2;base64,${font("italic")}) format("woff2"); }
html, body { margin: 0; }
body { width: 1200px; height: 630px; box-sizing: border-box; padding: 84px 96px; background: #f1efe9; color: #26241f;
  font-family: N, Georgia, serif; display: flex; flex-direction: column; justify-content: space-between; }
.wm { font-size: 40px; font-weight: 500; letter-spacing: -0.01em; }
h1 { margin: 0; font-size: 104px; font-weight: 350; line-height: 1.02; letter-spacing: -0.02em; }
.url { font-size: 30px; color: #8a8478; }
</style></head><body>
<span class="wm">goodstuff</span>
<h1>good things <em>for real life.</em></h1>
<span class="url">goodstuffstudio.xyz</span>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();

for (const [file, size] of [["favicon-32.png", 32], ["apple-touch-icon.png", 180]]) {
  await page.setViewportSize({ width: size, height: size });
  // Apple touch icons get their own rounded mask, so fill the full square there.
  const markup = file.startsWith("apple") ? svg.replace(/ rx="14"/, "") : svg;
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${markup}`,
  );
  writeFileSync(`${root}public/${file}`, await page.screenshot({ omitBackground: true }));
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(og);
await page.evaluate(() => document.fonts.ready);
writeFileSync(`${root}public/og.png`, await page.screenshot());

await browser.close();
console.log("wrote favicon-32.png, apple-touch-icon.png, og.png");
