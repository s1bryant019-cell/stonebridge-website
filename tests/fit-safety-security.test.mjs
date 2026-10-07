import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fitHtml = await readFile(new URL("../fit-safety-check.html", import.meta.url), "utf8");
const fitJs = await readFile(new URL("../fit-safety-check.js", import.meta.url), "utf8");
const contactApi = await readFile(new URL("../api/contact.js", import.meta.url), "utf8");
const fitApi = await readFile(new URL("../api/fit-safety-check.js", import.meta.url), "utf8");
const secureIntake = await readFile(new URL("../api/_secure-intake.js", import.meta.url), "utf8");

function exportedFunctionSource(name) {
  const start = secureIntake.indexOf(`export function ${name}`);
  assert.notEqual(start, -1, `missing exported function: ${name}`);
  const next = secureIntake.indexOf("\nexport ", start + 1);
  return secureIntake.slice(start, next === -1 ? secureIntake.length : next);
}

function asyncExportedFunctionSource(name) {
  const start = secureIntake.indexOf(`export async function ${name}`);
  assert.notEqual(start, -1, `missing exported async function: ${name}`);
  const next = secureIntake.indexOf("\nexport ", start + 1);
  return secureIntake.slice(start, next === -1 ? secureIntake.length : next);
}

test("Fit & Safety Check does not execute analytics, advertising, or session replay code", () => {
  const source = fitHtml + "\n" + fitJs;
  assert.doesNotMatch(source, /gtag\s*\(|googletagmanager|google-analytics|fbq\s*\(|facebook pixel|hotjar|fullstory|clarity\s*\(|segment\.|mixpanel|amplitude/i);
});

test("Fit & Safety Check does not read or write browser storage or cookies", () => {
  assert.doesNotMatch(fitJs, /localStorage|sessionStorage|indexedDB|document\.cookie/i);
});

test("Fit & Safety Check does not propagate marketing query identifiers", () => {
  const source = fitHtml + "\n" + fitJs;
  assert.doesNotMatch(source, /utm_(source|medium|campaign|term|content)|gclid|fbclid|msclkid/i);
  assert.doesNotMatch(fitJs, /URLSearchParams|location\.search|location\.hash/i);
});

test("TherapyPortal handoff is a fixed destination rather than a response-derived URL", () => {
  assert.match(fitJs, /https:\/\/www\.therapyportal\.com\/p\/stonebridge60634\//);
  assert.doesNotMatch(fitJs, /therapyportal[^\n]+(routingState|reasonCodes|email|dateOfBirth|mobile)/i);
});

test("preview synthetic-identity protection is explicit and production cannot be treated as preview", () => {
  const fn = exportedFunctionSource("isSyntheticPreviewSubmission");
  assert.match(fn, /env === "production"\) return false/);
  assert.match(fn, /\^\(test\|preview\)\\b/i);
  assert.match(fn, /@example\\\.com\$/i);
});

test("production PHI workflow fails closed until deliberately approved", () => {
  const fn = exportedFunctionSource("productionPhiGateReady");
  assert.match(fn, /VERCEL_ENV/);
  assert.match(fn, /!== "production"\) return true/);
  assert.match(fn, /PHI_WORKFLOW_APPROVED === "true"/);
});

test("contact and Fit & Safety APIs both enforce preview and production security gates", () => {
  for (const source of [contactApi, fitApi]) {
    assert.match(source, /isSyntheticPreviewSubmission/);
    assert.match(source, /VERCEL_ENV/);
    assert.match(source, /productionPhiGateReady\(\)/);
    assert.match(source, /secureStoreConfigured\(\)/);
    assert.match(source, /retentionConfigured\(\)/);
    assert.match(source, /sameOriginRequest\(req\)/);
  }
});

test("Resend notification template is generic-only and does not interpolate client payload", () => {
  const fn = asyncExportedFunctionSource("sendGenericSecureQueueNotice");
  assert.match(fn, /subject: "New secure Stonebridge website item"/);
  assert.match(fn, /No client information is included in this email/);
  assert.doesNotMatch(fn, /\$\{[^}]*(fullName|name|dateOfBirth|email|phone|mobile|reason|service|routing)/i);
});
