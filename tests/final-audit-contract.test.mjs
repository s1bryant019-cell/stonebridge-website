import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const portal = "https://www.therapyportal.com/p/stonebridge60634/appointments/availability/";
const consultation = "Prefer to speak first? Request a free consultation.";

test("every HTML page loads the current sticky-visibility script with one shared cache version", () => {
  const paths = readdirSync(new URL("../", import.meta.url)).filter(p => p.endsWith(".html") && /src="script\.js\?v=/.test(read(p)));
  assert.ok(paths.length >= 24);
  for (const path of paths) {
    const found = read(path).match(/src="script\.js\?v=([^"]+)"/g) ?? [];
    assert.deepEqual(found, ['src="script.js?v=20261028stickyvisible2"'], path);
    assert.ok(read(path).includes('<main'), path + " main present");
  }
});

test("five service and about pages offer one quiet optional consultation text link beside final appointment CTA", () => {
  for (const [path, section] of [
    ["about.html", "about-cta"],
    ["individual-therapy.html", "individual-cta"],
    ["couples-therapy.html", "couples-cta"],
    ["family-therapy.html", "family-cta"],
    ["parent-support.html", "parent-cta"]
  ]) {
    const html = read(path);
    const start = html.indexOf('<section class="' + section + '">');
    const stop = html.indexOf("</section>", start);
    assert.ok(start >= 0 && stop > start, path + ": final section");
    const final = html.slice(start, stop);
    assert.equal(final.split('href="' + portal + '"').length - 1, 1, path);
    assert.equal(final.split(consultation).length - 1, 1, path);
    assert.match(final, /class="profile-consultation-link" href="contact\.html#inquiry-form"/);
    assert.equal(html.split(consultation).length - 1, 1, path);
  }
  assert.doesNotMatch(read("group-therapy.html"), /Prefer to speak first\? Request a free consultation\./);
  assert.match(read("group-therapy.html"), /contact\.html\?service=teen-group#inquiry-form/);
});

test("fees introduction describes clinician/plan eligibility without changing the accepted network list", () => {
  const fees = read("fees-insurance.html");
  assert.match(fees, /Insurance participation varies by plan and clinician\. Review accepted plans and coverage details below\./);
  assert.match(fees, /href="#payment-options">Review Accepted Insurance<\/a>/);
  assert.doesNotMatch(fees, /<span class="sb-utility-strip__item">Aetna \+ BCBSIL<\/span>/);
  for(const name of ["Aetna", "Blue Cross Blue Shield of Illinois", "Medicaid FFS", "Guidehealth Behavioral Health Network - Advocate Medical Group West"]) {
    assert.ok(fees.includes(name), name);
  }
  assert.match(fees, /Not currently active or billable as in-network/);
  assert.match(fees, /\$275/);
});

test("consultation and appointment systems retain the original safe workflow", () => {
  const script = read("script.js");
  assert.match(script, /syncMobileConsultationCTAVisibility\(cta\)/);
  assert.match(script, /href = 'https:\/\/www\.therapyportal\.com\/p\/stonebridge60634\/appointments\/availability\/'/);
  const contact = read("contact.html");
  assert.match(contact, /id="consultation-request-form"/);
  assert.match(contact, /<h1 id="contact-page-title">Request a free consultation<\/h1>/);
  assert.match(read("consultation-request.js"), /receipt\.submitted!==true/);
  assert.match(read("api/consultation-request.mjs"), /https:\/\/api\.resend\.com\/emails/);
});
