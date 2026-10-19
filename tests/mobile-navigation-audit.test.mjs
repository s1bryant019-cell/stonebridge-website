import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("mobile anchor destinations clear the sticky site header", () => {
  const anchors = {
    "individual-therapy.html": ["adult-therapy", "adolescent-therapy"],
    "group-therapy.html": ["groups-forming", "how-groups-form", "before-joining"],
    "services.html": ["services-offered"],
    "team.html": ["clinicians"]
  };
  for (const [file, ids] of Object.entries(anchors)) {
    const html = page(file);
    const style = html.match(/<style id="stonebridge-mobile-section-anchor-20261019">([\s\S]*?)<\/style>/)?.[1];
    assert.ok(style, `Mobile anchor styling is missing from ${file}`);
    assert.match(style, /@media \(max-width:760px\)/);
    assert.match(style, /scroll-margin-top:88px/);
    for (const id of ids) {
      assert.ok(html.includes(`id="${id}"`), `Missing actual anchor ${id} in ${file}`);
      assert.ok(style.includes("#" + id), `Missing scroll offset for ${id} in ${file}`);
    }
  }
});

test("desktop and mobile versions of the shared hero descriptions are intentionally exclusive", () => {
  const services = page("services.html");
  const team = page("team.html");
  assert.match(services, /\.services-hero-title-desktop,\s*body\.services-page \.services-hero-description-desktop \{ display:none; \}/);
  assert.match(services, /@media \(min-width:1101px\)/);
  assert.match(services, /\.services-hero-title-default,\s*body\.services-page \.services-hero-description-default \{ display:none; \}/);
  assert.match(team, /\.team-hero-lede-desktop\{display:none;\}/);
  assert.match(team, /@media \(min-width:1101px\)/);
  assert.match(team, /\.team-hero-lede-default\{display:none;\}/);
});

test("clinician scheduling information remains available at mobile widths", () => {
  const founder = page("team-founder.html");
  const jasmine = page("team-jasmine-wilson.html");
  assert.match(founder, /@media\(max-width:1099px\)\{\s*\.founder-sticky-rail-slot\{\s*display:none!important;/);
  assert.match(founder, /class="founder-availability-grid"/);
  assert.match(jasmine, /@media\(max-width:1099px\)\{\s*\.jasmine-sticky-rail-slot\{\s*display:none!important;/);
  assert.match(jasmine, /class="cp-availability"/);
});

test("consultation scripts do not leave escaped newline characters in page text", () => {
  const contact = page("contact.html");
  assert.doesNotMatch(contact, /<script src="script\.js[^"]*"><\/script>\\n\s*<script/);
  assert.match(contact, /<script src="script\.js[^"]*"><\/script>\n\s*<script src="consultation-request\.js/);
});
