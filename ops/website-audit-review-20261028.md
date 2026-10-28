# Stonebridge website audit — pre-deployment report
**Date:** October 28, 2026  
**Production baseline:** `38bae5759fded09aae05efbf447f4ed5e81d9f80`  
**Review branch:** `feat/final-site-audit-20261028`

## Changes staged (not published until review)

| Item | File(s) | Exact change | Reason | Evidence / test |
| --- | --- | --- | --- | --- |
| Optional consultation route | `about.html`, `individual-therapy.html`, `couples-therapy.html`, `family-therapy.html`, `parent-support.html` | Exactly one text link, **“Prefer to speak first? Request a free consultation.”**, to `contact.html#inquiry-form`, immediately under each final appointment button | Offer a low-emphasis consult alternative without an additional large button | Source contract + browser layout checks; original TherapyPortal link retained. Existing legacy mobile CSS intentionally hides several final CTA sections; no section visibility change |
| Shared script cache freshness | All 24 HTML pages using `script.js` | Every page now loads `script.js?v=20261028stickyvisible2` | Previously disparate September/October query versions could retain stale script behavior in browser/CDN caches | 103 passing Node tests, HTML references inspected. Production cache-header validation pending deployment |
| Insurance clarity | `fees-insurance.html` | Remove “Aetna + BCBSIL” abbreviated utility-strip item; add exact statement “Insurance participation varies by plan and clinician. Review accepted plans and coverage details below.” and **Review Accepted Insurance** link to `#payment-options` near the top | Avoid suggesting Aetna/BCBSIL are the only eligible plans | Current site lists Aetna, BCBSIL, Medicaid FFS, Guidehealth/Advocate; actual accepted lists, inactive networks, fees and credentialing data unchanged |
| Social sharing | Homepage, About, Services, Team, two clinician profiles, New Clients, fees, four individual service pages | Add `og:title`, `og:description`, `og:url` from existing title/description/canonical and `og:image` from existing bridge image or clinician images | Accurate previews without inventing claims | Contract verifies existing files, canonical alignment and one set of tags; existing images/clinical copy preserved |
| Regression tests | `tests/final-audit-contract.test.mjs`, `tests/final-audit-sharing.test.mjs`, `tests/mobile-layout-contract.test.mjs` | Verify all script references, one consultation link per target page, accepted insurance copy, OG data, and update an existing stale-version assertion | Prevent cache/CTA regressions | **103/103 tests passed** on branch |

## Browser testing performed

A locally served copy of the review branch was rendered with Chrome for Testing at viewport widths **375, 390, 430, 760, 768, 901, 1024, 1100, 1280, 1440** as appropriate. Pages included Home, Services, About, Team, both clinician profiles, New Clients, Contact, Fees & Insurance and four individual service pages: **70 page/viewport combinations**.

Measured results: **0 horizontal-overflow failures**, **0 simultaneous visible sticky and in-page appointment CTAs** at sampled scroll positions, **0 uncaught page JavaScript exceptions**. The mobile menu toggled `aria-expanded` from true to false at tested widths. Homepage heading fit at 901/1024/1100/1280/1440; no text-wrap override justified. Browser screenshots were captured locally for 375px and 1024px review. These results are Chrome automation only, not Safari/physical-phone validation or Core Web Vitals field measurement.

The previously deployed sticky CTA controller and its footer padding remain untouched. No extra sticky button was created. Mobile sticky remains excluded from `contact.html` and `group-therapy.html`.

## Live synthetic consultation test

One **nonclinical synthetic** test was submitted on the current production contact form, with a name plainly marked “STONEBRIDGE TEST - DO NOT PROCESS OCT 28 2026” and `stonebridge-qa-test@example.com`. Client-side invalid-email submission displayed an error and fired **zero** Google Ads conversions; the subsequently corrected valid submission returned `HTTP 200`, displayed success and fired exactly one Google Ads conversion with only its event destination. No double submission observed.

**Provider accepted is not mailbox delivered.** Resend `delivered/bounced/rejected` webhook/event status and actual inbox receipt could not be independently verified from the available connection. Check the Resend dashboard and practice mailbox for the marked test. No actual client data used.

## Consultation privacy/vendor review — owner action required

The existing server handler sends to Resend: **full name, email**, and, if provided, **phone number, preferred contact method, preferred clinician, best times to reach, and a teen-group inquiry label**. It does **not** forward Google click identifiers, arbitrary form narratives, clinical screening answers or PHI-related questions to Resend; the consultation conversion event contains only the Google Ads `send_to` identifier. The handler deliberately does not log request bodies, headers or provider responses. Existing privacy page describes the administrative email-delivery workflow and states acceptance is not guaranteed inbox delivery.

**Compliance advisor approval, vendor terms and any Business Associate Agreement have NOT been established or certified by this code review.** Stonebridge's owner/privacy advisor must verify whether this Resend use and its vendor agreement are approved for the practice's healthcare workflow before representing it as compliant. Do not change Resend automatically or add clinical fields.

## Conditional and external findings — no speculative changes

- **Clinician-specific TherapyPortal links:** the two buttons both use the same general availability URL. A patient-facing portal page loaded, but browser inspection exposed no clinician selector/selection confirmation. Cannot establish whether referrals preserve clinician selection; do not invent new parameters or automatically rename clinician-specific links.
- **Desktop services heading:** no overflow measured in Chrome at desktop breakpoints; no CSS change.
- **Sitewide headers/menu:** no menu failure, horizontal overflow or JS exception in 70 render combinations; no structural rewrite. Visible animation/CLS or Safari-only behavior not measured.
- **Homepage rewrites:** production previously verified `/` and `/index.html` serve current correct index content. Rewrite precedence has not been proven faulty; leave `vercel.json` alone.
- **Directories:** public Psychology Today group and clinician listings show several phone numbers different from the website (they may be intentional routing/tracking numbers), and the group description emphasizes consultation first while the website offers both direct appointment and consultation. Public Dr. Bryant Zocdoc listing offers appointments and insurance filters. Actual phone call reachability, Zocdoc patient checkout and insurer credentialing could not be confirmed; do not edit outside profiles without authorization.
- **Inquiry decline:** two-week Search Console clicks/impressions, Google Ads/GA4, TherapyPortal/Zocdoc requests, Resend delivery events, practice call channels and confirmation counts are needed to distinguish traffic, conversion, deliverability and measurement changes. No connected source provided those private data; no causal attribution is justified.
- **Privacy:** no new tracking, analytics, cookies, provider-specific scheduling URLs or data collection have been added.

## Follow-up and publication gate

Inspect this review branch/PR and compare the updated pages with production. Only after accepting the pre-deployment report should the tested commit be merged and Vercel production deployment verified. After deployment, confirm the new script version and insurance/CTA links over HTTPS; perform no further synthetic submissions without an explicit need.
