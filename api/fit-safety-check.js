import crypto from "node:crypto";
import {
  assertRoutingState,
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

const ROUTING_RULES_VERSION = "2026-10-v1";

const OFFERED_SERVICES = new Set([
  "adult_individual",
  "adolescent_individual",
  "couples",
  "family",
  "parent_support",
  "group"
]);

function list(value) {
  return Array.isArray(value) ? value.map((item) => normalize(item, 80)) : [];
}

function includesAny(values, candidates) {
  return candidates.some((candidate) => values.includes(candidate));
}

function evaluateRouting(body) {
  const reasons = [];
  let urgent = false;
  let clinical = false;
  let administrative = false;

  const service = normalize(body.service, 80);
  if (!OFFERED_SERVICES.has(service)) {
    administrative = true;
    reasons.push("service_scope");
  }
  // Group Therapy/The Lobby uses a separate cohort-screening and placement
  // workflow rather than the ordinary TherapyPortal intake-request handoff.
  if (service === "group") {
    administrative = true;
    reasons.push("group_enrollment_pathway");
  }

  const illinoisTelehealth = normalize(body.illinoisTelehealth, 20);
  if (illinoisTelehealth !== "yes") {
    administrative = true;
    reasons.push("jurisdiction");
  }

  const recentCare = list(body.recentCare);
  if (includesAny(recentCare, [
    "current_intensive",
    "discharged_30_days",
    "emergency_evaluation_30_days"
  ])) {
    clinical = true;
    reasons.push("recent_higher_acuity_care");
  }
  if (recentCare.includes("unsure")) {
    administrative = true;
    reasons.push("recent_care_clarification");
  }

  const immediateEmergency = normalize(body.immediateEmergency, 20);
  if (immediateEmergency === "yes") {
    urgent = true;
    reasons.push("immediate_emergency");
  }

  const currentAcuity = normalize(body.currentAcuity, 20);
  if (currentAcuity === "yes" || currentAcuity === "unsure") {
    clinical = true;
    reasons.push("current_level_of_care");
  }

  const adminIssues = list(body.adminIssues);
  if (adminIssues.some((item) => item !== "none")) {
    administrative = true;
    reasons.push("administrative_scope_or_consent");
  }

  const cssrs = body.cssrs && typeof body.cssrs === "object" ? body.cssrs : {};
  const q1 = cssrs.q1 === "yes";
  const q2 = cssrs.q2 === "yes";
  const q3 = cssrs.q3 === "yes";
  const q4 = cssrs.q4 === "yes";
  const q5 = cssrs.q5 === "yes";
  const q6 = cssrs.q6 === "yes";
  const q6Recent = cssrs.q6Recent === "yes";

  // Passive death wish alone (Q1 only) has no automatic routing consequence.
  if (q2 || q3) {
    clinical = true;
    reasons.push("suicide_review");
  }
  if (q6 && q6Recent) {
    clinical = true;
    reasons.push("recent_suicidal_behavior");
  }
  // Intent or plan indicates that the person may harm themselves and invokes
  // Stonebridge's existing emergency/crisis policy.
  if (q4 || q5) {
    urgent = true;
    reasons.push("suicide_emergency_override");
  }

  const riskOthers = list(body.riskOthers);
  if (riskOthers.includes("specific_person")) {
    clinical = true;
    reasons.push("risk_to_others_review");
  }
  if (includesAny(riskOthers, [
    "intent",
    "planning_or_preparation",
    "concern_may_act"
  ])) {
    urgent = true;
    reasons.push("risk_to_others_emergency_override");
  }

  const conjointSafety = normalize(body.conjointSafety, 20);
  if ((service === "couples" || service === "family") &&
      (conjointSafety === "yes" || conjointSafety === "unsure")) {
    clinical = true;
    reasons.push("conjoint_safety");
  }

  let state = "direct_request_eligible";
  if (administrative) state = "administrative_resolution_required";
  if (clinical) state = "clinical_review_required";
  if (urgent) state = "urgent_pathway";

  return {
    state: assertRoutingState(state),
    reasonCodes: [...new Set(reasons)]
  };
}

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
    // finalizes the internal urgent-event handling protocol. The client receives
    // emergency instructions immediately and is not told to wait for review.
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
