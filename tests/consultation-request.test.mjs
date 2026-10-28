import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../api/consultation-request.mjs";

const url = "https://stonebridgepsychgroup.com/api/consultation-request";
const valid = {
  fullName: "Example Person",
  email: "example@example.test",
  phone: "",
  preferredContact: "",
  preferredClinician: "",
  availability: "",
  website: "",
  gclid: "click-123",
  gbraid: "",
  wbraid: ""
};

function request(fields = valid, overrides = {}) {
  return new Request(url, {
    method: "POST",
    headers: { origin: "https://stonebridgepsychgroup.com", "content-type": "application/json", ...overrides },
    body: JSON.stringify(fields)
  });
}

test("missing Resend configuration fails safely", async t => {
  const keys = ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"];
  const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  });
  for (const key of keys) delete process.env[key];
  const response = await POST(request());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { submitted: false });
  assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
});

test("invalid, cross-origin and bot submissions are rejected before email sending", async () => {
  for (const [req, status] of [
    [request(valid, { origin: "https://external.example" }), 403],
    [request({ ...valid, fullName: "" }), 422],
    [request({ ...valid, email: "invalid" }), 422],
    [request({ ...valid, website: "bot-filled" }), 422],
    [request({ ...valid, preferredContact: "other" }), 422],
    [request({ ...valid, service: "unsupported-medical-details" }), 422],
    [request({ ...valid, availability: "a".repeat(301) }), 422]
  ]) {
    const response = await POST(req);
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { submitted: false });
  }
});

test("uses existing Resend configuration and reports success only on provider acceptance", async t => {
  const originalFetch = globalThis.fetch;
  const keys = ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"];
  const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => {
    globalThis.fetch = originalFetch;
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  });
  process.env.RESEND_API_KEY = "test-key";
  process.env.CONTACT_FROM_EMAIL = "Stonebridge Website <website@stonebridgepsychgroup.com>";
  process.env.CONTACT_TO_EMAIL = "info@stonebridgepsychgroup.com";

  let mail;
  globalThis.fetch = async (destination, options) => {
    assert.equal(destination, "https://api.resend.com/emails");
    assert.equal(options.headers.Authorization, "Bearer test-key");
    assert.equal(options.redirect, "error");
    mail = JSON.parse(options.body);
    return new Response(JSON.stringify({ id: "generated-resend-message-id" }), { status: 200 });
  };

  let response = await POST(request({ ...valid, phone: "773-555-0199", gbraid: "bridge-456" }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { submitted: true });
  assert.equal(mail.from, "Stonebridge Website <website@stonebridgepsychgroup.com>");
  assert.deepEqual(mail.to, ["info@stonebridgepsychgroup.com"]);
  assert.equal(mail.reply_to, "example@example.test");
  assert.match(mail.text, /Name: Example Person/);
  assert.match(mail.text, /Email: example@example.test/);
  assert.match(mail.text, /Phone: 773-555-0199/);
  assert.ok(!mail.text.includes("click-123"));
  assert.ok(!mail.text.includes("bridge-456"));
  assert.ok(!mail.text.includes("arbitrary-medical-details"));
  assert.equal(mail.subject, "New Stonebridge consultation request");

  response = await POST(request({ ...valid, service: "teen-group" }));
  assert.equal(response.status, 200);
  assert.match(mail.text, /Inquiry: The Lobby/);

  globalThis.fetch = async () => new Response(JSON.stringify({ accepted: true }), { status: 202 });
  response = await POST(request());
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { submitted: false });

  globalThis.fetch = async () => new Response(JSON.stringify({ id: "" }), { status: 200 });
  response = await POST(request());
  assert.equal(response.status, 502);

  globalThis.fetch = async () => new Response(JSON.stringify({ message: "failed" }), { status: 403 });
  response = await POST(request());
  assert.equal(response.status, 502);

  globalThis.fetch = async () => { throw new Error("provider failure"); };
  response = await POST(request());
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { submitted: false });
});
