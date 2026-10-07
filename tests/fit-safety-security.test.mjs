import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fitHtml = await readFile(new URL("../fit-safety-check.html", import.meta.url), "utf8");
const fitJs = await readFile(new URL("../fit-safety-check.js", import.meta.url), "utf8");
const contactHtml = await readFile(new URL("../contact.html", import.meta.url), "utf8");
const newClientsHtml = await readFile(new URL("../new-clients.html", import.meta.url), "utf8");
const consultationJs = await readFile(new URL("../consultation-request.js", import.meta.url), "utf8");
const newClientAccessJs = await readFile(new URL("../new-client-access.js", import.meta.url), "utf8");
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
  assert.match(fitJs, /Stonebridge new-client check completed/);
  assert.doesNotMatch(fitJs, /therapyportal[^\n]+(routingState|reasonCodes|email|dateOfBirth|mobile)/i);
});


test("SI and HI are combined into one safety step with one HI question", () => {
  assert.match(fitHtml, /data-screen-step="safety"/);
  assert.doesNotMatch(fitHtml, /data-screen-step="risk-others"/);
  assert.match(fitHtml, /name="riskOthers" value="yes"/);
  assert.match(fitHtml, /name="riskOthers" value="no"/);
  assert.equal((fitHtml.match(/name="riskOthers"/g) || []).length, 2);
});

test("visible safety question numbers are generated sequentially", () => {
  assert.doesNotMatch(fitHtml, /<legend[^>]*>\s*[1-9]\./);
  assert.match(fitHtml, /safety-question-number/);
  assert.match(fitJs, /syncSafetyQuestionNumbers/);
  assert.match(fitJs, /number\.textContent=\(index\+1\)\+"\. "/);
});

test("passive SI remains direct while active SI requires review", () => {
  assert.match(fitJs, /cssrsQ1/);
  assert.match(fitJs, /cssrsQ2/);
});

test("administrative and clinical results do not transmit screening answers", () => {
  assert.match(fitJs, /contact\.html#inquiry-form/);
  assert.doesNotMatch(fitJs, /\/api\/contact|\/api\/fit-safety-check/);
});

test("consultation page has a non-clinical contact form with no Vercel submission", () => {
  assert.match(contactHtml, /id="consultation-request-form"/);
  assert.match(contactHtml, /consultation-request\.js/);
  assert.match(contactHtml, /id="consultation-clinician"/);
  assert.doesNotMatch(contactHtml, /name="reason"|name="dateOfBirth"|name="insurancePreference"|\/api\/contact/i);
});

test("consultation form restores the existing Google Ads conversion action", () => {
  assert.match(consultationJs, /AW-18474959338/);
  assert.match(consultationJs, /AW-18474959338\/oiH4CNOsuYYdEOqDxulE/);
  assert.match(consultationJs, /gtag\("event","conversion"/);
  assert.match(consultationJs, /allow_ad_personalization_signals",false/);
  assert.doesNotMatch(consultationJs, /fullName.*gtag|email.*gtag|phone.*gtag|clinician.*gtag/is);
});

test("Google click IDs may continue to consultation but not the sensitive Fit & Safety screen", () => {
  assert.match(newClientAccessJs, /gclid/);
  assert.match(newClientAccessJs, /gbraid/);
  assert.match(newClientAccessJs, /wbraid/);
  assert.match(newClientAccessJs, /a\[href\^="contact\.html"\]/);
  assert.doesNotMatch(newClientAccessJs, /fit-safety-check[^\n]*(gclid|gbraid|wbraid)/i);
});

test("new-client page offers the voluntary consultation route", () => {
  assert.match(newClientsHtml, /href="contact\.html#inquiry-form"/);
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
