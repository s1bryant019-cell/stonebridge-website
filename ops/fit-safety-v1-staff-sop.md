# Fit & Safety Check v1 — Staff Verification and Launch SOP

## Purpose

This SOP supports the Stonebridge new-client screening workflow. It does not replace clinical judgment, emergency procedures, informed consent, or TherapyNotes documentation standards.

## Routing states

- `direct_request_eligible`: the person may submit a pending first-appointment request in TherapyPortal.
- `administrative_resolution_required`: staff resolves a policy, jurisdiction, service-scope, legal/forensic, or consent-authority question first.
- `clinical_review_required`: clinician/clinical leadership judgment is required before an ordinary first-appointment request is approved.
- `urgent_pathway`: the website immediately displays Stonebridge's established emergency/crisis instructions. The person is not told to wait for routine Stonebridge review.

## Direct-request eligibility

Direct-request eligibility expires 14 calendar days after submission.

The 14-day interval is an operational verification rule, not a clinical standard.

## TherapyPortal verification workflow

For every prospective new-client TherapyPortal appointment request:

1. Leave the request pending while verification occurs.
2. Search the approved secure intake system for a non-expired `direct_request_eligible` record.
3. Use email address + date of birth as the primary matching pair.
4. Use name and mobile number as corroborating information when needed.
5. Confirm that the requested appointment is an appropriate new-client intake request and that the requested clinician/service is available for that type of new client.
6. Approve the pending TherapyPortal request when verification is established.
7. TherapyNotes/TherapyPortal remains the scheduling system of record and controls final appointment confirmation.

The routine verification step should remain brief. It should not ordinarily become a second phone screen, detailed clinical interview, insurance investigation, or case staffing.

## Unmatched TherapyPortal request

If there is no current matching direct-request eligibility record:

1. Keep the TherapyPortal request pending.
2. Direct the prospective client to the Stonebridge new-client pathway and Fit & Safety Check.
3. Match the completed screening afterward.
4. Proceed according to its routing result.

A mismatch means verification has not been established. It does not automatically mean the person is rejected or inappropriate for care.

## Administrative resolution

Administrative review begins first when staff can resolve the issue through policy, documentation, jurisdiction, consent authority, service scope, or understanding the requested role.

After resolution, the person may:
- return to direct appointment requesting;
- move to clinical review; or
- be informed that Stonebridge cannot provide the requested service.

Do not consume clinician review time when the issue is fully resolvable administratively.

## Clinical review

Clinical review is used when actual clinical judgment is needed regarding treatment appropriateness, structure, boundaries, level of care, or risk.

Current intensive behavioral-health treatment; discharge from such treatment within the prior 30 calendar days; or a psychiatric emergency/crisis evaluation within the prior 30 calendar days requires clinical review before ordinary approval.

Thirty days is a Stonebridge operational routing threshold, not a clinical standard and not a statement that day 31 is inherently different from day 30.

Current acute need for crisis stabilization, detox/withdrawal management, close monitoring, intensive support, or another level of care beyond routine outpatient telehealth requires clinical review or urgent handling as appropriate.

## C-SSRS routing boundary

The website embeds the official C-SSRS core questions from the Self-Report – Recent screener; it does not claim to reproduce the complete published instrument when explanatory/example language is omitted.

- Passive death wish alone has no automatic Stonebridge routing consequence.
- Active suicidal ideation beyond passive death wish requires clinical review at minimum.
- Current suicide intent or plan invokes `urgent_pathway`.
- Suicidal behavior within the prior 3 months invokes `urgent_pathway`.

Stonebridge's routing policy does not convert the website into a comprehensive suicide-risk assessment.

## Group Therapy / The Lobby

Group Therapy retains its existing cohort-screening and placement workflow. Selecting Group Therapy in the general Fit & Safety Check does not create direct TherapyPortal intake-request eligibility.

## Emergency / urgent pathway

Stonebridge is not an emergency or crisis service.

When the approved emergency override is met, including current suicide intent/plan, recent suicidal behavior within the approved C-SSRS window, immediate inability to remain safe, or approved urgent risk-to-others triggers, the website displays the established emergency/crisis instructions immediately and does not instruct the person to wait for a consultation or routine review.

Website submissions are not monitored in real time.

The v1 website does not persist urgent-pathway submissions until Stonebridge finalizes the minimum necessary internal urgent-event handling protocol.

## Privacy and system boundaries

- TherapyNotes/TherapyPortal remains the clinical and scheduling system of record.
- The website screening datastore exists only for limited routing, matching, and review operations.
- Do not copy screening information into ordinary email, spreadsheets, personal notes, or unapproved systems.
- Generic email notifications may state only that a secure item is waiting for authorized review; they must not contain identifying or clinical information.
- Do not place PHI, screening answers, or routing states in URLs.
- Do not add advertising analytics, session replay, or marketing conversion tracking to the Fit & Safety Check.

## Production launch gates

Do not set `PHI_WORKFLOW_APPROVED=true` in production until Stonebridge has documented all of the following:

- the production Vercel account/project is covered by the required agreement(s) and configured for the intended PHI workflow;
- the production datastore is an approved HIPAA-configured project with the required agreement(s);
- staff access is restricted to authorized users with appropriate MFA/access controls;
- retention/deletion settings are approved and `INTAKE_RECORD_RETENTION_DAYS` is configured;
- application, platform, database, and error logs have been reviewed for minimum-necessary handling and do not record submitted clinical payloads;
- backup, audit, incident-response, and access-revocation expectations are documented;
- preview/test environments use synthetic data only;
- the current Fit & Safety routing rules and emergency override have been clinically approved.

A vendor's marketing statement or availability of a BAA is not, by itself, proof that the deployed Stonebridge workflow is compliant.
