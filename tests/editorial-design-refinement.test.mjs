import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("home hero keeps original booking, consultation, availability and clinician paths",()=>{
  for(const path of ["index.html","home-current.html"]){
    const html=read(path);
    assert.match(html,/A steadier place to/);
    assert.match(html,/Request a Free Consultation/);
    assert.match(html,/See Available Appointments/);
    assert.match(html,/Aetna &amp; BCBSIL — Plan and Clinician Eligibility Varies/);
    assert.match(html,/Meet the Clinicians/);
    assert.match(html,/home-hero-room/);
    assert.match(html,/Clinical depth\. Relational understanding\. Careful fit\./);
    assert.match(html,/min-height:56px/);
    assert.match(html,/height:14px/);
    assert.match(html,/sb-home-intro-rule/);
    assert.match(html,/font-size:clamp\(\.8125rem,1\.1vw,\.875rem\)/);
    assert.match(html,/\.home-hero-support a:focus-visible/);
    const band=html.match(/<div class="sb-utility-strip sb-utility-strip--beige sb-utility-strip--home-intro">([\s\S]*?)<\/div>\s*<\/div>/);
    assert.ok(band,"Dedicated editorial band missing");
    assert.ok(!band[1].includes("Accepting new clients"),"Do not repeat hero availability in band");
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
