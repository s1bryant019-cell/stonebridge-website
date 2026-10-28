import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = name => readFileSync(new URL("../" + name, import.meta.url), "utf8");
const homePages = ["index.html", "home-current.html"];

test("remove repeated reassurance and telehealth restatement while preserving key homepage sections", () => {
  for (const path of homePages) {
    const html = read(path);
    const section = (heading, end) => html.slice(html.indexOf(heading),html.indexOf(end,html.indexOf(heading)));
    const gettingStarted = section('<section class="home-start-steps"', '</section>');
    const services = section('<section class="home-services"', '</section>');
    assert.ok(gettingStarted.length > 0 && services.length > 0);
    assert.doesNotMatch(gettingStarted, /You do not need to have everything figured out before reaching out/);
    assert.equal((gettingStarted.match(/class="home-step-card"/g)||[]).length, 3);
    for (const step of ["Choose Your Starting Point", "We'll Review Your Request", "Begin With a Clear Plan"]) {
      assert.ok(gettingStarted.includes(step), step);
    }
    assert.match(services, /<p>Explore what each service offers\.<\/p>/);
    assert.doesNotMatch(services, /Online psychotherapy throughout Illinois for a range of concerns and life stages/);
    assert.match(html,/You do not need a diagnosis or perfect words before reaching out/);
  }
});

test("mobile insurance summary links to full eligible-network detail without listing an incomplete subset", () => {
  const coverage = read("fees-insurance.html");
  for (const term of ["Aetna", "Medicaid FFS", "Guidehealth Behavioral Health Network", "BCBSIL"]) {
    assert.ok(coverage.includes(term), "fees page preserves " + term);
  }
  assert.match(coverage, /id="payment-options"/);
  for (const path of homePages) {
    const html = read(path);
    const facts = html.split('<ul class="home-hero-facts" aria-label="Practice information">')[1]?.split("</ul>")[0];
    assert.ok(facts,"home facts remain available to mobile visitors");
    assert.match(facts,/Insurance options vary by clinician and plan/);
    assert.match(facts,/href="fees-insurance\.html#payment-options">Review accepted coverage\.<\/a>/);
    assert.doesNotMatch(facts,/Aetna &amp; BCBSIL/);
    assert.match(html,/body\.home-redesign \.home-hero \.home-hero-facts,/);
    assert.match(html,/\.home-hero \.home-hero-facts a\{color:inherit;text-decoration:underline/);
  }
});

test("homepage group card identifies current gathering-interest status without implying immediate enrollment", () => {
  const group = read("group-therapy.html");
  assert.match(group,/Featured group · Gathering interest/);
  assert.match(group,/An inquiry does not guarantee placement or a specific start date/);
  for (const path of homePages) {
    const html = read(path);
    const service = html.split('href="group-therapy.html"')[1]?.split("</a>")[0];
    assert.ok(service);
    assert.match(service,/Group Therapy/);
    assert.match(service,/Featured teen group gathering interest; consultation available/);
    assert.doesNotMatch(service,/Enroll now|Guaranteed|Immediate placement/i);
  }
});

test("Stonebridge Perspective has one concise message in both homepage sources", () => {
  const expected = "Stonebridge provides clinically grounded psychotherapy within a clear and relational setting.";
  for (const path of homePages) {
    const html = read(path);
    const section = html.split('<section class="home-perspective"')[1]?.split("</section>")[0];
    assert.ok(section);
    assert.equal((section.match(/class="home-perspective-copy"/g)||[]).length,1);
    assert.ok(section.includes(expected));
    assert.doesNotMatch(section,/home-perspective-copy-default|home-perspective-copy-desktop/);
    assert.doesNotMatch(section,/Clinically grounded, relational psychotherapy for adolescents/);
  }
});

test("existing booking, consultation and sticky mobile flows remain intact", () => {
  const appointment = "https://www.therapyportal.com/p/stonebridge60634/appointments/availability/";
  const script = read("script.js");
  assert.match(script,/function syncMobileConsultationCTAVisibility/);
  assert.match(read("consultation-request.js"),/fetch\("\/api\/consultation-request"/);
  assert.match(read("api/consultation-request.mjs"),/https:\/\/api\.resend\.com\/emails/);
  for (const path of homePages) {
    const html=read(path);
    assert.ok(html.includes(appointment));
    assert.match(html,/href="contact.html"><span class="home-consultation-label-mobile">Request a Free Consultation<\/span>/);
    assert.match(html,/class="sb-utility-strip sb-utility-strip--beige sb-utility-strip--home-intro" aria-hidden="true"/);
    assert.match(html,/When something feels/);
    assert.match(html,/class="home-clinicians"/);
  }
});
