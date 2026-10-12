import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const begin = source.indexOf("  function ensureMobileConsultationCTA() {");
const end = source.indexOf("\n  function init() {", begin);
assert.ok(begin >= 0 && end > begin, "Expected existing mobile CTA function");

function renderCTA({ path = "/bcbs-therapy-illinois", landingSource = "", search = "" } = {}) {
  const created = [];
  const classes = [];
  let syncCalled = false;
  const body = {
    getAttribute(name) { return name === "data-landing-source" ? landingSource : null; },
    appendChild(element) { created.push(element); },
    classList: { add(name) { classes.push(name); } }
  };
  const document = {
    body,
    querySelector(selector) {
      assert.equal(selector, ".sb-mobile-consultation-cta");
      return null;
    },
    createElement(tag) {
      assert.equal(tag, "a");
      return {
        setAttribute(name, value) { this[name] = value; }
      };
    }
  };
  const window = { location: { pathname: path, search } };
  const code = source.slice(begin, end) + "\nensureMobileConsultationCTA();";
  runInNewContext(code, {
    window,
    document,
    URLSearchParams,
    pageName() { return path.split("/").pop().toLowerCase() || "index.html"; },
    syncMobileConsultationCTAVisibility(element) {
      syncCalled = true;
      assert.equal(element, created[0]);
    }
  });
  return { created, classes, syncCalled };
}

test("paid BCBS sticky CTA goes directly to consultation section preserving every attribution field", () => {
  const values = {
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "BCBS Illinois Therapy",
    utm_term: "therapist & insurance",
    utm_content: "ad_variant_1",
    gclid: "GCLID123",
    gbraid: "GBRAID456",
    wbraid: "WBRAID789"
  };
  const result = renderCTA({
    path: "/bcbs-therapy-illinois",
    landingSource: "BCBS Landing Page",
    search: "?" + new URLSearchParams({ ...values, email: "never-propagate@example.test" })
  });
  assert.equal(result.created.length, 1);
  const cta = result.created[0];
  assert.equal(cta.textContent, "Request a Consultation");
  assert.equal(cta["aria-label"], "Request a Consultation");
  assert.equal(cta.className, "sb-mobile-consultation-cta");
  const url = new URL(cta.href, "https://stonebridgepsychgroup.com/");
  assert.equal(url.pathname, "/contact.html");
  assert.equal(url.hash, "#inquiry-form");
  assert.equal(url.searchParams.get("source"), "BCBS Landing Page");
  for (const [key, value] of Object.entries(values)) {
    assert.equal(url.searchParams.get(key), value);
  }
  assert.equal(url.searchParams.has("email"), false);
  assert.equal(result.syncCalled, true);
  assert.ok(result.classes.includes("sb-has-mobile-consultation-cta"));
});

test("other paid landing pages use the same direct consultation flow", () => {
  for (const [page, source] of [
    ["adolescent-therapy-illinois.html", "Adolescent Therapy Landing Page"],
    ["trauma-therapy-illinois", "Trauma Therapy Landing Page"]
  ]) {
    const { created } = renderCTA({ path: "/" + page, landingSource: source, search: "?gclid=123" });
    assert.equal(created[0].textContent, "Request a Consultation");
    assert.ok(created[0].href.startsWith("contact.html?"));
    assert.ok(created[0].href.endsWith("#inquiry-form"));
    assert.equal(new URL(created[0].href, "https://stonebridgepsychgroup.com").searchParams.get("source"), source);
  }
});

test("non-paid eligible pages keep existing New Clients sticky CTA", () => {
  for (const page of ["/index.html", "/services.html", "/bcbs-therapy-illinois"]) {
    const { created } = renderCTA({ path: page });
    assert.equal(created.length, 1);
    assert.equal(created[0].href, "new-clients.html");
    assert.equal(created[0].textContent, "New Clients");
    assert.equal(created[0]["aria-label"], "New Clients");
  }
});

test("non-eligible pages do not receive a sticky CTA", () => {
  const { created, syncCalled } = renderCTA({ path: "/contact.html", landingSource: "Paid" });
  assert.equal(created.length, 0);
  assert.equal(syncCalled, false);
});
