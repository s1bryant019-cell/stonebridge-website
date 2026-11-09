import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("homepage restores the original composition with a concise appointment-first hero",()=>{
  for(const path of ["index.html","home-current.html"]){
    const html=read(path);
    assert.match(html,/A steadier place to/);
    assert.match(html,/Request an Appointment/);
    assert.match(html,/href="team\.html">Meet Our Clinicians<\/a>/);
    assert.match(html,/home-hero-room/);
    assert.match(html,/class="home-hero-facts"/);
    assert.match(html,/Aetna &amp; BCBSIL — Plan and Clinician Eligibility Varies/);
    assert.match(html,/class="home-services-grid"/);
    assert.equal((html.match(/class="home-service-card"/g)||[]).length,6);
    assert.match(html,/href="adult-therapy\.html"/);
    assert.match(html,/href="adolescent-therapy\.html"/);
    assert.doesNotMatch(html,/home-insurance-band|Using Insurance for Therapy\?/);
    assert.doesNotMatch(html,/<p class="home-hero-support">/);
    assert.equal((html.match(/24–48 hours/g)||[]).length,1);
    assert.match(html,/sb-utility-strip--home-intro" aria-hidden="true"/);
    assert.match(html,/height:24px/);
    assert.match(html,/height:14px/);
    assert.match(html,/When something feels <span class="home-recognition-nowrap">difficult to change/);
    assert.match(html,/You do not need a diagnosis or perfect words before reaching out/);
  }
});

test("fees explainer retains cost disclosure but exactly one insurance jump link",()=>{
  const html=read("fees-insurance.html");
  const intro=html.split('<section class="fees-cost-explainer"')[1].split("</section>")[0];
  assert.equal((intro.match(/href="#payment-options"/g)||[]).length,1);
  assert.match(intro,/>Review Accepted Insurance<\/a>/);
  assert.doesNotMatch(intro,/>View Accepted Insurance and Fees<\/a>/);
  for (const phrase of ["deductible","copay","coinsurance","out-of-pocket","plan"])assert.ok(intro.includes(phrase));
  assert.match(html,/id="payment-options"/);
});

test("only selected generic interior beige bands become decorative",()=>{
  for(const page of ["services.html","new-clients.html","contact.html"]){
    const html=read(page);
    assert.match(html,/<div class="sb-utility-strip sb-utility-strip--beige sb-utility-strip--quiet-transition" aria-hidden="true"><\/div>/);
    assert.doesNotMatch(html,/<section class="sb-utility-strip sb-utility-strip--beige"/);
    assert.match(html,/stonebridge-beige-refinement\.css\?v=20261028quietband1/);
  }
  const styles=read("stonebridge-beige-refinement.css");
  assert.match(styles,/\.sb-utility-strip\.sb-utility-strip--quiet-transition::after/);
  assert.match(styles,/@media\(max-width:760px\)[\s\S]*height:14px/);
  for(const page of ["about.html","individual-therapy.html","couples-therapy.html","family-therapy.html","parent-support.html","portal.html"]){
    const html=read(page);
    assert.match(html,/<section class="sb-utility-strip sb-utility-strip--beige/);
  }
});

test("consultation email and scheduling flows remain unmodified",()=>{
  const script=read("consultation-request.js");
  const api=read("api/consultation-request.mjs");
  const shared=read("script.js");
  assert.match(script,/fetch\("\/api\/consultation-request"/);
  assert.match(script,/receipt\.submitted!==true/);
  assert.match(api,/https:\/\/api\.resend\.com\/emails/);
  assert.match(shared,/function syncMobileConsultationCTAVisibility/);
  assert.match(read("contact.html"),/id="consultation-request-form"/);
  assert.match(read("contact.html"),/Request a free consultation/);
});
