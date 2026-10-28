import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("homepage corrects the desktop hierarchy while retaining mobile options and existing pathways",()=>{
  for(const path of ["index.html","home-current.html"]){
    const html=read(path);
    assert.match(html,/A steadier place to/);
    assert.match(html,/See Available Appointments/);
    assert.match(html,/home-hero-room/);
    assert.match(html,/Online psychotherapy in Illinois/);
    assert.match(html,/Psychotherapy for adults, adolescents, couples, and families navigating anxiety, depression, trauma, substance use, and relationship difficulties\./);
    assert.match(html,/home-hero-lede-default/);
    assert.match(html,/home-consultation-label-mobile/);
    assert.match(html,/home-consultation-label-desktop/);
    assert.match(html,/Prefer to speak first\? Request a free consultation\./);
    assert.match(html,/Insurance options vary by clinician and plan/);
    assert.match(html,/href="fees-insurance\.html#payment-options">Review accepted coverage\.<\/a>/);
    assert.match(html,/class="home-hero-facts"/);
    assert.match(html,/body\.home-redesign \.home-hero \.home-hero-facts,\s*body\.home-redesign \.home-hero \.home-hero-support \{display:none\}/);
    assert.match(html,/body\.home-redesign \.site-header\.sb-global-header \.header-cta \{display:none\}/);
    assert.match(html,/sb-utility-strip--home-intro" aria-hidden="true"><\/div>/);
    assert.match(html,/height:24px/);
    assert.match(html,/height:14px/);
    assert.doesNotMatch(html,/Clinical depth\. Relational understanding\. Careful fit\./);
    assert.doesNotMatch(html,/sb-home-intro-rule|sb-home-intro-statement/);
    assert.match(html,/When something feels <span class="home-recognition-nowrap">difficult to change\.<\/span>/);
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
