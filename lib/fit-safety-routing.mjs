export const ROUTING_RULES_VERSION = "2026-10-v1";

export const ROUTING_STATES = Object.freeze({
  DIRECT: "direct_request_eligible",
  ADMINISTRATIVE: "administrative_resolution_required",
  CLINICAL: "clinical_review_required",
  URGENT: "urgent_pathway"
});

const OFFERED_SERVICES = new Set([
  "adult_individual",
  "adolescent_individual",
  "couples",
  "family",
  "parent_support",
  "group"
]);

function normalize(value, maxLength = 500) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

function list(value) {
  return Array.isArray(value) ? value.map((item) => normalize(item, 80)) : [];
}

function includesAny(values, candidates) {
  return candidates.some((candidate) => values.includes(candidate));
}

export function evaluateRouting(body = {}) {
  const reasons = [];
  let urgent = false;
  let clinical = false;
  let administrative = false;

  const service = normalize(body.service, 80);
  if (!OFFERED_SERVICES.has(service)) {
    administrative = true;
    reasons.push("service_scope");
  }

  // Group Therapy/The Lobby keeps its separate cohort-screening and placement
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
  const q2 = cssrs.q2 === "yes";
  const q3 = cssrs.q3 === "yes";
  const q4 = cssrs.q4 === "yes";
  const q5 = cssrs.q5 === "yes";
  const q6 = cssrs.q6 === "yes";
  const q6Recent = cssrs.q6Recent === "yes";

  // Q1 (passive death wish) alone has no automatic Stonebridge routing effect.
  if (q2 || q3) {
    clinical = true;
    reasons.push("suicide_review");
  }

  // Current intent/plan and suicidal behavior within the C-SSRS recent-behavior
  // window are not eligible for ordinary direct scheduling.
  if (q4 || q5) {
    urgent = true;
    reasons.push("suicide_emergency_override");
  }
  if (q6 && q6Recent) {
    urgent = true;
    reasons.push("recent_suicidal_behavior");
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

  let state = ROUTING_STATES.DIRECT;
  if (administrative) state = ROUTING_STATES.ADMINISTRATIVE;
  if (clinical) state = ROUTING_STATES.CLINICAL;
  if (urgent) state = ROUTING_STATES.URGENT;

  return {
    state,
    reasonCodes: [...new Set(reasons)]
  };
}
