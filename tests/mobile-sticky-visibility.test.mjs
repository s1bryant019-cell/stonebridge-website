import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const start = source.indexOf("  function syncMobileConsultationCTAVisibility(cta) {");
const end = source.indexOf("\n  function init() {", start);
assert.ok(start > 0 && end > start, "Must use the sitewide mobile visibility controller");
const code = source.slice(start, end) + "\nensureMobileConsultationCTA();";
const APPOINTMENTS = "https://www.therapyportal.com/p/stonebridge60634/appointments/availability/";

function harness(width, { path = "/index.html", hero = true, second = true } = {}) {
  const handlers = {};
  const timers = new Map();
  const media = [];
  let nextTimer = 0;
  const node = (attrs = {}) => ({
    nodeType: 1, parentElement: null, hidden: false, inert: false, isConnected: true,
    attrs: { ...attrs },
    getAttribute(key) { return this.attrs[key] ?? null; },
    setAttribute(key, value) { this.attrs[key] = String(value); },
    removeAttribute(key) { delete this.attrs[key]; },
    style: {},
    blur() { this.blurred = true; }
  });
  const makeLink = (top, label = "See Available Appointments") => {
    const link = node();
    link.href = APPOINTMENTS;
    link.textContent = label;
    link.visibleTop = top;
    link.getBoundingClientRect = () => ({
      left: 20, right: width - 20, width: width - 40,
      top: link.visibleTop, bottom: link.visibleTop + 54, height: 54
    });
    link.closest = () => null;
    return link;
  };
  const heroLink = makeLink(205);
  const finalLink = makeLink(4200);
  const links = [ ...(hero ? [heroLink] : []), ...(second ? [finalLink] : []) ];
  const main = { querySelectorAll() { return links; } };
  const header = node();
  header.getBoundingClientRect = () => ({ top: 0, bottom: 70 });
  const created = [];
  const document = {
    body: {
      appendChild(el) { created.push(el); },
      classList: { add() {} }
    },
    documentElement: { scrollTop: 0 },
    activeElement: null,
    querySelector(selector) {
      if (selector === ".sb-mobile-consultation-cta") return null;
      if (selector === "main") return main;
      if (selector === ".site-header") return header;
      throw new Error("Unexpected selector: " + selector);
    },
    createElement(tag) {
      assert.equal(tag, "a");
      const el = node();
      el.blur = () => { el.blurred = true; };
      return el;
    }
  };
  const window = {
    innerWidth: width, innerHeight: 812, scrollY: 0,
    location: { pathname: path },
    matchMedia(query) {
      const m = { matches: query.includes("max-width") ? width <= 760 : false, addEventListener() {} };
      media.push(m); return m;
    },
    getComputedStyle(element) {
      return element === header ?
        { display: "block", visibility: "visible", opacity: "1", position: "sticky" } :
        { display: element.cssDisplay || "block", visibility: element.cssVisibility || "visible", opacity: "1", position: "static" };
    },
    addEventListener(name, fn) { (handlers[name] ||= []).push(fn); },
    requestAnimationFrame(fn) { fn(); },
    setTimeout(fn) { const id = ++nextTimer; timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); }
  };
  const context = { window, document, pageName() { return path.split("/").pop() || "index.html"; } };
  runInNewContext(code, context);
  const cta = created[0];
  return {
    cta, created, links, heroLink, finalLink, document, window,
    scroll(y, { heroTop, finalTop } = {}) {
      window.scrollY = y;
      if (heroTop !== undefined) heroLink.visibleTop = heroTop;
      if (finalTop !== undefined) finalLink.visibleTop = finalTop;
      (handlers.scroll || []).forEach(fn => fn());
    },
    tick() {
      const tasks = Array.from(timers.values()); timers.clear();
      tasks.forEach(fn => fn());
    },
    resize(nextWidth) {
      window.innerWidth = nextWidth;
      media[0].matches = nextWidth <= 760;
      (handlers.resize || []).forEach(fn => fn());
    },
    visible() { return cta?.style.visibility === "visible"; },
    accessible() { return cta?.getAttribute("aria-hidden") === null && cta?.getAttribute("inert") === null; }
  };
}

