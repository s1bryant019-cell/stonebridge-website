import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = f=>readFileSync(new URL("../"+f,import.meta.url),"utf8");
const portal = "https://www.therapyportal.com/p/stonebridge60634/appointments/availability/";

test("assessment page describes process without advertising unconfirmed assessment appointments",()=>{
  const html=read("assessment.html");
  assert.match(html, /Assessment availability not confirmed/);
  assert.match(html, /Not bookable through the therapy portal/);
  assert.match(html, /does not mean that psychological assessment services have launched/);
  assert.match(html, /href="mailto:info@stonebridgepsychgroup.com\?subject=Psychological%20Assessment%20Inquiry"/);
  assert.doesNotMatch(html, /<span class="sb-utility-strip__item">Accepting new clients<\/span>/);
  assert.ok(!html.includes('href="'+portal+'"'),"assessment inquiry must never bypass the specialized pathway");
});

test("adolescent Group Therapy remains explicitly interest-gathering",()=>{
  const group=read("group-therapy.html");
  const home=read("home-current.html");
  assert.match(group, /Currently gathering interest/);
  assert.match(group, /The Lobby is currently gathering interest for a future adolescent group/);
  assert.match(home, /Adolescent group therapy currently gathering interest for a future cohort\./);
  assert.doesNotMatch(group, /The Lobby (?:is )?(?:actively enrolling|open for enrollment)/i);
});

test("professional student-group schedule is preserved pending owner verification",()=>{
  const professionals=read("for-clinicians.html");
  assert.match(professionals, /Student Peer Consultation Group/);
  assert.match(professionals, /third Friday of each month at 6:00 PM CT/);
  assert.match(professionals, /subject=Student%20Peer%20Consultation%20Group%20Inquiry/);
  assert.match(professionals, /student group is peer consultation, not supervision/);
});