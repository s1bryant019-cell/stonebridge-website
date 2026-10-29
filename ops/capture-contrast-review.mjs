import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

const baseUrl = "http://127.0.0.1:8771";
const headUrl = "http://127.0.0.1:8772";
const affected = [
  "about.html", "adolescent-therapy-illinois.html", "bcbs-therapy-illinois.html",
  "fees-insurance.html", "for-clinicians.html",
  "home-current.html", "index.html", "team-founder.html",
  "team-jasmine-wilson.html", "trauma-therapy-illinois.html"
];
const allPages = fs.readdirSync(".").filter(p => p.endsWith(".html")).sort();
const out = "contrast-review-proof";
const widths = [390, 1440];
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const results = [];
const images = [];

for (const file of affected) {
  for (const width of widths) {
    for (const [version, url] of [["before", baseUrl], ["after", headUrl]]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      await page.goto(url + "/" + file, { waitUntil: "load", timeout: 25000 });
      await page.waitForTimeout(350);
      await page.evaluate(() => document.fonts.ready);
      const filename = file.replace(".html", "") + "-" + width + "-" + version + ".jpg";
      await page.screenshot({ path: path.join(out, filename), fullPage: true, type: "jpeg", quality: 78, animations: "disabled" });
      const state = await page.evaluate(() => ({
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
        brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length
      }));
      results.push({ file, width, version, ...state });
      images.push({ file, width, version, filename });
      await context.close();
    }
  }
}

const axe = [];
for (const file of allPages) {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto(headUrl + "/" + file, { waitUntil: "load", timeout: 25000 });
    await page.waitForTimeout(400);
    const report = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    axe.push({ file, actualPath: new URL(page.url()).pathname, width, violations: report.violations.map(v => ({ id: v.id, impact: v.impact, selectors: v.nodes.map(n => n.target) })) });
    await context.close();
  }
}
await browser.close();
fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({
  browser: "Playwright Chromium", widths, baseline: "main", affected, images, results, axe
}, null, 2));

const html = ["<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>Stonebridge contrast review</title>",
  "<style>body{font:16px system-ui;color:#213142;background:#f8f5f0;max-width:1400px;margin:30px auto;padding:20px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}figure{margin:0}img{max-width:100%;border:1px solid #ccc}h2{margin-top:42px;border-top:1px solid #aaa;padding-top:20px}@media(max-width:760px){.pair{grid-template-columns:1fr}}</style>",
  "<h1>Stonebridge contrast: before and after</h1><p>Full-page captures at actual 390px and 1440px viewport widths. Images are unchanged apart from targeted text contrast treatments.</p>"];
for (const file of affected) {
  html.push("<h2>" + file + "</h2>");
  for (const width of widths) {
    html.push("<h3>" + width + " CSS pixels</h3><div class='pair'>");
    for (const version of ["before", "after"]) {
      const filename = file.replace(".html", "") + "-" + width + "-" + version + ".jpg";
      html.push("<figure><figcaption>" + version + "</figcaption><a href='" + filename + "'><img loading='lazy' src='" + filename + "' alt='" + file + " " + version + " at " + width + "px'></a></figure>");
    }
    html.push("</div>");
  }
}
html.push("</html>");
fs.writeFileSync(path.join(out, "index.html"), html.join("\n"));
const knownOutstanding = ["new-clients.html", "fit-safety-check.html"]; // Separate unmerged New Clients PR #64; old Fit/Safety route redirects there.
const failures = axe.filter(x => x.violations.length && !knownOutstanding.includes(x.file));
console.log(JSON.stringify({ images: images.length, sitewideAxeScans: axe.length, unexpectedViolationScans: failures.length, knownOutstanding: axe.filter(x => x.violations.length && knownOutstanding.includes(x.file)), failures }, null, 2));
if (failures.length || results.some(x => x.horizontalOverflow || x.brokenImages)) process.exitCode = 1;
