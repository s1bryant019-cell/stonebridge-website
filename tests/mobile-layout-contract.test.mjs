import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const file = (name) => readFileSync(new URL("../" + name, import.meta.url), "utf8");

test("New Clients mobile grid stays single-column after the compact desktop override", () => {
  const css = file("new-client-access.css");
  const compactAt = css.indexOf("Compact new-client landing layout");
  const fixAt = css.indexOf("Mobile layout stability — 2026-10-13");
  assert.ok(compactAt >= 0 && fixAt > compactAt, "The mobile correction must follow the compact desktop layout");
  const fix = css.slice(fixAt);
  assert.match(fix, /@media\(max-width:1080px\)[\s\S]*?\.new-client-access-page \.access-template-layout\s*\{\s*grid-template-columns:minmax\(0,1fr\)/);
  assert.match(fix, /\.new-client-access-page \.access-path-row \.btn\{min-height:44px\}/);
});

test("brief check keeps its safety notes and gains compact mobile spacing", () => {
  const html = file("fit-safety-check.html");
  const css = file("new-client-access.css");
  assert.match(html, /class="screen-emergency"/);
  assert.match(html, /id="fit-safety-form"/);
  assert.match(html, /new-client-access\.css\?v=20261013mobile2/);
  assert.match(css, /\.fit-safety-page \.screen-template-context \.screen-emergency\s*\{/);
  assert.match(css, /\.fit-safety-page \.screen-template-privacy\s*\{/);
});

test("paid landing pages keep compact mobile heroes and appointment-first links", () => {
  const css = file("paid-search-landing.css");
  assert.match(css, /Mobile hero proportion — 2026-10-13/);
  assert.match(css, /\.paid-search-page \.paid-hero-copy\s*\{\s*padding:34px 0 36px;/);
  const availability = 'href="https://www.therapyportal.com/p/stonebridge60634/appointments/availability/"';
  for (const page of ["adolescent-therapy-illinois.html", "bcbs-therapy-illinois.html", "trauma-therapy-illinois.html"]) {
    const html = file(page);
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
    assert.match(html, /paid-search-landing\.css\?v=20261013mobile1/);
    assert.ok(main.includes(availability), `${page} should link directly to appointment availability`);
    if (page === "bcbs-therapy-illinois.html") {
      assert.match(main, /See Available Appointments/);
      assert.match(html, /script\.js\?v=20261028stickyvisible2/);
      assert.match(html, /href="https:\/\/www\.therapyportal\.com\/p\/stonebridge60634\/appointments\/availability\/"/);
      assert.match(main, /Your request remains pending until Stonebridge reviews and confirms it/);
      assert.match(main, /Prefer to speak first\? Request a free consultation\./);
      assert.doesNotMatch(main, /class="btn btn-primary"[^>]*>Request an Appointment<\/a>/);
      assert.match(html, /\.paid-search-bcbs \.paid-final-cta\{display:none!important\}/);
    }
    assert.match(main, /See Available Appointments/);
    assert.doesNotMatch(main, /href="fit-safety-check\.html"/);
  }
});
test("narrow home headline and consultation form anchor have scoped overrides", () => {
  assert.match(file("home-current.html"), /@media\(max-width:480px\)\{\s*\.home-recognition-nowrap\{white-space:normal\}/);
  assert.match(file("contact.html"), /body\.contact-page #inquiry-form\{scroll-margin-top:84px\}/);
});

test("phone New Clients page puts direct appointments ahead of the retained crisis advisory", () => {
  const css = file("new-client-access.css");
  const fix = css.slice(css.indexOf("Mobile entry priority — 2026-10-13"));
  assert.match(fix, /\.new-client-access-page \.access-template-intro\{display:contents\}/);
  assert.match(fix, /\.new-client-access-page \.access-path-list\{grid-row:3\}/);
  assert.match(fix, /\.new-client-access-page \.access-template-note--rail\{\s*grid-row:4;/);
  const page = file("new-clients.html");
  assert.match(page, /Emergency or crisis care:/);
  assert.ok(page.includes('href="https://www.therapyportal.com/p/stonebridge60634/appointments/availability/"'));
  assert.match(page, /See Available Appointments/);
  assert.match(page, /href="contact\.html">Request a Free Consultation/);
  assert.doesNotMatch(page, /href="fit-safety-check\.html"/);
});
test("phone Brief Check keeps urgent-help and privacy text above the untouched form", () => {
  const css = file("new-client-access.css");
  const fix = css.slice(css.indexOf("Mobile entry priority — 2026-10-13"));
  assert.match(fix, /\.fit-safety-page \.screen-template-context h2\{display:none\}/);
  assert.match(fix, /\.fit-safety-page \.access-hero,\s*\.fit-safety-page \.access-hero-copy\{\s*min-height:clamp\(240px/);
  const screen = file("fit-safety-check.html");
  const noteAt = screen.indexOf('class="screen-emergency"');
  const privacyAt = screen.indexOf('class="screen-template-privacy"');
  const formAt = screen.indexOf('id="fit-safety-form"');
  assert.ok(noteAt >= 0 && privacyAt > noteAt && formAt > privacyAt);
  assert.match(screen, /call or text/);
  assert.match(screen, /id="screen-progress-text"/);
});
