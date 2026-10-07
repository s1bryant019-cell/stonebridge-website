import crypto from "node:crypto";
import { del, get, list, put } from "@vercel/blob";

const ROUTING_STATES = new Set([
  "direct_request_eligible",
  "administrative_resolution_required",
  "clinical_review_required",
  "urgent_pathway"
]);

const STORE_PREFIX = "secure-intake";

export function normalize(value, maxLength = 500) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

export function getRequestBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[\r\n]/.test(value);
}

export function isValidDateOfBirth(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T12:00:00Z");
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  if (parsed > now) return false;
  const earliest = new Date(Date.UTC(now.getUTCFullYear() - 120, now.getUTCMonth(), now.getUTCDate()));
  return parsed >= earliest;
}

export function normalizePhone(value) {
  return normalize(value, 50);
}

export function sameOriginRequest(req) {
  const origin = normalize(req.headers?.origin || "", 500);
  const host = normalize(req.headers?.host || "", 255);
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function isSyntheticPreviewSubmission(identity) {
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "";
  if (env === "production") return false;
  const name = normalize(identity?.name || identity?.fullName || "", 120);
  const email = normalize(identity?.email || "", 254).toLowerCase();
  return /^(test|preview)\b/i.test(name) && /@example\.com$/i.test(email);
}

export function productionPhiGateReady() {
  if ((process.env.VERCEL_ENV || "") !== "production") return true;
  return process.env.PHI_WORKFLOW_APPROVED === "true";
}

function decodeKey(name) {
  const raw = normalize(process.env[name] || "", 500);
  if (!raw) return null;
  let key;
  if (/^[0-9a-f]{64}$/i.test(raw)) key = Buffer.from(raw, "hex");
  else {
    try {
      key = Buffer.from(raw, "base64");
    } catch {
      return null;
    }
  }
  return key.length === 32 ? key : null;
}

export function secureStoreConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN &&
    decodeKey("INTAKE_ENCRYPTION_KEY") &&
    decodeKey("INTAKE_MATCHING_KEY")
  );
}

function retentionDays() {
  const days = Number.parseInt(process.env.INTAKE_RECORD_RETENTION_DAYS || "", 10);
  return Number.isFinite(days) && days > 0 ? days : null;
}

export function retentionConfigured() {
  return retentionDays() !== null;
}

export function calculateDeleteAt(from = new Date()) {
  const days = retentionDays();
  if (!days) return null;
  const date = new Date(from);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function identityHash(email, dateOfBirth) {
  const key = decodeKey("INTAKE_MATCHING_KEY");
  if (!key) throw new Error("MATCHING_KEY_NOT_CONFIGURED");
  const normalized = normalize(email, 254).toLowerCase() + "|" + normalize(dateOfBirth, 10);
  return crypto.createHmac("sha256", key).update(normalized).digest("hex");
}

function encryptRecord(record) {
  const key = decodeKey("INTAKE_ENCRYPTION_KEY");
  if (!key) throw new Error("ENCRYPTION_KEY_NOT_CONFIGURED");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(record), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    v: 1,
    alg: "A256GCM",
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: ciphertext.toString("base64")
  });
}

function decryptRecord(envelopeText) {
  const key = decodeKey("INTAKE_ENCRYPTION_KEY");
  if (!key) throw new Error("ENCRYPTION_KEY_NOT_CONFIGURED");
  const envelope = JSON.parse(envelopeText);
  if (envelope?.v !== 1 || envelope?.alg !== "A256GCM") {
    throw new Error("UNSUPPORTED_SECURE_RECORD");
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(envelope.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.data, "base64")),
    decipher.final()
  ]);
  return JSON.parse(plaintext.toString("utf8"));
}

function recordIdentity(record) {
  return {
    email: record.email || "",
    dateOfBirth: record.date_of_birth || record.dateOfBirth || ""
  };
}

function securePath(collection, record) {
  const identity = recordIdentity(record);
  if (!identity.email || !identity.dateOfBirth) throw new Error("SECURE_RECORD_IDENTITY_REQUIRED");
  const match = identityHash(identity.email, identity.dateOfBirth);
  const submitted = new Date(record.submitted_at || Date.now()).toISOString().replace(/[:.]/g, "-");
  const id = normalize(record.id || crypto.randomUUID(), 80).replace(/[^a-zA-Z0-9_-]/g, "");
  return `${STORE_PREFIX}/${collection}/${match}/${submitted}-${id}.json.enc`;
}

async function readBlobText(url) {
  const result = await get(url, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN
  });
  if (!result) throw new Error("SECURE_RECORD_NOT_FOUND");
  return new Response(result.stream).text();
}

async function readBlobRecord(blob) {
  const text = await readBlobText(blob.url);
  const record = decryptRecord(text);
  return { ...record, _pathname: blob.pathname, _url: blob.url };
}

