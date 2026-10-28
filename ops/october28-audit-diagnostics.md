# Stonebridge audit — verified technical findings (October 28, 2026)

Baseline: production branch and Vercel deployment both at `d67886b4b6b089c4bc681dac4b2bf4932c014d24` before this batch.

## Changes implemented in the review branch

| Audit item | Original condition | Minimal correction | Scope |
| --- | --- | --- | --- |
| M1 duplicate homepage strip | Hero facts plus another beige practice-information strip just below | Add `sb-utility-strip--home-intro` to the specific homepage strip; hide only that class at <=760px | `index.html`, `home-current.html` |
| M3 request language | H1 `Schedule a consultation`, form H2 `Reach out to schedule a brief conversation.` | H1 `Request a free consultation`, H2 `Request a brief introductory conversation.` | `contact.html` only |
| T1 stale HTTP preloads | Production response headers advertised `20260914j` versions even though actual HTML uses newer asset URLs | Delete just the two `Link` headers; preserve `Cache-Control` and other header rules | `vercel.json` |
| T4 sitemap dates | Sitemap used 2026-10-14 throughout despite October 28 substantive changes | Update only root, About, Team, Services, Fees, Contact, and New Clients modification dates | `sitemap.xml` |

Consultation client JavaScript, `/api/consultation-request`, Resend credentials/configuration, Google Ads conversion logic, TherapyPortal, clinician credentials, supervision, fees, coverage, clinical scope and crisis copy were not edited.

## Separate production fix: www hostname

Public SSL verification initially failed for `https://www.stonebridgepsychgroup.com/` (the certificate did not cover `www`). Vercel project domains listed only the apex name and project .vercel.app alias. Added the www hostname to the **existing** Stonebridge Vercel project with a **308** redirect to the apex domain. Follow-up checks returned valid TLS (SSL verify result 0) and HTTP 308 with path and query string preserved. No DNS zone replacement or scheduling/email workflow edits.

## Verified observations — no changes warranted yet

- `/` and `/index.html` return HTTP 200 and byte-identical content, matching the GitHub `index.html` blob, while `/home-current.html` returns different content. Both homepage source files received the same M1 fix. Preserve Vercel rewrites until their effective precedence is explained; do not rewrite routing speculatively.
- The existing persistent mobile appointment CTA remains in `script.js`, pointing to the pre-existing TherapyPortal appointment availability URL. No extra floating CTA was added.
- The existing clinician profiles still use general TherapyPortal availability links. Without a verified clinician-specific selection from the live external portal, do not re-label or fabricate provider-specific URLs.
- No browser-rendered proof yet for mobile menu interaction, image crop, sticky CTA overlap, desktop heading overflow, or cumulative layout shift. No changes were made for these VERIFY FIRST suggestions.
- No performance gain, LCP, INP, CLS or traffic increase is claimed without measurement.

## Inquiry decline — diagnostic next steps (do not add trackers)

1. Review existing Google Search Console search impressions/clicks for the approximately two-week low-inquiry period against a comparable period.
2. Compare the existing advertising campaign's impression, click and conversion trends for the same window.
3. Check Resend **accepted**, **delivered**, **bounced** and **suppressed** message statuses, plus the practice inbox rules, for administrative notifications. Provider acceptance is not proof of mailbox delivery.
4. Compare confirmed appointments in TherapyPortal with consultation emails and Google Ads success events. Do not equate contact-page views with completed inquiries.
5. Never copy real patient names, emails, clinical details, query parameters, or other identifiable health information into logs, analytics, or issue tickets.

Vercel runtime request logs provided no usable patient-acquisition counts. Absence of those logs cannot distinguish a traffic drop from a conversion or email-delivery issue.

## Validation state

- Sitewide GitHub regression tests including new audit contracts: passed on pull request.
- Source audit: exact scoped strip, unchanged consultation API/client integration, no stale `Link` header entries, unchanged security headers.
- External: www valid SSL and redirects correctly, preserving URI path/query.
- Browser capture: **incomplete**. The isolated Chromium runtime crashed rendering the full homepage; do not equate CSS source tests with actual phone screenshots.
- Pending: actual 375/390/430 mobile, 768 tablet, 901/1024/1100 narrow desktop, 1280/1440 desktop layout checks, keyboard/touch menu and sticky CTA checks, plus provider/email delivery dashboard review.

Do not merge optional changes or claim visual or performance verification that was not performed.
