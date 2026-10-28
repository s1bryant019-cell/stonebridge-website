# Conversion measurement plan — owner approval required

This conversion review does **not** install tracking scripts, cookies, pixels or new analytic services.

If the practice approves a privacy-reviewed measurement provider, possible aggregate event names are:

| Event | Trigger | Limitation |
| --- | --- | --- |
| `appointment_link_click` | Visitor selects the existing TherapyPortal availability link | Not an appointment booking |
| `consultation_link_click` | Visitor selects a link to `contact.html` | Not a consultation submission |
| `consultation_request_success` | The consultation endpoint responds with `submitted: true` | Resend acceptance for sending, not guaranteed inbox delivery |
| `clinician_profile_click` | Visitor selects either homepage clinician profile | Not a request or clinical event |

Do not include names, email addresses, phone numbers, symptom text, selected clinician preferences, URL query parameters that might contain personal data, or submission contents in analytics. Do not install new marketing instrumentation without an independent privacy review and the owner's explicit approval.

The existing Google Ads consultation conversion in `consultation-request.js` is not changed here. Its firing should be reviewed against the difference between Resend submission acceptance and inbox delivery.

Deployment scope: review branch only. Owner approval is required before merging and publishing to production.

QA includes pre-production code and interface checks only; no synthetic clinical request is sent to production for this conversion project.
