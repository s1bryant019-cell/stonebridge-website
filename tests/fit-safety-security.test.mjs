import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fitHtml = await readFile(new URL("../fit-safety-check.html", import.meta.url), "utf8");
const fitJs = await readFile(new URL("../fit-safety-check.js", import.meta.url), "utf8");
const contactHtml = await readFile(new URL("../contact.html", import.meta.url), "utf8");
const newClientsHtml = await readFile(new URL("../new-clients.html", import.meta.url), "utf8");
const vercelJson = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

test("Fit & Safety Check contains no identity fields", () => {
  assert.doesNotMatch(fitHtml, /name="(?:fullName|dateOfBirth|email|mobile|phone)"/i);
  assert.doesNotMatch(fitHtml, /data-screen-step="identity"/i);
});

test("Fit & Safety Check runs routing locally in the browser", () => {
  assert.match(fitJs, /import \{ evaluateRouting \} from "\.\/lib\/fit-safety-routing\.mjs"/);
  assert.match(fitJs, /evaluateRouting\(routingInput\(\)\)/);
  assert.doesNotMatch(fitJs, /fetch\s*\(/);
  assert.doesNotMatch(fitJs, /XMLHttpRequest|sendBeacon|WebSocket/i);
});

test("Fit & Safety Check does not execute analytics, advertising, or session replay code", () => {
  const source = fitHtml + "\n" + fitJs;
  assert.doesNotMatch(source, /gtag\s*\(|googletagmanager|google-analytics|fbq\s*\(|facebook pixel|hotjar|fullstory|clarity\s*\(|segment\.|mixpanel|amplitude/i);
});

test("Fit & Safety Check does not read or write browser storage or cookies", () => {
  assert.doesNotMatch(fitJs, /localStorage|sessionStorage|indexedDB|document\.cookie/i);
});

test("Fit & Safety Check does not propagate marketing query identifiers", () => {
  const source = fitHtml + "\n" + fitJs;
  assert.doesNotMatch(source, /utm_(source|medium|campaign|term|content)|gclid|fbclid|msclkid/i);
  assert.doesNotMatch(fitJs, /URLSearchParams|location\.search|location\.hash/i);
});

test("TherapyPortal handoff is a fixed destination", () => {
  assert.match(fitJs, /https:\/\/www\.therapyportal\.com\/p\/stonebridge60634\//);
  assert.match(fitJs, /Fit &amp; Safety Check completed/);
  assert.doesNotMatch(fitJs, /therapyportal[^\n]+(routingState|reasonCodes|email|dateOfBirth|mobile)/i);
});

test("administrative and clinical results use phone rather than transmitting answers", () => {
  assert.match(fitJs, /tel:\+17734171688/);
  assert.doesNotMatch(fitJs, /\/api\/contact|\/api\/fit-safety-check/);
});

test("consultation page is phone-only and contains no clinical submission form", () => {
  assert.match(contactHtml, /href="tel:\+17734171688"/);
  assert.doesNotMatch(contactHtml, /id="consultation-form"|name="reason"|\/api\/contact/i);
});

test("new-client page offers phone-based voluntary consultation", () => {
  assert.match(newClientsHtml, /href="tel:\+17734171688"/);
});

test("sensitive screen retains no-store, no-referrer, and noindex headers", () => {
  for (const source of ["/fit-safety-check", "/fit-safety-check.html"]) {
    const rule = vercelJson.headers.find((entry) => entry.source === source);
    assert.ok(rule, `missing header rule: ${source}`);
    assert.ok(rule.headers.some((h) => h.key === "Cache-Control" && h.value.includes("no-store")));
    assert.ok(rule.headers.some((h) => h.key === "Referrer-Policy" && h.value === "no-referrer"));
    assert.ok(rule.headers.some((h) => h.key === "X-Robots-Tag" && h.value.includes("noindex")));
  }
});

test("there is no secure intake API, cron, or runtime storage dependency", () => {
  assert.equal(packageJson.dependencies && Object.keys(packageJson.dependencies).length, 0);
  assert.ok(!("crons" in vercelJson));
  assert.ok(!vercelJson.rewrites.some((entry) => /intake-review|api\/fit-safety|api\/contact/.test(entry.source)));
});
