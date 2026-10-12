import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const script = readFileSync(new URL("../consultation-request.js", import.meta.url), "utf8");

function setup(reply) {
  let handler;
  const events = [];
  const scripts = [];
  const errors = [];
  const content = { hidden: false };
  const success = { hidden: true, focus() { this.focused = true; } };
  const summaryHeading = { textContent: "" };
  const summary = {
    hidden: true,
    querySelector() { return summaryHeading; },
    focus() { this.focused = true; }
  };
  const list = { innerHTML: "", appendChild(el) { errors.push(el.textContent); } };
  const button = { disabled: false, textContent: "Send Consultation Request" };
  const values = {
    "consultation-name": { value: "Example Person" },
    "consultation-email": { value: "example@example.test" },
    "consultation-phone": { value: "" },
    "consultation-preferred-contact": { value: "" },
    "consultation-clinician": { value: "" },
    "consultation-availability": { value: "" }
  };
  const form = {
    elements: { website: { value: "" } },
    querySelector() { return content; },
    querySelectorAll() { return []; },
    addEventListener(type, fn) { if (type === "submit") handler = fn; }
  };
  const elements = {
    "consultation-request-form": form,
    "consultation-error-summary": summary,
    "consultation-error-list": list,
    "consultation-submit-button": button,
    "consultation-success": success,
    ...values
  };
  const document = {
    getElementById(id) { return elements[id] || null; },
    createElement() { return { textContent: "", hidden: false }; },
    head: { appendChild(el) { scripts.push(el); } }
  };
  const window = {
    location: {
      href: "https://stonebridgepsychgroup.com/contact.html?gclid=click123&gbraid=gb123&wbraid=wb123&email=private%40example.test",
      search: "?gclid=click123&gbraid=gb123&wbraid=wb123&email=private%40example.test",
      origin: "https://stonebridgepsychgroup.com",
      pathname: "/contact.html"
    },
    dataLayer: [],
    gtag(...args) { events.push(args); }
  };
  const posts = [];
  const fetch = async (url, options) => {
    posts.push({ url, options });
    return reply();
  };
  runInNewContext(script, { document, window, fetch, URL, URLSearchParams, Date, Promise, Error });
  const submit = () => handler({ preventDefault() {} });
  return { submit, events, scripts, errors, content, success, summary, button, posts };
}

test("confirmed server delivery shows confirmation and fires Ads conversion with no PII", async () => {
  const ui = setup(async () => ({ ok: true, json: async () => ({ delivered: true }) }));
  await ui.submit();
  assert.equal(ui.posts.length, 1);
  assert.equal(ui.posts[0].url, "/api/consultation-request");
  const posted = JSON.parse(ui.posts[0].options.body);
  assert.equal(posted.fullName, "Example Person");
  assert.equal(posted.gclid, "click123");
  assert.equal(posted.gbraid, "gb123");
  assert.equal(posted.wbraid, "wb123");

  assert.equal(ui.content.hidden, true);
  assert.equal(ui.success.hidden, false);
  assert.equal(ui.success.focused, true);
  const event = ui.events.find(([name]) => name === "event");
  assert.ok(event);
  assert.equal(event[1], "conversion");
  assert.deepEqual(Object.keys(event[2]), ["send_to"]);
  assert.equal(event[2].send_to, "AW-18474959338/oiH4CNOsuYYdEOqDxulE");
  assert.ok(!JSON.stringify(ui.events).includes("private%40example"));
  assert.ok(!JSON.stringify(ui.events).includes("Example Person"));
  const config = ui.events.find(([name]) => name === "config");
  assert.ok(config);
  assert.ok(!config[2].page_location.includes("email="));
  assert.ok(config[2].page_location.includes("gclid=click123"));

  await ui.submit();
  assert.equal(ui.posts.length, 1);
  assert.equal(ui.events.filter(([name]) => name === "event").length, 1);
});

test("non-delivered server receipt keeps form visible and does not fire conversion", async () => {
  const ui = setup(async () => ({ ok: true, json: async () => ({ delivered: false }) }));
  await ui.submit();
  assert.equal(ui.content.hidden, false);
  assert.equal(ui.success.hidden, true);
  assert.equal(ui.summary.hidden, false);
  assert.equal(ui.button.disabled, false);
  assert.equal(ui.events.filter(([name]) => name === "event").length, 0);
  assert.equal(ui.scripts.length, 0);
  assert.equal(ui.errors.length, 1);
});

test("network failure keeps form on site, permits retry, and never opens email application", async () => {
  const ui = setup(async () => { throw new Error("network"); });
  await ui.submit();
  assert.equal(ui.posts.length, 1);
  assert.equal(ui.success.hidden, true);
  assert.equal(ui.button.textContent, "Send Consultation Request");
  assert.equal(ui.button.disabled, false);
  assert.equal(ui.events.length, 0);
});
