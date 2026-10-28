import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = p => readFileSync(new URL("../" + p, import.meta.url), "utf8");

test("home intro displays editorial copy on desktop and only decoration on mobile", () => {
  for (const path of ["index.html", "home-current.html"]) {
    const html = read(path);
    assert.match(html, /sb-utility-strip--home-intro/);
    assert.match(html, /Clinical depth\. Relational understanding\. Careful fit\./);
    assert.match(html, /height:14px;/);
    assert.match(html, /body\.home-redesign \.sb-utility-strip--home-intro \.sb-utility-strip__inner \{\s*display:none!important;/);
    assert.match(html, /class="home-hero-facts"/);
    assert.match(html, /See Available Appointments/);
    assert.match(html, /Request a Free Consultation/);
    assert.match(html, /home-hero-room/);
    assert.doesNotMatch(html, /<span class="sb-utility-strip__item">Aetna \+ BCBSIL · Eligibility varies<\/span>/);
  }
  assert.doesNotMatch(read("contact.html"), /sb-utility-strip--home-intro/);
  assert.doesNotMatch(read("fees-insurance.html"), /sb-utility-strip--home-intro/);
});

test("consultation headings accurately describe a request, preserving the existing form", () => {
  const page = read("contact.html");
  assert.match(page, /<h1 id="contact-page-title">Request a free consultation<\/h1>/);
  assert.match(page, /<h2 id="consultation-request-title">Request a brief introductory conversation\.<\/h2>/);
  assert.match(page, /form class="contact-form" id="consultation-request-form"/);
  assert.match(page, /id="consultation-submit-button" type="submit">Send Consultation Request/);
  assert.match(page, /id="consultation-success"/);
  assert.match(page, /consultation-request\.js\?/);
  const js = read("consultation-request.js");
  assert.match(js, /fetch\("\/api\/consultation-request"/);
  assert.match(js, /receipt\.submitted!==true/);
  const api = read("api/consultation-request.mjs");
  assert.match(api, /process\.env\.RESEND_API_KEY/);
  assert.match(api, /https:\/\/api\.resend\.com\/emails/);
});

test("obsolete preload Link headers removed without losing unrelated caching and security headers", () => {
  const conf = JSON.parse(read("vercel.json"));
  for (const source of ["/", "/(.*).html"]) {
    const rule = conf.headers.find(x => x.source === source);
    assert.ok(rule, source);
    assert.deepEqual(rule.headers, [{ key: "Cache-Control", value: "no-store, max-age=0" }]);
  }
  for (const source of ["/fit-safety-check", "/fit-safety-check.html"]) {
    const rule = conf.headers.find(x => x.source === source);
    assert.ok(rule?.headers.some(h => h.key === "Content-Security-Policy"));
    assert.ok(rule?.headers.some(h => h.key === "X-Robots-Tag"));
  }
  assert.ok(conf.rewrites.some(x => x.source === "/" && x.destination === "/home-current.html"));
  assert.ok(conf.rewrites.some(x => x.source === "/index.html" && x.destination === "/home-current.html"));
});

test("sitemap updates only substantively modified page entries", () => {
  const xml = read("sitemap.xml");
  for (const path of ["/", "/about.html", "/team.html", "/services.html", "/fees-insurance.html", "/contact.html", "/new-clients"]) {
    const location = "https://stonebridgepsychgroup.com" + path;
    const index = xml.indexOf("<loc>" + location + "</loc>");
    assert.ok(index >= 0, path);
    assert.ok(xml.slice(index, index + 130).includes("<lastmod>2026-10-28</lastmod>"), path);
  }
  for (const path of ["/team-founder.html", "/team-jasmine-wilson.html", "/portal.html"]) {
    const index = xml.indexOf("<loc>https://stonebridgepsychgroup.com" + path + "</loc>");
    assert.ok(index >= 0);
    assert.ok(xml.slice(index, index + 150).includes("<lastmod>2026-10-14</lastmod>"), path);
  }
});
