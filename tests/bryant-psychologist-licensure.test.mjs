import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const file = name => readFileSync(new URL("../" + name, import.meta.url), "utf8");
const name = "Dr. Stephen W. Bryant, PsyD, LCPC, CCTP-I";
const portal = "https://www.therapyportal.com/p/stonebridge60634/appointments/availability/";

test("homepage keeps the approved founder card and updates only professional identity", () => {
  const home = file("index.html");
  assert.match(home, /<h3>Dr\. Stephen W\. Bryant, PsyD, LCPC, CCTP-I<\/h3>/);
  assert.match(home, /Founder &amp; Clinical Director · Clinical &amp; Forensic Psychologist/);
  assert.match(home, /founder-environmental\.png/);
  assert.match(home, /Meet Dr\. Bryant/);
  assert.ok(home.includes(portal));
  assert.match(home, /<h3>Jasmine Wilson, LPC<\/h3>/);
});

test("team and paid patient entry pages use psychologist credential without adding a forensic service", () => {
  const team = file("team.html");
  assert.match(team, /<h3>Dr\. Stephen W\. Bryant, PsyD, LCPC, CCTP-I<\/h3>/);
  assert.match(team, /Founder &amp; Clinical Director · Licensed Clinical Psychologist/);
  assert.match(team, /Clinical &amp; Forensic Psychology/);
  assert.doesNotMatch(team, /Clinical Psychology · Forensic Psychology · Forensic Assessment/);
  for (const page of ["adolescent-therapy-illinois.html", "trauma-therapy-illinois.html", "bcbs-therapy-illinois.html"]) {
    const html = file(page);
    assert.match(html, /<h3>Dr\. Stephen W\. Bryant, PsyD, LCPC, CCTP-I<\/h3>/, page);
    assert.match(html, /Founder &amp; Clinical Director · Licensed Clinical Psychologist/, page);
    assert.ok(html.includes(portal), page);
  }
});

test("founder profile retains education, adds licensure above LCPC, and preserves limited service scope", () => {
  const founder = file("team-founder.html");
  assert.match(founder, /<h1 class="profile-subpage-title">Dr\. Stephen W\. Bryant<\/h1>/);
  assert.match(founder, /PsyD, LCPC, CCTP-I · Clinical &amp; Forensic Psychologist · Founder &amp; Clinical Director/);
  assert.match(founder, /Training across clinical and forensic psychology\./);
  const list = founder.slice(founder.indexOf('class="founder-credential-list"'));
  assert.ok(list.indexOf("<h3>Licensed Clinical Psychologist</h3>") < list.indexOf("<h3>Licensed Clinical Professional Counselor (LCPC)</h3>"));
  for (const education of ["PsyD, Clinical Psychology", "MA, Clinical Psychology", "MA, Forensic Psychology"]) assert.ok(list.includes(education));
  assert.match(founder, /Stonebridge does not provide emergency or crisis services and is not currently offering psychological testing or forensic evaluations\./);
  assert.match(founder, /<title>Dr\. Stephen W\. Bryant \| Licensed Clinical Psychologist \| Stonebridge<\/title>/);
  assert.match(founder, /<meta property="og:title" content="Dr\. Stephen W\. Bryant \| Licensed Clinical Psychologist \| Stonebridge">/);
  assert.ok(founder.includes(portal));
});

test("supervision disclosure remains about Dr. Bryant; contact form preserves clinician option value", () => {
  const jasmine = file("team-jasmine-wilson.html");
  assert.match(jasmine, /Jasmine provides services under the clinical supervision of Dr\. Stephen W\. Bryant, PsyD, LCPC, CCTP-I, a licensed clinical psychologist\./);
  assert.match(jasmine, /Jasmine Wilson, LPC/);
  const contact = file("contact.html");
  assert.match(contact, /<option value="Dr\. Stephen W\. Bryant, PsyD, LCPC">Dr\. Stephen W\. Bryant — Licensed Clinical Psychologist<\/option>/);
  assert.match(contact, /id="consultation-request-form"/);
  assert.match(file("script.js"), /forceImage\(img, headshotSrc, 'Dr\. Stephen W\. Bryant, PsyD, LCPC, CCTP-I'\)/);
  assert.match(file("consultation-request.js"), /fetch\("\/api\/consultation-request"/);
});

test("therapy portal and existing assessment/group restrictions are not expanded", () => {
  for (const path of ["services.html", "assessment.html", "forensic.html", "group-therapy.html"]) {
    assert.doesNotMatch(file(path), /appointment to request forensic (?:assessments|evaluations)/i);
  }
  assert.match(file("group-therapy.html"), /contact\.html\?service=teen-group#inquiry-form/);
});