for (const width of [375, 390, 430, 760]) {
  test(`at ${width}px a visible hero CTA hides the sticky shortcut; scroll both directions toggles it`, () => {
    const h = harness(width);
    assert.equal(h.created.length, 1);
    assert.equal(h.visible(), false, "top: no duplicate");
    assert.equal(h.cta.getAttribute("tabindex"), "-1");
    assert.equal(h.cta.getAttribute("aria-hidden"), "true");
    assert.equal(h.cta.getAttribute("inert"), "");

    h.scroll(600, { heroTop: -300, finalTop: 1600 });
    assert.equal(h.visible(), false, "delayed reveal prevents flicker");
    h.tick();
    assert.equal(h.visible(), true, "reading content: sticky available");
    assert.equal(h.accessible(), true);

    h.scroll(3250, { heroTop: -2800, finalTop: 630 });
    assert.equal(h.visible(), false, "final in-page button: sticky hidden immediately");
    assert.equal(h.cta.getAttribute("tabindex"), "-1");

    h.scroll(2450, { heroTop: -2100, finalTop: 1500 });
    h.tick();
    assert.equal(h.visible(), true, "scroll upward through text: sticky restored");

    h.scroll(0, { heroTop: 205, finalTop: 4200 });
    assert.equal(h.visible(), false, "back at top: no duplicate");
    assert.equal(h.cta.getAttribute("aria-hidden"), "true");
  });
}

test("on pages without a top CTA, the sticky action appears only after initial scrolling", () => {
  const h = harness(390, { path: "/fees-insurance.html", hero: false, second: false });
  assert.equal(h.visible(), false);
  h.scroll(45);
  h.tick();
  assert.equal(h.visible(), false);
  h.scroll(80);
  h.tick();
  assert.equal(h.visible(), true);
});

test("hidden, collapsed or menu appointment links do not suppress the sticky shortcut", () => {
  const h = harness(390, { path: "/team-founder.html" });
  h.heroLink.cssDisplay = "none";
  h.scroll(800, { heroTop: 200, finalTop: 2000 });
  h.tick();
  assert.equal(h.visible(), true, "display-none link excluded");
  h.heroLink.cssDisplay = "block";
  h.heroLink.cssVisibility = "hidden";
  h.scroll(850);
  h.tick();
  assert.equal(h.visible(), true, "visibility-hidden link excluded");
  h.heroLink.cssVisibility = "visible";
  h.heroLink.closest = () => ({});
  h.scroll(900);
  h.tick();
  assert.equal(h.visible(), true, "navigation or header links excluded");
  h.heroLink.closest = () => null;
  h.scroll(910);
  assert.equal(h.visible(), false, "visible in-page link suppresses sticky again");
});

test("the sticky shortcut is absent from group and consultation pages", () => {
  for (const path of ["/group-therapy.html", "/contact.html", "/portal.html"]) {
    const h = harness(390, { path });
    assert.equal(h.created.length, 0, path);
  }
});

test("desktop resize keeps sticky control hidden and non-focusable", () => {
  const h = harness(760);
  h.scroll(700, { heroTop: -500, finalTop: 2000 });
  h.tick();
  assert.equal(h.visible(), true);
  h.resize(761);
  assert.equal(h.visible(), false);
  assert.equal(h.cta.getAttribute("tabindex"), "-1");
});

test("only the sanctioned appointment URL is used; no other script or form changes", () => {
  const h = harness(375);
  assert.equal(h.cta.href, APPOINTMENTS);
  assert.equal(h.cta.textContent, "See Available Appointments");
  assert.doesNotMatch(source, /never dynamically suppress based on other CTAs/);
  const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
  assert.match(css, /bottom:calc\(12px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /padding-bottom:calc\(82px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /\.sb-mobile-consultation-cta:focus-visible/);
});
