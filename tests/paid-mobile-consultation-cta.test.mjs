import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const begin = source.indexOf("  function syncMobileConsultationCTAVisibility(cta) {");
const end = source.indexOf("\n  function init() {", begin);
assert.ok(begin >= 0 && end > begin, "Expected central mobile CTA function");

const PORTAL = "https://www.therapyportal.com/p/stonebridge60634/";
const AVAILABILITY = PORTAL + "appointments/availability/";

function renderCTA({ path = "/bcbs-therapy-illinois", search = "", existing = false } = {}) {
  const created = [];
  const classes = [];
  const existingElement = existing ? { href: "already-added" } : null;
  const body = {
    appendChild(element) { created.push(element); },
    classList: { add(name) { classes.push(name); } }
  };
  const document = {
    body,
    querySelector(selector) {
      if (selector === '.sb-mobile-consultation-cta') return existingElement;
      if (selector === 'main') return { querySelectorAll() { return []; } };
      if (selector === '.site-header') return null;
      assert.fail('unexpected selector ' + selector);
    },
    createElement(tag) {
      assert.equal(tag, "a");
      return {
        style: {},
        setAttribute(name, value) { this[name] = value; },
        removeAttribute(name) { delete this[name]; },
        blur() {}
      };
    }
  };
  const window = {
    location: { pathname: path, search },
    matchMedia(query) { return { matches: query.includes('max-width'), addEventListener() {} }; },
    addEventListener() {},
    requestAnimationFrame(callback) { callback(); },
    innerHeight: 780,
    innerWidth: 390,
    scrollY: 0,
    getComputedStyle() { return { display: 'block', visibility: 'visible', opacity: '1', position: 'static' }; }
  };
  document.documentElement = { scrollTop: 0 };
  document.activeElement = null;
  const code = source.slice(begin, end) + "\nensureMobileConsultationCTA();";
  runInNewContext(code, {
    window, document,
    pageName() { return path.split("/").pop().toLowerCase() || "index.html"; }
  });
  return { created, classes };
}

function expectPortalCTA(result, label = "See Available Appointments", url = AVAILABILITY) {
  assert.equal(result.created.length, 1);
  const link = result.created[0];
  assert.equal(link.className, "sb-mobile-consultation-cta");
  assert.equal(link.href, url);
  assert.equal(link.textContent, label);
  assert.equal(link["aria-label"], label);
  assert.equal(link.rel, "noreferrer");
  assert.ok(result.classes.includes("sb-has-mobile-consultation-cta"));
}

test("BCBS mobile CTA requests an appointment directly, without leaking ad IDs or form data", () => {
  const result = renderCTA({
    path: "/bcbs-therapy-illinois",
    search: "?utm_source=google&utm_medium=cpc&gclid=click-123&email=secret%40example.test"
  });
  expectPortalCTA(result);
  assert.ok(!result.created[0].href.includes("click-123"));
  assert.ok(!result.created[0].href.includes("secret"));
});

test("all paid mobile landing paths use the direct appointment-availability screen", () => {
  for (const path of [
    "/bcbs-therapy-illinois.html", "/bcbs-therapy-illinois",
    "/adolescent-therapy-illinois.html", "/adolescent-therapy-illinois",
    "/trauma-therapy-illinois.html", "/trauma-therapy-illinois"
  ]) {
    expectPortalCTA(renderCTA({ path, search: "?gclid=123&gbraid=456&wbraid=789" }));
  }
});

test("ordinary psychotherapy pages and both New Clients URL forms open appointment availability", () => {
  for (const path of [
    "/", "/index.html", "/about.html", "/team.html", "/team-founder.html",
    "/team-jasmine-wilson.html", "/services.html", "/individual-therapy.html",
    "/couples-therapy.html", "/family-therapy.html", "/parent-support.html",
    "/fees-insurance.html", "/new-clients.html", "/new-clients"
  ]) {
    expectPortalCTA(renderCTA({ path }));
  }
});

test("group, assessment, contact and other exception pages do not gain a general appointment sticky CTA", () => {
  for (const path of [
    "/group-therapy.html", "/assessment.html", "/forensic.html",
    "/contact.html", "/for-clinicians.html", "/careers.html",
    "/portal.html", "/privacy-information.html", "/fit-safety-check.html"
  ]) {
    const result = renderCTA({ path });
    assert.equal(result.created.length, 0, `Unexpected sticky CTA on ${path}`);
  }
});

test("existing sticky CTA is never duplicated", () => {
  const result = renderCTA({ path: "/index.html", existing: true });
  assert.equal(result.created.length, 0);
  assert.equal(result.classes.length, 0);
});