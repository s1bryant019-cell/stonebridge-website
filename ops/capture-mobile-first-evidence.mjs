import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const baseline = process.env.STONEBRIDGE_BASELINE_URL || "http://127.0.0.1:8765";
const candidate = process.env.STONEBRIDGE_CANDIDATE_URL || "http://127.0.0.1:8766";
const out = "visual-proof";
const widths = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920];
const pages = fs.readdirSync(".").filter(f => f.endsWith(".html")).sort();
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const results = [];
fs.mkdirSync(path.join(out, "new-clients"), { recursive: true });
fs.mkdirSync(path.join(out, "sitewide"), { recursive: true });

async function capture(base, file, width, dest, screenshot) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  try {
    const response = await page.goto(base + "/" + file, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(200);
    const data = await page.evaluate(() => {
      const rect = query => {
        const element = document.querySelector(query);
        if (!element) return null;
        const r = element.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
      };
      return {
        location: location.pathname,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        h1: [...document.querySelectorAll("h1")].map(e => e.textContent.trim().replace(/\s+/g, " ")),
        brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute("src")),
        intro: rect(".access-template-layout"),
        heading: rect(".access-template-intro h2"),
        choices: rect(".access-path-list")
      };
    });
    if (screenshot) await page.screenshot({ path: dest, type: "jpeg", quality: 79, fullPage: true, animations: "disabled" });
    return { page: file, width, http: response?.status() ?? null, ...data, errors };
  } catch (e) {
    return { page: file, width, error: String(e), errors };
  } finally {
    await context.close();
  }
}

for (const file of pages) {
  for (const width of widths) {
    const screenshot = width === 390 || width === 1440;
    const dest = path.join(out, "sitewide", file + "-" + width + ".jpg");
    results.push({ phase: "candidate", ...(await capture(candidate, file, width, dest, screenshot)) });
  }
  console.log("inspected", file);
}
for (const phase of ["before", "after"]) {
  const base = phase === "before" ? baseline : candidate;
  for (const width of widths) {
    const dest = path.join(out, "new-clients", phase + "-" + width + ".jpg");
    results.push({ phase, ...(await capture(base, "new-clients.html", width, dest, true)) });
  }
}
await browser.close();
fs.writeFileSync(path.join(out, "measurements.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  browser: "Playwright Chromium",
  pages,
  widths,
  results
}, null, 2));

const groups = [];
groups.push("<h1>Stonebridge mobile/desktop review evidence</h1><p>Review artifact. No live forms or appointments were submitted. Inspect full-page images directly for detail.</p>");
groups.push("<h2>New Clients: before and after</h2>");
for (const width of widths) {
  groups.push("<h3>" + width + " CSS pixels</h3><div class='pair'>" +
    ["before", "after"].map(phase => "<figure><figcaption>" + phase + "</figcaption><a href='new-clients/" + phase + "-" + width + ".jpg'><img loading='lazy' src='new-clients/" + phase + "-" + width + ".jpg' alt='New Clients " + phase + " at " + width + "px'></a></figure>").join("") +
    "</div>");
}
groups.push("<h2>Full-site candidate captures at 390 and 1440 CSS pixels</h2>");
for (const file of pages) {
  groups.push("<h3>" + file + "</h3><div class='pair'>" +
    [390, 1440].map(width => "<figure><figcaption>" + width + "px</figcaption><a href='sitewide/" + file + "-" + width + ".jpg'><img loading='lazy' src='sitewide/" + file + "-" + width + ".jpg' alt='" + file + " at " + width + "px'></a></figure>").join("") +
    "</div>");
}
const html = "<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>Stonebridge visual evidence</title><style>body{font:16px system-ui;margin:30px auto;padding:0 20px;max-width:1300px;color:#213142;background:#f8f5f0}h2{border-top:1px solid #bbb;padding-top:30px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}figure{margin:0}img{width:100%;border:1px solid #ccc}figcaption{font-weight:700;margin-bottom:8px}@media(max-width:740px){.pair{grid-template-columns:1fr}}</style><main>" + groups.join("\n") + "</main></html>";
fs.writeFileSync(path.join(out, "index.html"), html);
const failures = results.filter(r => r.error || r.documentWidth > r.viewportWidth + 1 || r.errors?.length || r.brokenImages?.length);
console.log(JSON.stringify({ pages: pages.length, measured: results.length, screenshots: pages.length * 2 + widths.length * 2, failures }, null, 2));
if (failures.length) process.exitCode = 1;
