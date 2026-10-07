# Fit & Safety Check v1 — Staff Workflow

## Purpose

This SOP supports the Stonebridge new-client screening workflow. It does not replace clinical judgment, emergency procedures, informed consent, or TherapyNotes documentation standards.

Stonebridge does not use open booking for a first therapy appointment. Every new client remains subject to Stonebridge review before a pending TherapyPortal request is approved.

## Website screening boundary

The Fit & Safety Check runs entirely in the prospective client's browser.

- The website does not collect name, date of birth, email, mobile number, or other identity fields as part of the screen.
- Screening answers are not submitted to Stonebridge or stored by the website.
- The browser displays one of four routing states: direct request, administrative resolution, clinical review, or urgent pathway.
- The website does not create a screening record or a 14-day eligibility record.

TherapyNotes/TherapyPortal remains the scheduling and clinical system of record.

## Direct-request pathway

When the browser displays the direct-request result, the prospective client may continue to TherapyPortal and submit a pending first-appointment request.

The result asks the client to enter **Fit & Safety Check completed** in TherapyPortal's message field when that field is available. This is operational evidence only; it is not cryptographic verification and does not replace Stonebridge's final review.

Staff should:

1. Leave the TherapyPortal request pending while reviewing it.
2. Confirm that the request is for an appropriate new-client intake/service and that the requested clinician/service is accepting that type of new client.
3. Note the client's screening-completion message when present.
4. If screening completion is unclear, direct the client to the Stonebridge new-client pathway or speak with the client by phone before approval.
5. Approve the pending TherapyPortal request only after Stonebridge is satisfied that the required screening step has occurred.
6. TherapyNotes/TherapyPortal controls final appointment confirmation.

The routine approval step should remain brief and should not become a second intake interview unless a genuine concern requires further review.

## Consultation pathway

Consultation remains voluntary and is also used when the browser displays an administrative or clinical-review result.

The public website does not collect consultation details. The client is directed to call Stonebridge at (773) 417-1688.

Information learned during a phone consultation should be handled within Stonebridge's existing approved clinical/administrative systems and documentation practices, not copied into the public website, ordinary email, personal notes, or unapproved systems.

## Administrative resolution

Administrative review begins first when staff can resolve the issue through policy, documentation, jurisdiction, consent authority, service scope, or understanding the requested role.

After resolution, the person may:
- return to the ordinary TherapyPortal request pathway;
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

The Fit & Safety page is not monitored in real time and does not transmit the urgent response to Stonebridge.

## Privacy and system boundaries

- Vercel hosts the public/static website only.
- Fit & Safety answers are evaluated in browser memory and discarded when the page is left or refreshed.
- No screening answer, routing state, or identity field is posted to a Stonebridge/Vercel API.
- TherapyNotes/TherapyPortal receives identifiable information for the appointment-request workflow.
- The public consultation pathway is phone-based.
- Do not place screening answers or routing states in URLs.
- Do not add advertising analytics, session replay, or marketing conversion tracking to the Fit & Safety Check.