async function listAll(prefix, max = 1000) {
  const blobs = [];
  let cursor;
  do {
    const page = await list({
      prefix,
      limit: Math.min(250, max - blobs.length),
      cursor,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && blobs.length < max);
  return blobs;
}

export async function insertSecureRecord(collection, record) {
  if (!secureStoreConfigured()) throw new Error("SECURE_STORE_NOT_CONFIGURED");
  if (!retentionConfigured()) throw new Error("RETENTION_NOT_CONFIGURED");

  const stored = {
    ...record,
    delete_at: record.delete_at || calculateDeleteAt(new Date())
  };
  const pathname = securePath(collection, stored);

  await put(pathname, encryptRecord(stored), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: "application/octet-stream",
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  return pathname;
}

export async function listMatchingSecureRecords(collection, email, dateOfBirth) {
  if (!secureStoreConfigured()) throw new Error("SECURE_STORE_NOT_CONFIGURED");
  const match = identityHash(email, dateOfBirth);
  const blobs = await listAll(`${STORE_PREFIX}/${collection}/${match}/`, 100);
  const records = [];
  for (const blob of blobs) {
    try {
      records.push(await readBlobRecord(blob));
    } catch (error) {
      console.error("Secure intake record read failed", { code: error?.message || "UNKNOWN" });
    }
  }
  return records.sort((a, b) => String(b.submitted_at).localeCompare(String(a.submitted_at)));
}

export async function listSecureQueue(collection, max = 250) {
  if (!secureStoreConfigured()) throw new Error("SECURE_STORE_NOT_CONFIGURED");
  const blobs = await listAll(`${STORE_PREFIX}/${collection}/`, max);
  const records = [];
  for (const blob of blobs) {
    try {
      const record = await readBlobRecord(blob);
      if (record.operational_status !== "resolved") records.push(record);
    } catch (error) {
      console.error("Secure intake queue read failed", { code: error?.message || "UNKNOWN" });
    }
  }
  return records
    .sort((a, b) => String(b.submitted_at).localeCompare(String(a.submitted_at)))
    .slice(0, max);
}

export async function resolveSecureRecord(pathname) {
  if (!secureStoreConfigured()) throw new Error("SECURE_STORE_NOT_CONFIGURED");
  const safePath = normalize(pathname, 700);
  if (!safePath.startsWith(`${STORE_PREFIX}/`)) throw new Error("INVALID_SECURE_RECORD_PATH");
  const blobs = await listAll(safePath, 2);
  const blob = blobs.find((item) => item.pathname === safePath);
  if (!blob) throw new Error("SECURE_RECORD_NOT_FOUND");
  const current = await readBlobRecord(blob);
  const updated = {
    ...current,
    _pathname: undefined,
    _url: undefined,
    operational_status: "resolved",
    resolved_at: new Date().toISOString()
  };
  await put(safePath, encryptRecord(updated), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/octet-stream",
    token: process.env.BLOB_READ_WRITE_TOKEN
  });
}

export async function deleteExpiredSecureRecords(now = new Date()) {
  if (!secureStoreConfigured()) throw new Error("SECURE_STORE_NOT_CONFIGURED");
  const blobs = await listAll(`${STORE_PREFIX}/`, 2000);
  const expiredUrls = [];
  for (const blob of blobs) {
    try {
      const record = await readBlobRecord(blob);
      const deleteAt = Date.parse(record.delete_at || "");
      if (Number.isFinite(deleteAt) && deleteAt <= now.getTime()) expiredUrls.push(blob.url);
    } catch (error) {
      console.error("Secure intake retention read failed", { code: error?.message || "UNKNOWN" });
    }
  }
  if (expiredUrls.length) {
    await del(expiredUrls, { token: process.env.BLOB_READ_WRITE_TOKEN });
  }
  return expiredUrls.length;
}

export async function sendGenericSecureQueueNotice() {
  const key = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!key || !toEmail) return;

  const fromEmail =
    process.env.CONTACT_FROM_EMAIL ||
    "Stonebridge Website <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: "New secure Stonebridge website item",
      text:
        "A new item is waiting in Stonebridge's secure intake workflow. " +
        "Open the protected Stonebridge staff review page to review it. No client information is included in this email."
    })
  });

  if (!response.ok) {
    console.error("Generic secure queue notification failed", {
      status: response.status
    });
  }
}

export function staffReviewHostAllowed(req) {
  const host = normalize(req.headers?.host || "", 255).toLowerCase().split(":")[0];
  return /^stonebridge-website(?:-[a-z0-9-]+)?\.vercel\.app$/.test(host);
}

export function assertRoutingState(state) {
  if (!ROUTING_STATES.has(state)) throw new Error("INVALID_ROUTING_STATE");
  return state;
}
