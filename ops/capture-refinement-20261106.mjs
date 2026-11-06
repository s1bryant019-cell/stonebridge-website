import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.STONEBRIDGE_REVIEW_BASE || "http://127.0.0.1:8001";
const OUT = "refinement-review-proof";
const widths = [375, 390, 430, 768, 1440, 1920];
const pages = [
  "index.html", "about.html", "team.html", "team-founder.html", "team-jasmine-wilson.html",
  "services.html", "individual-therapy.html", "couples-therapy.html", "family-therapy.html",
  "parent-support.html", "group-therapy.html", "fees-insurance.html", "new-clients.html",
  "contact.html", "portal.html", "privacy-information.html", "for-clinicians.html",
  "forensic.html", "careers.html", "bcbs-therapy-illinois.html",
  "adolescent-therapy-illinois.html", "trauma-therapy-illinois.html", "assessment.html"
];
const screenshotPages = [
  "index.html", "services.html", "individual-therapy.html", "family-therapy.html",
  "team-founder.html", "fees-insurance.html", "for-clinicians.html", "forensic.html", "careers.html"
];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", colorScheme: "light" });
const tab = await context.newPage();
const metrics = [];
const axe = [];
const findings = [];
await mkdir(OUT, { recursive: true });

for (const width of widths) {
  await tab.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
  for (const filename of pages) {
    const errors = [];
    const listener = error => errors.push(String(error).slice(0, 300));
    tab.on("pageerror", listener);
    try {
      const response = await tab.goto(BASE + "/" + filename, { waitUntil: "domcontentloaded", timeout: 20000 });
      await tab.waitForTimeout(100);
      const result = await tab.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img"));
        const badImages = imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute("src"));
        const main = document.querySelector("main");
        const headings = Array.from(document.querySelectorAll("h1")).map(h => h.innerText.trim()).filter(Boolean);
        const docWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        return { docWidth, viewport: window.innerWidth, badImages, hasMain: !!main, headings, title: document.title };
      });
      const record = { page: filename, width, status: response?.status() || null, ...result, pageErrors: errors };
      metrics.push(record);
      if (record.status !== 200 || record.docWidth > width + 2) findings.push({ page: filename, width, type: record.status !== 200 ? "HTTP status" : "horizontal overflow", status: record.status, docWidth: record.docWidth });
      if (record.badImages.length) findings.push({ page: filename, width, type: "image load", files: record.badImages });
      if ((width === 390 || width === 1440) && screenshotPages.includes(filename)) {
        await tab.screenshot({ path: path.join(OUT, String(width) + "-" + filename.replace(".html", "") + ".png"), fullPage: true, animations: "disabled", timeout: 25000 });
        try {
          const scan = await new AxeBuilder({ page: tab }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
          axe.push({ page: filename, width, violations: scan.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, description: v.help })) });
        } catch (err) {
          findings.push({ page: filename, width, type: "axe execution", error: String(err) });
        }
      }
    } catch (err) {
      findings.push({ page: filename, width, type: "navigation/capture", error: String(err) });
    } finally {
      tab.off("pageerror", listener);
    }
  }
}

const interactions = {};
async function check(name, fn) {
  try { interactions[name] = await fn(); }
  catch (e) { interactions[name] = { error: String(e) }; }
}
await tab.setViewportSize({ width: 390, height: 844 });
await check("career-inquiry", async () => {
  await tab.goto(BASE + "/careers.html");
  const href = await tab.locator('.team-cta a:has-text("Ask About Future Opportunities")').getAttribute("href");
  return { valid: href?.startsWith("mailto:info@stonebridgepsychgroup.com?subject=Future"), href };
});
await check("consultation-service-preselection", async () => {
  const results = {};
  for (const service of ["adult", "adolescent", "couples", "family", "parent-support", "teen-group"]) {
    await tab.goto(BASE + "/contact.html?service=" + service + "#inquiry-form");
    results[service] = await tab.locator("#consultation-service").inputValue();
  }
  await tab.goto(BASE + "/contact.html?service=unknown");
  results.unknown = await tab.locator("#consultation-service").inputValue();
  return results;
});
await check("mobile-navigation", async () => {
  await tab.goto(BASE + "/services.html");
  const menu = tab.locator(".mobile-toggle").first();
  const before = await menu.getAttribute("aria-expanded");
  await menu.click();
  const after = await menu.getAttribute("aria-expanded");
  return { before, after };
});
await check("adolescent-anchor", async () => {
  await tab.goto(BASE + "/individual-therapy.html#adolescent-therapy");
  await tab.waitForTimeout(100);
  return tab.locator("#adolescent-therapy").evaluate(el => ({
    top: Math.round(el.getBoundingClientRect().top),
    scrollMarginTop: getComputedStyle(el).scrollMarginTop,
    headerHeight: Math.round(document.querySelector("header")?.getBoundingClientRect().height || 0)
  }));
});
await check("forensic-fee-table", async () => {
  await tab.goto(BASE + "/forensic.html#forensic-fees");
  return { rows: await tab.locator(".forensic-fee-table tbody tr").count(), terms: await tab.locator(".forensic-fee-terms li").count() };
});
await check("image-candidates", async () => {
  const results = {};
  for (const p of ["services.html", "family-therapy.html", "for-clinicians.html"]) {
    await tab.goto(BASE + "/" + p);
    results[p] = await tab.locator("main figure img").first().evaluate(e => ({ src: e.getAttribute("src"), width: e.naturalWidth, height: e.naturalHeight, loaded: e.complete && e.naturalWidth > 0 }));
  }
  return results;
});

await writeFile(path.join(OUT, "metrics.json"), JSON.stringify(metrics, null, 2));
await writeFile(path.join(OUT, "axe.json"), JSON.stringify(axe, null, 2));
await writeFile(path.join(OUT, "findings.json"), JSON.stringify(findings, null, 2));
await writeFile(path.join(OUT, "interactions.json"), JSON.stringify(interactions, null, 2));
const violations = axe.flatMap(s => s.violations.map(v => ({ page: s.page, width: s.width, ...v })));
const report = [
  "# Stonebridge staging browser review",
  "All measurements are from local browser rendering of the PR branch, not the live domain.",
  "",
  "- Pages checked: " + pages.length,
  "- Widths: " + widths.join(", ") + "px",
  "- Page/width checks: " + metrics.length,
  "- Full-page desktop/mobile screenshots: " + screenshotPages.length * 2,
  "- WCAG-tagged axe runs: " + axe.length,
  "- Reported axe violations (not automatically equivalent to a full WCAG audit): " + violations.length,
  "- Layout/image/navigation findings: " + findings.length,
  "",
  "See metrics.json, axe.json, findings.json, interactions.json and the PNG captures. Verify contrast, visual design, keyboard interaction, text reflow, focus and image cropping manually before release.",
  "",
  "## Direct interaction checks",
  "~~~json",
  JSON.stringify(interactions, null, 2),
  "~~~"
].join("\n");
await writeFile(path.join(OUT, "summary.md"), report);
console.log(report);
await browser.close();
