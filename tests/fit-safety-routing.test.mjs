import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRouting, ROUTING_STATES } from "../lib/fit-safety-routing.mjs";

function baseline(overrides = {}) {
  const value = {
    service: "adult_individual",
    illinoisTelehealth: "yes",
    recentCare: ["none"],
    immediateEmergency: "no",
    currentAcuity: "no",
    adminIssues: ["none"],
    cssrs: {
      q1: "no",
      q2: "no",
      q3: "",
      q4: "",
      q5: "",
      q6: "no",
      q6Recent: ""
    },
    riskOthers: ["none"],
    conjointSafety: "",
    ...overrides
  };

  if (overrides.cssrs) {
    value.cssrs = { ...baseline().cssrs, ...overrides.cssrs };
  }
  return value;
}

function expectState(name, body, expected, expectedReason) {
  test(name, () => {
    const result = evaluateRouting(body);
    assert.equal(result.state, expected);
    if (expectedReason) assert.ok(result.reasonCodes.includes(expectedReason));
  });
}

expectState(
  "ordinary outpatient request is direct-request eligible",
  baseline(),
  ROUTING_STATES.DIRECT
);

expectState(
  "passive death wish alone has no automatic routing consequence",
  baseline({ cssrs: { q1: "yes" } }),
  ROUTING_STATES.DIRECT
);

expectState(
  "active suicidal ideation without intent requires clinical review",
  baseline({ cssrs: { q2: "yes", q3: "no", q4: "no", q5: "no" } }),
  ROUTING_STATES.CLINICAL,
  "suicide_review"
);

expectState(
  "method thoughts without intent require clinical review",
  baseline({ cssrs: { q2: "yes", q3: "yes", q4: "no", q5: "no" } }),
  ROUTING_STATES.CLINICAL,
  "suicide_review"
);

expectState(
  "current suicide intent invokes urgent pathway",
  baseline({ cssrs: { q2: "yes", q3: "yes", q4: "yes", q5: "no" } }),
  ROUTING_STATES.URGENT,
  "suicide_emergency_override"
);

expectState(
  "current suicide plan invokes urgent pathway",
  baseline({ cssrs: { q2: "yes", q3: "yes", q4: "no", q5: "yes" } }),
  ROUTING_STATES.URGENT,
  "suicide_emergency_override"
);

expectState(
  "recent suicidal behavior invokes urgent pathway",
  baseline({ cssrs: { q6: "yes", q6Recent: "yes" } }),
  ROUTING_STATES.URGENT,
  "recent_suicidal_behavior"
);

expectState(
  "current intensive treatment requires clinical review",
  baseline({ recentCare: ["current_intensive"] }),
  ROUTING_STATES.CLINICAL,
  "recent_higher_acuity_care"
);

expectState(
  "discharge from intensive treatment within 30 days requires clinical review",
  baseline({ recentCare: ["discharged_30_days"] }),
  ROUTING_STATES.CLINICAL,
  "recent_higher_acuity_care"
);

expectState(
  "psychiatric emergency or crisis evaluation within 30 days requires clinical review",
  baseline({ recentCare: ["emergency_evaluation_30_days"] }),
  ROUTING_STATES.CLINICAL,
  "recent_higher_acuity_care"
);

expectState(
  "current need for more intensive care requires clinical review",
  baseline({ currentAcuity: "yes" }),
  ROUTING_STATES.CLINICAL,
  "current_level_of_care"
);

expectState(
  "uncertainty about current intensive-care need is conservatively reviewed",
  baseline({ currentAcuity: "unsure" }),
  ROUTING_STATES.CLINICAL,
  "current_level_of_care"
);

expectState(
  "outside-Illinois telehealth request requires administrative resolution",
  baseline({ illinoisTelehealth: "no" }),
  ROUTING_STATES.ADMINISTRATIVE,
  "jurisdiction"
);

expectState(
  "uncertain Illinois jurisdiction requires administrative resolution",
  baseline({ illinoisTelehealth: "unsure" }),
  ROUTING_STATES.ADMINISTRATIVE,
  "jurisdiction"
);

for (const issue of [
  "formal_evaluation",
  "mandated_treatment",
  "legal_reporting",
  "consent_authority"
]) {
  expectState(
    `administrative issue ${issue} resolves administratively first`,
    baseline({ adminIssues: [issue] }),
    ROUTING_STATES.ADMINISTRATIVE,
    "administrative_scope_or_consent"
  );
}

expectState(
  "specific-person risk to others requires clinical review",
  baseline({ riskOthers: ["specific_person"] }),
  ROUTING_STATES.CLINICAL,
  "risk_to_others_review"
);

for (const issue of ["intent", "planning_or_preparation", "concern_may_act"]) {
  expectState(
    `meaningful current risk-to-others trigger ${issue} invokes urgent pathway`,
    baseline({ riskOthers: [issue] }),
    ROUTING_STATES.URGENT,
    "risk_to_others_emergency_override"
  );
}

expectState(
  "couples safety concern requires clinical review",
  baseline({ service: "couples", conjointSafety: "yes" }),
  ROUTING_STATES.CLINICAL,
  "conjoint_safety"
);

expectState(
  "family safety uncertainty requires clinical review",
  baseline({ service: "family", conjointSafety: "unsure" }),
  ROUTING_STATES.CLINICAL,
  "conjoint_safety"
);

expectState(
  "conjoint safety answer does not affect ordinary individual request",
  baseline({ service: "adult_individual", conjointSafety: "yes" }),
  ROUTING_STATES.DIRECT
);

expectState(
  "Group Therapy and The Lobby retain the administrative cohort-enrollment pathway",
  baseline({ service: "group" }),
  ROUTING_STATES.ADMINISTRATIVE,
  "group_enrollment_pathway"
);

expectState(
  "unknown service requires administrative resolution",
  baseline({ service: "other" }),
  ROUTING_STATES.ADMINISTRATIVE,
  "service_scope"
);

expectState(
  "immediate emergency invokes urgent pathway",
  baseline({ immediateEmergency: "yes" }),
  ROUTING_STATES.URGENT,
  "immediate_emergency"
);

expectState(
  "clinical routing takes precedence over administrative routing",
  baseline({
    illinoisTelehealth: "no",
    recentCare: ["emergency_evaluation_30_days"]
  }),
  ROUTING_STATES.CLINICAL
);

expectState(
  "urgent routing takes precedence over simultaneous administrative and clinical triggers",
  baseline({
    illinoisTelehealth: "no",
    recentCare: ["current_intensive"],
    adminIssues: ["consent_authority"],
    cssrs: { q2: "yes", q3: "yes", q4: "yes", q5: "no" },
    riskOthers: ["specific_person"]
  }),
  ROUTING_STATES.URGENT
);

test("multiple simultaneous triggers retain all applicable reason codes", () => {
  const result = evaluateRouting(baseline({
    illinoisTelehealth: "no",
    recentCare: ["discharged_30_days"],
    adminIssues: ["formal_evaluation"],
    riskOthers: ["intent"]
  }));

  assert.equal(result.state, ROUTING_STATES.URGENT);
  for (const reason of [
    "jurisdiction",
    "recent_higher_acuity_care",
    "administrative_scope_or_consent",
    "risk_to_others_emergency_override"
  ]) {
    assert.ok(result.reasonCodes.includes(reason), `missing reason code: ${reason}`);
  }
});
