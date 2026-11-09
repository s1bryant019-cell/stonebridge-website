import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = file => readFileSync(new URL("../" + file, import.meta.url), "utf8");

test("dedicated adult and adolescent routes are discoverable and legacy overview anchors remain", () => {
  for (const page of ["home-current.html", "index.html", "services.html"]) {
    assert.match(read(page), /href="adult-therapy\.html"/);
    assert.match(read(page), /href="adolescent-therapy\.html"/);
  }
  const overview = read("individual-therapy.html");
  assert.match(overview, /id="adult-therapy"/);
  assert.match(overview, /id="adolescent-therapy"/);
  assert.match(read("adult-therapy.html"), /Individual Therapy for Adults/);
  assert.match(read("adolescent-therapy.html"), /Therapy for Teens and Adolescents/);
});

test("fees prioritize confirmed coverage and rates before pending networks", () => {
  const page = read("fees-insurance.html");
  const active = page.indexOf("<h3>Currently accepted insurance</h3>");
  const feeSchedule = page.indexOf('id="fee-schedule"');
  const pending = page.indexOf('id="pending-insurance-networks"');
  assert.ok(active > 0 && feeSchedule > active && pending > feeSchedule);
  assert.match(page, /Not currently active or billable as in-network/);
  assert.match(page, /Good Faith Estimates/);
});

test("professional and recruitment pages use audience-specific page labels", () => {
  assert.doesNotMatch(read("for-clinicians.html"), /<span class="sb-utility-strip__item">Accepting new clients<\/span>/);
  assert.doesNotMatch(read("careers.html"), /<span class="sb-utility-strip__item">Accepting new clients<\/span>/);
});

test("Lobby requests carry only the supported inquiry context and retain privacy handling", () => {
  const group = read("group-therapy.html");
  const contact = read("contact.html");
  const client = read("consultation-request.js");
  const handler = read("api/consultation-request.mjs");
  assert.match(group, /contact\.html\?service=teen-group#inquiry-form/);
  assert.match(contact, /id="consultation-service" name="service"/);
  assert.match(client, /Request a consultation about The Lobby/);
  assert.match(client, /service:service/);
  assert.match(handler, /"teen-group"/);
  assert.match(client, /fireGoogleAdsConsultationConversion\(\)/);
});

test("professional fees retain the mobile card layout and safe wrapping", () => {
  const page = read("for-clinicians.html");
  assert.match(page, /@media\(max-width:720px\)/);
  assert.match(page, /\.clinicians-fee-table td\{\s*display:block;\s*min-width:0;\s*overflow-wrap:anywhere;/);
});
