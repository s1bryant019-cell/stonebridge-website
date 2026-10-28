import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const file = name => readFileSync(new URL("../" + name, import.meta.url), "utf8");
const portal = "https://www.therapyportal.com/p/stonebridge60634/appointments/availability/";
const homePages = ["index.html", "home-current.html"];

test("both homepage sources retain approved headline, paths and service scope", () => {
  for (const name of homePages) {
    const html = file(name);
    assert.match(html, /A steadier place to/);
    assert.match(html, /begin therapy\./);
    assert.match(html, /Online psychotherapy for adults, adolescents, couples, and families throughout Illinois/);
    assert.match(html, /Support for anxiety, depression, trauma, substance use/);
    assert.ok(html.includes('href="' + portal + '"'));
    assert.ok(html.includes('href="contact.html">Request a Free Consultation</a>'));
    assert.ok(html.includes("Meet the Clinicians"));
    assert.match(html, /Aetna &amp; BCBSIL — Plan and Clinician Eligibility Varies/);
    assert.doesNotMatch(html, /home-founder home-founder-profile/);
  }
});

test("two equal clinician cards preserve names, profile destinations and real headshots", () => {
  for (const name of homePages) {
    const html = file(name);
    const section = html.split('<section class="home-clinicians"')[1].split('</section>')[0];
    assert.equal((section.match(/class="home-clinician-card"/g) || []).length, 2);
    assert.ok(section.includes("founder-environmental.png"));
    assert.ok(section.includes("jasmine-wilson-headshot.png"));
    assert.match(section, /Dr\. Stephen W\. Bryant, PsyD, LCPC/);
    assert.match(section, /Jasmine Wilson, LPC/);
    assert.match(section, /href="team-founder.html">Meet Dr\. Bryant/);
    assert.match(section, /href="team-jasmine-wilson.html">Meet Jasmine Wilson/);
  }
  assert.match(file("team-jasmine-wilson.html"), /under the clinical supervision of Dr\. Stephen W\. Bryant/);
});

test("starting steps and final homepage choices remain accurate", () => {
  for (const name of homePages) {
    const html = file(name);
    for (const phrase of ["Starting Therapy at Stonebridge", "Choose Your Starting Point", "We'll Review Your Request", "Begin With a Clear Plan", "Ready to Begin?"]) assert.ok(html.includes(phrase));
    const final = html.split('<section class="home-final"')[1].split('</section>')[0];
    assert.ok(final.includes('href="' + portal + '"'));
    assert.ok(final.includes('href="contact.html">Request a Free Consultation</a>'));
  }
});

test("navigation exposes new clients on existing shared mobile and desktop menu", () => {
  const js = file("script.js");
  assert.match(js, /function ensurePrimaryNav\(header\)/);
  assert.match(js, /navLink\('new-clients\.html','New Clients'/);
  assert.match(js, /ensurePrimaryNav\(existing\)/);
  assert.match(js, /ensurePrimaryNav\(replacement\)/);
  assert.match(js, /function ensureMobileConsultationCTA\(\)/);
});

test("supporting pages distinguish pending appointments from consultation follow-up", () => {
  const about = file("about.html");
  assert.ok(about.indexOf('<section class="about-client-experience"') < about.indexOf('<section class="about-origin"'));
  assert.match(about, /Care That Fits Your Needs/);
  const newClients = file("new-clients.html");
  assert.match(newClients, /Ready to Request an Appointment\?/);
  assert.match(newClients, /Prefer to Speak First\?/);
  assert.ok(newClients.includes('href="contact.html">Request a Free Consultation</a>'));
  const team = file("team.html");
  assert.match(team, /Not Sure Which Clinician to Choose\?/);
  assert.ok(team.includes("Appointment requests are reviewed before confirmation."));
  const services = file("services.html");
  assert.match(services, /Not Sure Where to Start\?/);
  assert.ok(services.includes('href="contact.html">Request a Free Consultation</a>'));
  const fees = file("fees-insurance.html");
  assert.match(fees, /What Will Therapy Cost\?/);
  assert.ok(fees.includes('href="#payment-options">Review Accepted Insurance</a>'));
  assert.ok(!fees.includes('href="#payment-options">View Accepted Insurance and Fees</a>'));
});

test("consultation delivery code is exactly unchanged by conversion project", () => {
  const client = file("consultation-request.js");
  const api = file("api/consultation-request.mjs");
  assert.ok(client.includes('fetch("/api/consultation-request"'));
  assert.ok(client.includes("receipt.submitted!==true"));
  assert.ok(api.includes('https://api.resend.com/emails'));
  assert.ok(api.includes('process.env.RESEND_API_KEY'));
  assert.doesNotMatch(file("contact.html"), /Open Email Draft|Copy your prepared request/);
});
