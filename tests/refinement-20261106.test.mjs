import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = name => readFileSync(new URL("../" + name, import.meta.url), "utf8");

test("future career inquiry uses recruitment email, never a patient intake route", () => {
  const careers = page("careers.html");
  const section = careers.slice(careers.indexOf('<section class="team-cta">'), careers.indexOf("</main>"));
  assert.match(section, /Ask About Future Opportunities/);
  assert.match(section, /mailto:info@stonebridgepsychgroup\.com\?subject=Future%20Career%20Opportunity%20Inquiry/);
  assert.doesNotMatch(section, /contact\.html|therapyportal\.com/);
  assert.match(careers, /View Role &amp; Apply on Indeed/);
});

test("services preserve anchors and separate clinical and professional entry points", () => {
  const services = page("services.html");
  const individual = page("individual-therapy.html");
  assert.match(services, /id="clinical-care-heading">Clinical Care/);
  assert.match(services, /id="professional-care-heading">Professional Services/);
  assert.match(services, /href="individual-therapy\.html#adult-therapy"/);
  assert.match(services, /href="individual-therapy\.html#adolescent-therapy"/);
  assert.match(individual, /id="adult-therapy"/);
  assert.match(individual, /id="adolescent-therapy"/);
  assert.match(individual, /#adolescent-therapy\{scroll-margin-top:88px;\}/);
  for (const name of ["couples", "family", "parent-support"]) {
    const html = page(name === "couples" ? "couples-therapy.html" : name === "family" ? "family-therapy.html" : "parent-support.html");
    assert.ok(html.includes("contact.html?service=" + name + "#inquiry-form"));
  }
});

test("consultation service selection is non-clinical, preselectable, optional", () => {
  const contact = page("contact.html");
  const frontend = page("consultation-request.js");
  const backend = page("api/consultation-request.mjs");
  assert.match(contact, /<select id="consultation-service" name="service"/);
  assert.match(contact, /Not sure — I'd like to discuss fit/);
  assert.match(contact, /<option value="teen-group">The Lobby/);
  assert.match(frontend, /allowedServices=\["adult","adolescent"/);
  assert.match(backend, /Object\.hasOwn\(SERVICE_LABELS, service\)/);
  assert.match(contact, /Please do not include clinical details/);
  assert.doesNotMatch(contact, /<textarea[^>]*name="(symptoms|diagnosis|history)"/i);
});

test("one scheduling schedule per clinician remains visible in mobile body", () => {
  const founder = page("team-founder.html");
  const jasmine = page("team-jasmine-wilson.html");
  assert.equal((founder.match(/class="founder-availability-grid"/g) || []).length, 1);
  assert.equal((founder.match(/class="founder-profile-rail-hours"/g) || []).length, 0);
  assert.equal((jasmine.match(/class="cp-availability"/g) || []).length, 1);
  assert.equal((jasmine.match(/class="jasmine-profile-rail-hours"/g) || []).length, 0);
  assert.match(founder, /founder-sticky-rail-slot\{\s*display:none!important/);
  assert.match(jasmine, /jasmine-sticky-rail-slot\{\s*display:none!important/);
});

test("The Lobby does not represent inquiries as confirmed enrollment", () => {
  assert.match(page("group-therapy.html"), /Interest inquiries open for a future cohort/);
  assert.match(page("group-therapy.html"), /contact\.html\?service=teen-group#inquiry-form/);
  assert.match(page("services.html"), /no start date confirmed/);
});

test("staging image candidates use existing repo files and preserve Professionals image", () => {
  assert.match(page("services.html"), /src="stone_arch_bridge_over_calm_water\.png"/);
  assert.match(page("family-therapy.html"), /src="cozy_family_telehealth_session\.png"/);
  assert.match(page("for-clinicians.html"), /src="team-consultation-room\.png"/);
});

test("inactive screening information follows primary privacy pathways", () => {
  const privacy = page("privacy-information.html");
  const active = privacy.indexOf("<h2>Routing and appointment requests</h2>");
  const consultation = privacy.indexOf("<h2>Speaking with Stonebridge first</h2>");
  const inactive = privacy.indexOf("<h2>Retained, inactive screening workflow</h2>");
  assert.ok(active > -1 && consultation > active && inactive > consultation);
  assert.match(privacy, /not part of routine public intake/);
  assert.match(privacy, /Google Ads consultation conversion/);
});
