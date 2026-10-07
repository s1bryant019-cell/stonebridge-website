import crypto from "node:crypto";
import {
  getRequestBody,
  insertSecureRecord,
  isSyntheticPreviewSubmission,
  isValidDateOfBirth,
  isValidEmail,
  normalize,
  normalizePhone,
  productionPhiGateReady,
  retentionConfigured,
  sameOriginRequest,
  secureStoreConfigured,
  sendGenericSecureQueueNotice
} from "./_secure-intake.js";
import {
  evaluateRouting,
  ROUTING_RULES_VERSION
} from "../lib/fit-safety-routing.mjs";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!sameOriginRequest(req)) {
    return res.status(403).json({ error: "Request origin not allowed." });
  }

  try {
    const body = getRequestBody(req);
    if (normalize(body.website, 200)) {
      return res.status(200).json({ ok: true });
    }

    const name = normalize(body.fullName, 120);
    const dateOfBirth = normalize(body.dateOfBirth, 10);
    const email = normalize(body.email, 254).toLowerCase();
    const mobile = normalizePhone(body.mobile);
    const service = normalize(body.service, 80);

    const fieldErrors = {};
    if (!name) fieldErrors.fullName = "Enter your full name.";
    if (!isValidDateOfBirth(dateOfBirth)) {
      fieldErrors.dateOfBirth = "Enter a valid date of birth.";
    }
    if (!isValidEmail(email)) {
      fieldErrors.email = "Enter a valid email address.";
    }
    if (!mobile) fieldErrors.mobile = "Enter your mobile phone number.";
    if (!service) fieldErrors.service = "Choose the type of care you are seeking.";

    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({
        error: "Review the highlighted fields.",
        fieldErrors
      });
    }

    const routing = evaluateRouting(body);
    const preview = isSyntheticPreviewSubmission({ name, email });

    if ((process.env.VERCEL_ENV || "") !== "production" && !preview) {
      return res.status(400).json({
        error:
          "Preview accepts synthetic test identities only. Use a name beginning with Test or Preview and an @example.com email address."
      });
    }

    if (!preview) {
      if (!productionPhiGateReady()) {
        return res.status(503).json({
          error:
            "This secure intake workflow is not enabled for production yet. Please use the consultation pathway."
        });
      }
      if (!secureStoreConfigured() || !retentionConfigured()) {
        return res.status(503).json({
          error:
            "The secure intake workflow is not fully configured. Please use the consultation pathway."
        });
      }
    }

    const submittedAt = new Date();
    const expiresAt =
      routing.state === "direct_request_eligible"
        ? new Date(submittedAt.getTime() + 14 * 24 * 60 * 60 * 1000)
        : null;

    // Urgent outcomes are intentionally not persisted in v1 until Stonebridge
    // finalizes the minimum-necessary internal urgent-event handling protocol.
    // The client receives emergency instructions immediately and is not told
    // to wait for routine Stonebridge review.
    if (!preview && routing.state !== "urgent_pathway") {
      await insertSecureRecord("fit_safety_submissions", {
        id: crypto.randomUUID(),
        submitted_at: submittedAt.toISOString(),
        expires_at: expiresAt ? expiresAt.toISOString() : null,
        routing_rules_version: ROUTING_RULES_VERSION,
        name,
        date_of_birth: dateOfBirth,
        email,
        mobile,
        service,
        routing_state: routing.state,
        routing_reason_codes:
          routing.state === "direct_request_eligible" ? [] : routing.reasonCodes,
        operational_status:
          routing.state === "direct_request_eligible"
            ? "awaiting_therapyportal_request"
            : "pending_review"
      });

      if (routing.state !== "direct_request_eligible") {
        await sendGenericSecureQueueNotice();
      }
    }

    return res.status(200).json({
      ok: true,
      routingState: routing.state,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      preview
    });
  } catch (error) {
    console.error("Fit & Safety Check API error", {
      code: error?.message || "UNKNOWN"
    });
    return res.status(500).json({
      error:
        "The secure screening workflow could not be completed. Please use the consultation pathway or contact Stonebridge."
    });
  }
}
