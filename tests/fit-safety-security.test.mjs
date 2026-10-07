import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  isSyntheticPreviewSubmission,
  productionPhiGateReady,
  sendGenericSecureQueueNotice
} from "../api/_secure-intake.js";

const fitHtml = await readFile(new URL("../fit-safety-check.html", import.meta.url), "utf8");
const fitJs = await readFile(new URL("../fit-safety-check.js", import.meta.url), "utf8");
const contactApi = await readFile(new URL("../api/contact.js", import.meta.url), "utf8");
const fitApi = await readFile(new URL("../api/fit-safety-check.js", import.meta.url), "utf8");

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

test("preview submissions require synthetic identity outside production", () => {
  const oldVercel = process.env.VERCEL_ENV;
  const oldNode = process.env.NODE_ENV;
  try {
    process.env.VERCEL_ENV = "preview";
    process.env.NODE_ENV = "test";
    assert.equal(isSyntheticPreviewSubmission({ name: "Test Client", email: "client@example.com" }), true);
    assert.equal(isSyntheticPreviewSubmission({ name: "Preview Person", email: "person@example.com" }), true);
    assert.equal(isSyntheticPreviewSubmission({ name: "Real Client", email: "client@example.com" }), false);
    assert.equal(isSyntheticPreviewSubmission({ name: "Test Client", email: "client@gmail.com" }), false);
  } finally {
    if (oldVercel === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = oldVercel;
    if (oldNode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldNode;
  }
});

test("production PHI workflow fails closed until deliberately approved", () => {
  const oldVercel = process.env.VERCEL_ENV;
  const oldApproved = process.env.PHI_WORKFLOW_APPROVED;
  try {
    process.env.VERCEL_ENV = "production";
    delete process.env.PHI_WORKFLOW_APPROVED;
    assert.equal(productionPhiGateReady(), false);
    process.env.PHI_WORKFLOW_APPROVED = "false";
    assert.equal(productionPhiGateReady(), false);
    process.env.PHI_WORKFLOW_APPROVED = "true";
    assert.equal(productionPhiGateReady(), true);
  } finally {
    if (oldVercel === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = oldVercel;
    if (oldApproved === undefined) delete process.env.PHI_WORKFLOW_APPROVED; else process.env.PHI_WORKFLOW_APPROVED = oldApproved;
  }
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

test("Resend notification is generic and contains no client payload", async () => {
  const oldFetch = globalThis.fetch;
  const oldKey = process.env.RESEND_API_KEY;
  const oldTo = process.env.CONTACT_TO_EMAIL;
  const oldFrom = process.env.CONTACT_FROM_EMAIL;
  let captured;

  try {
    process.env.RESEND_API_KEY = "test-key";
    process.env.CONTACT_TO_EMAIL = "queue@example.com";
    process.env.CONTACT_FROM_EMAIL = "Stonebridge Test <sender@example.com>";
    globalThis.fetch = async (url, options) => {
      captured = { url, options };
      return { ok: true, status: 200 };
    };

    await sendGenericSecureQueueNotice();
    assert.ok(captured);
    const body = JSON.parse(captured.options.body);
    assert.equal(body.subject, "New secure Stonebridge website item");
    assert.match(body.text, /No client information is included/i);
    assert.doesNotMatch(body.text, /name|date of birth|phone|mobile|suicid|diagnos|reason for therapy/i);
    assert.deepEqual(Object.keys(body).sort(), ["from", "subject", "text", "to"]);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = oldKey;
    if (oldTo === undefined) delete process.env.CONTACT_TO_EMAIL; else process.env.CONTACT_TO_EMAIL = oldTo;
    if (oldFrom === undefined) delete process.env.CONTACT_FROM_EMAIL; else process.env.CONTACT_FROM_EMAIL = oldFrom;
  }
});
