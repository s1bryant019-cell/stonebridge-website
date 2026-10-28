import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (name) => readFileSync(new URL("../" + name, import.meta.url), "utf8");
const ROOT = "https://stonebridgepsychgroup.com";
const PORTAL = "https://www.therapyportal.com/p/stonebridge60634/";

function headTags(html, tag) {
  const head = html.slice(0, html.indexOf("</head>"));
  return [...head.matchAll(new RegExp("<" + tag + "\\b[^>]*>", "gi"))].map(m => m[0]);
}

function attribute(tag, name) {
  return tag.match(new RegExp("\\b" + name + '=["\\x27]([^"\\x27]+)["\\x27]', "i"))?.[1];
}

function metadata(page) {
  const html = read(page);
  const metas = headTags(html, "meta").filter(t => attribute(t, "name") === "description");
  const canonicals = headTags(html, "link").filter(t => attribute(t, "rel") === "canonical");
  return { html, metas, canonicals };
}

test("indexable service and clinician pages have one description and one correct canonical regardless of attribute order", () => {
  const pages = [
    "team-founder.html", "services.html", "individual-therapy.html",
    "couples-therapy.html", "family-therapy.html", "parent-support.html",
    "group-therapy.html"
  ];
  for (const page of pages) {
    const { metas, canonicals } = metadata(page);
    assert.equal(metas.length, 1, `description missing or duplicated: ${page}`);
    assert.ok(attribute(metas[0], "content")?.trim(), `description empty: ${page}`);
    assert.equal(canonicals.length, 1, `canonical missing or duplicated: ${page}`);
    assert.equal(attribute(canonicals[0], "href"), ROOT + "/" + page);
  }
});

test("home canonical resolves to the root URL in both homepage files", () => {
  for (const page of ["index.html", "home-current.html"]) {
    const { metas, canonicals } = metadata(page);
    assert.equal(metas.length, 1);
    assert.equal(canonicals.length, 1);
    assert.equal(attribute(canonicals[0], "href"), ROOT + "/");
    assert.match(attribute(metas[0], "content"), /appointment requests available through Stonebridge/);
  }
});

test("sitemap lists canonical indexable paths without duplicates or stale modification dates", () => {
  const xml = read("sitemap.xml");
  const entries = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)]
    .map(m => ({ url: m[1], lastmod: m[2] }));
  assert.equal(entries.length, 21);
  assert.equal(new Set(entries.map(e => e.url)).size, entries.length);
  for (const entry of entries) {
    assert.match(entry.lastmod, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Date.parse(entry.lastmod) <= Date.now(), `future sitemap date: ${entry.url}`);
  }
  const urls = entries.map(e => e.url);
  const canonicalRoutes = [
    "/", "/new-clients", "/bcbs-therapy-illinois",
    "/adolescent-therapy-illinois", "/trauma-therapy-illinois"
  ];
  for (const suffix of canonicalRoutes) {
    const url = ROOT + suffix;
    assert.ok(urls.includes(url), `missing canonical sitemap location: ${url}`);
  }
  for (const suffix of ["/index.html", "/fit-safety-check", "/fit-safety-check.html", "/assessment.html", "/forensic.html"]) {
    assert.ok(!urls.includes(ROOT + suffix), `redirect/noindex page should not be listed: ${suffix}`);
  }
  for (const page of ["new-clients.html", "bcbs-therapy-illinois.html", "adolescent-therapy-illinois.html", "trauma-therapy-illinois.html"]) {
    const { canonicals } = metadata(page);
    assert.equal(canonicals.length, 1);
    assert.ok(urls.includes(attribute(canonicals[0], "href")), `canonical not in sitemap: ${page}`);
  }
});

test("general patient pages link directly to available appointments, preserving consultation and specialized paths", () => {
  for (const page of [
    "index.html", "home-current.html", "about.html", "team.html",
    "team-founder.html", "team-jasmine-wilson.html", "services.html",
    "individual-therapy.html", "couples-therapy.html", "family-therapy.html",
    "parent-support.html", "new-clients.html",
    "bcbs-therapy-illinois.html", "adolescent-therapy-illinois.html",
    "trauma-therapy-illinois.html"
  ]) {
    const html = read(page);
    const destination = PORTAL + "appointments/availability/";
    assert.ok(html.includes('href="' + destination + '"'), `no availability link: ${page}`);
    assert.match(html, /See Available Appointments/);
    assert.ok(!html.includes('href="' + PORTAL + '"'), `unexpected general portal link in ${page}`);
    assert.doesNotMatch(html, /href="fit-safety-check\.html"/);
  }
  assert.ok(read("new-clients.html").includes('href="contact.html">Request a Free Consultation'));
  assert.match(read("portal.html"), /href="https:\/\/www\.therapyportal\.com\/p\/stonebridge60634\/"/);
  assert.match(read("group-therapy.html"), /Request a Group Consultation/);
});

test("clinician practical rails have direct named appointment requests with confirmation language", () => {
  for (const [page, rail, name, slot] of [
    ["team-jasmine-wilson.html", "jasmine-profile-rail", "Jasmine", "jasmine-sticky-rail-slot"],
    ["team-founder.html", "founder-profile-rail", "Dr. Bryant", "founder-sticky-rail-slot"]
  ]) {
    const html = read(page);
    const aside = html.match(new RegExp('<aside class="' + rail + '"[\\s\\S]*?<\\/aside>'))?.[0];
    assert.ok(aside, `profile rail missing: ${page}`);
    assert.ok(aside.includes('class="' + rail + '-cta" href="' + PORTAL + 'appointments/availability/"'), `direct appointment rail link missing: ${page}`);
    assert.ok(aside.includes('Request an Appointment with ' + name), `clinician name missing from rail CTA: ${page}`);
    assert.match(aside, /Requests remain pending until clinician fit and availability are confirmed/);
    const mobileStyle = html.slice(html.indexOf("@media(max-width:1099px){"));
    assert.ok(mobileStyle.includes("." + slot + "{") && mobileStyle.includes("display:none!important;"), `original mobile rail hiding must stay intact: ${page}`);
  }
});

test("specialized consultation and assessment routes remain separate", () => {
  const group = read("group-therapy.html");
  assert.match(group, /Request a Group Consultation/);
  assert.match(group, /contact\.html\?service=teen-group#inquiry-form/);
  const assessment = read("assessment.html");
  assert.doesNotMatch(assessment, /href="https:\/\/www\.therapyportal\.com\/p\/stonebridge60634\//);
  assert.match(assessment, /Psychological%20Assessment%20Inquiry/);
  const forensic = metadata("forensic.html");
  assert.equal(forensic.canonicals.length, 1);
  assert.match(forensic.html, /name="robots" content="noindex,follow"/);
});

test("both retired public screener URLs redirect while the underlying clinical tool remains intact", () => {
  const config = JSON.parse(read("vercel.json"));
  for (const source of ["/fit-safety-check", "/fit-safety-check.html"]) {
    const redirect = config.redirects.find(r => r.source === source);
    assert.equal(redirect?.destination, "/new-clients.html");
    assert.equal(redirect?.permanent, false);
  }
  assert.match(read("fit-safety-check.html"), /id="fit-safety-form"/);
});
