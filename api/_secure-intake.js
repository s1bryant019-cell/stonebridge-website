const ROUTING_STATES = new Set([
  "direct_request_eligible",
  "administrative_resolution_required",
  "clinical_review_required",
  "urgent_pathway"
]);

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

export function secureStoreConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
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

export async function insertSecureRecord(table, record) {
  if (!secureStoreConfigured()) {
    throw new Error("SECURE_STORE_NOT_CONFIGURED");
  }
  if (!retentionConfigured()) {
    throw new Error("RETENTION_NOT_CONFIGURED");
  }

  const base = process.env.SUPABASE_URL.replace(/\/$/, "");
  const response = await fetch(`${base}/rest/v1/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      ...record,
      delete_at: record.delete_at || calculateDeleteAt(new Date())
    })
  });

  if (!response.ok) {
    console.error("Secure intake datastore insert failed", {
      table,
      status: response.status
    });
    throw new Error("SECURE_STORE_WRITE_FAILED");
  }
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
        "Open the approved secure system to review it. No client information is included in this email."
    })
  });

  if (!response.ok) {
    console.error("Generic secure queue notification failed", {
      status: response.status
    });
  }
}

export function assertRoutingState(state) {
  if (!ROUTING_STATES.has(state)) throw new Error("INVALID_ROUTING_STATE");
  return state;
}
