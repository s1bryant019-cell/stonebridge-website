import {
  isValidDateOfBirth,
  isValidEmail,
  listMatchingSecureRecords,
  listSecureQueue,
  normalize,
  productionPhiGateReady,
  resolveSecureRecord,
  secureStoreConfigured,
  staffReviewHostAllowed
} from "./_secure-intake.js";

function publicRecord(record, type) {
  return {
    type,
    id: record.id || null,
    submittedAt: record.submitted_at || null,
    expiresAt: record.expires_at || null,
    routingRulesVersion: record.routing_rules_version || null,
    name: record.name || record.full_name || "",
    dateOfBirth: record.date_of_birth || "",
    email: record.email || "",
    mobile: record.mobile || record.phone || "",
    service: record.service || record.service_requested || "",
    routingState: record.routing_state || null,
    routingReasonCodes: Array.isArray(record.routing_reason_codes) ? record.routing_reason_codes : [],
    operationalStatus: record.operational_status || "",
    preferredContact: record.preferred_contact || null,
    preferredClinician: record.preferred_clinician || null,
    generalAvailability: record.general_availability || null,
    insurancePreference: record.insurance_preference || null,
    reason: record.reason || null,
    pathname: record._pathname || null
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");

  if (!staffReviewHostAllowed(req)) {
    return res.status(404).json({ error: "Not found." });
  }
  if (!productionPhiGateReady()) {
    return res.status(503).json({ error: "Staff review is not enabled." });
  }
  if (!secureStoreConfigured()) {
    return res.status(503).json({ error: "Secure intake storage is not configured." });
  }

  try {
    if (req.method === "GET") {
      const mode = normalize(req.query?.mode || "queue", 40);

      if (mode === "match") {
        const email = normalize(req.query?.email || "", 254).toLowerCase();
        const dateOfBirth = normalize(req.query?.dateOfBirth || "", 10);
        if (!isValidEmail(email) || !isValidDateOfBirth(dateOfBirth)) {
          return res.status(400).json({ error: "Enter a valid email address and date of birth." });
        }
        const records = await listMatchingSecureRecords(
          "fit_safety_submissions",
          email,
          dateOfBirth
        );
        const now = Date.now();
        const matches = records
          .filter((record) => {
            if (record.routing_state !== "direct_request_eligible") return false;
            const expires = Date.parse(record.expires_at || "");
            return Number.isFinite(expires) && expires > now;
          })
          .map((record) => publicRecord(record, "fit_safety"));
        return res.status(200).json({ ok: true, matches });
      }

      const [fit, consultations] = await Promise.all([
        listSecureQueue("fit_safety_submissions", 250),
        listSecureQueue("consultation_requests", 250)
      ]);

      const queue = [
        ...fit
          .filter((record) => record.routing_state !== "direct_request_eligible")
          .map((record) => publicRecord(record, "fit_safety")),
        ...consultations.map((record) => publicRecord(record, "consultation"))
      ].sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));

      return res.status(200).json({ ok: true, queue });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "object" ? req.body : {};
      const action = normalize(body.action, 40);
      const pathname = normalize(body.pathname, 700);
      if (action !== "resolve" || !pathname) {
        return res.status(400).json({ error: "Invalid review action." });
      }
      await resolveSecureRecord(pathname);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error("Secure intake staff review failed", {
      code: error?.message || "UNKNOWN"
    });
    return res.status(500).json({ error: "Secure intake review could not be completed." });
  }
}
