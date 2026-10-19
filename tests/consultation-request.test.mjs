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

test("fails closed when no approved delivery gateway is configured", async () => {
  delete process.env.STONEBRIDGE_CONSULTATION_DELIVERY_URL;
  delete process.env.STONEBRIDGE_CONSULTATION_DELIVERY_TOKEN;
  const response = await POST(request());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { delivered: false });
  assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
});

test("rejects cross-origin, incomplete, and bot submissions without contacting gateway", async () => {
  for (const item of [
    [request(valid, { origin: "https://external.example" }), 403],
    [request({ ...valid, fullName: "" }), 422],
    [request({ ...valid, email: "invalid" }), 422],
    [request({ ...valid, website: "bot-filled" }), 422],
    [request({ ...valid, preferredContact: "other" }), 422],
    [request({ ...valid, service: "arbitrary-medical-details" }), 422],
    [request({ ...valid, availability: "a".repeat(301) }), 422]
  ]) {
    const response = await POST(item[0]);
    assert.equal(response.status, item[1]);
    assert.equal((await response.json()).delivered, false);
  }
});

test("succeeds only when secure provider explicitly confirms delivery", async t => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.STONEBRIDGE_CONSULTATION_DELIVERY_URL;
  const originalToken = process.env.STONEBRIDGE_CONSULTATION_DELIVERY_TOKEN;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.STONEBRIDGE_CONSULTATION_DELIVERY_URL;
    else process.env.STONEBRIDGE_CONSULTATION_DELIVERY_URL = originalUrl;
    if (originalToken === undefined) delete process.env.STONEBRIDGE_CONSULTATION_DELIVERY_TOKEN;
    else process.env.STONEBRIDGE_CONSULTATION_DELIVERY_TOKEN = originalToken;
  });
  process.env.STONEBRIDGE_CONSULTATION_DELIVERY_URL = "https://approved-intake.example.test/receive";
  process.env.STONEBRIDGE_CONSULTATION_DELIVERY_TOKEN = "test-token";

  let deliveredPayload;
  globalThis.fetch = async (destination, options) => {
    assert.equal(destination, process.env.STONEBRIDGE_CONSULTATION_DELIVERY_URL);
    assert.equal(options.headers.Authorization, "Bearer test-token");
    assert.equal(options.redirect, "error");
    deliveredPayload = JSON.parse(options.body);
    return new Response(JSON.stringify({ delivered: true }), { status: 200 });
  };
  let response = await POST(request({ ...valid, gbraid: "bridge-456", wbraid: "web-789" }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { delivered: true });
  assert.equal(deliveredPayload.attribution.gclid, "click-123");
  assert.equal(deliveredPayload.attribution.gbraid, "bridge-456");
  assert.equal(deliveredPayload.attribution.wbraid, "web-789");
  assert.equal(deliveredPayload.email, "example@example.test");
  assert.equal(deliveredPayload.service, "");

  response = await POST(request({ ...valid, service: "teen-group" }));
  assert.equal(response.status, 200);
  assert.equal(deliveredPayload.service, "teen-group");


  globalThis.fetch = async () => new Response(JSON.stringify({ accepted: true }), { status: 202 });
  response = await POST(request());
  assert.equal(response.status, 502);
  assert.equal((await response.json()).delivered, false);

  globalThis.fetch = async () => new Response(JSON.stringify({ delivered: false }), { status: 200 });
  response = await POST(request());
  assert.equal(response.status, 502);

  globalThis.fetch = async () => { throw new Error("provider failure"); };
  response = await POST(request());
  assert.equal(response.status, 502);
  assert.equal((await response.json()).delivered, false);
});
