# Consultation request email delivery — current production setup

The public consultation form on `contact.html` submits asynchronously to
`/api/consultation-request`, implemented by `api/consultation-request.mjs`.
Visitors stay on the site. There is **no mailto or copy-draft handoff**.

## Current integration

The Vercel production project already has the following server-side variables:

- `RESEND_API_KEY`: Resend API credential.
- `CONTACT_FROM_EMAIL`: configured sender.
- `CONTACT_TO_EMAIL`: the Stonebridge recipient.

No `STONEBRIDGE_CONSULTATION_DELIVERY_URL` or
`STONEBRIDGE_CONSULTATION_DELIVERY_TOKEN` is needed for this implementation.
Do not reintroduce the unused external gateway requirement.

The server validates origin, JSON body size, field lengths, basic email format,
a honeypot, and the supported `service` code. It submits a plain-text email
to Resend over HTTPS containing the visitor's name, email, and any supplied
administrative phone / contact / clinician / scheduling preferences. A group
inquiry may indicate The Lobby. The server does not include Google click IDs,
other URL parameters, clinical screening answers, or request body logs in the
email. The email uses the prospective client's email in the `reply_to` field.

A successful Resend HTTP response with a nonempty email ID means the provider
**accepted the email for sending**, not that the practice inbox delivered it.
The API returns `{"submitted":true}` only after that acceptance. All failure
paths return `{"submitted":false}` and a non-2xx status; the browser keeps the
form visible for retry and never fires the Google Ads conversion on failure.

## Production smoke test

October 27–28, 2026: from a network-enabled sandbox, the public
`/contact.html` page returned HTTP 200; a synthetic POST to the production
`/api/consultation-request` with the name "Test Website Submission" and
address `consultation-test@example.com` returned HTTP 200 and
`{"submitted":true}`. This confirms Resend API acceptance, not the final
inbox disposition. Search the practice mailbox / Resend dashboard for the
synthetic test notification when verifying inbox delivery.

## Privacy and compliance boundary

Do not treat successful technical delivery as a HIPAA compliance determination.
Resend's published security documentation states that Resend is not HIPAA
compliant and does not sign a BAA. A name and email associated with a request
to a psychotherapy provider can be identifiable health-related information.
Stonebridge should confirm with its privacy/compliance advisor whether this
workflow is appropriate and use a BAA-covered alternative if required.

No clinical history or free-text clinical narrative should be added to this
email workflow. Keep all secrets server-side. Do not put real submission
content in logs, tickets, test fixtures, or advertising analytics.
