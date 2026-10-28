> Status (October 27, 2026): The production consultation page has temporarily reverted to its previous browser-generated email draft workflow because secure on-site delivery could not be confirmed. The inactive server-side handler below is retained for future configuration. Do not reactivate it until the approved gateway has been configured and end-to-end delivery verified. Opening an email draft is not delivery, and must not generate a Google Ads conversion event.\n\n# Consultation request delivery — required setup before production

The consultation form now POSTs to `/api/consultation-request` on the Stonebridge
website. The endpoint is a Vercel Node function, not a browser-to-email or
browser-to-vendor connection.

## Healthcare and privacy gate

**Do not merge or activate this workflow until Stonebridge has approved the
data processors and delivery destination.** The request can contain identifying
information from a prospective psychotherapy client, even though the form does
not solicit clinical details. Verify that the Vercel account has any required BAA
and healthcare configuration, and select a secure intake provider under
appropriate contractual/privacy arrangements. Ordinary unsecured email is not
an acceptable default. Do not copy real submissions into issues, tests, analytics,
error logs, or developer consoles.

The connected Vercel account did not provide access to project environment
settings during implementation. No credentials were added to GitHub.

## Provider configuration

Configure these **server-side only** Vercel environment variables:

- `STONEBRIDGE_CONSULTATION_DELIVERY_URL`: HTTPS URL of Stonebridge's approved
  intake gateway (must be configured by Stonebridge, not a public analytics endpoint).
- `STONEBRIDGE_CONSULTATION_DELIVERY_TOKEN`: secret bearer credential for that gateway.

The gateway receives a JSON POST with
`type: "consultation-request"`, `fullName`, `email`, `phone`,
`preferredContact`, `preferredClinician`, `availability`, and
`attribution: { gclid, gbraid, wbraid }`. It must authenticate the request and
deliver it to the agreed secure Stonebridge intake destination, not forward it
to ad platforms. It must respond with JSON `{"delivered":true}` and HTTP 2xx
**only when actual receipt has been confirmed**. A response indicating queued
or accepted-for-processing is insufficient; other responses are treated as errors.

Do not direct this endpoint to a service whose only guarantee is enqueuing
without a compatible confirmed-delivery acknowledgment. The gateway should
implement spam controls, rate limiting, a deduplication/idempotency policy,
restricted retention, and operational alerts without logging raw PII.

## Verification before release

1. In a protected preview, send a fictitious request to the approved test
   destination and verify the provider's receipt.
2. Test HTTP 4xx/5xx, timeouts, and `{"accepted":true}` results. The visitor
   must see an inline delivery error, never a success or Ads conversion.
3. Confirm a valid response displays the on-page message and the Google Ads
   conversion tag `AW-18474959338/oiH4CNOsuYYdEOqDxulE` fires once, with
   `send_to` only and no form values or `user_data`.
4. Verify one-column mobile layout, full-width button, keyboard navigation,
   and collapsed optional preferences.
5. Monitor provider outcomes and enable rate limiting/abuse protections
   before accepting production traffic.

When variables are absent, the endpoint fails closed with HTTP 503 and never
pretends that an inquiry was received.
