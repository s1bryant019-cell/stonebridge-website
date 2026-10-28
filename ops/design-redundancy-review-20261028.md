# October 28, 2026 — editorial website refinement and visual review

Baseline: production Git commit `be31899ad128a9117d4f801e4e89d3149a77b172`. This branch is **not** a replacement of older deployed pages.

## Implemented for review (not yet production-approved)

| Page/file | Before | Exact revision | Reason |
| --- | --- | --- | --- |
| `index.html`, `home-current.html` | Beige desktop band repeated accepting-client, consultation and Aetna/BCBSIL facts already in hero. Mobile CSS hid the band entirely. | Desktop: exactly **Clinical depth. Relational understanding. Careful fit.**, centered between two narrow gold lines at 56px height; mobile: 14px beige transition, no visible or accessible text. | Reduce consecutive repeated facts while retaining intentional visual continuity |
| `index.html`, `home-current.html` | Hero fact text measured 11.68–12px; Meet the Clinicians lacked an underline. | 13–14px hero facts; visible restrained underline, contrast and focus state for Meet the Clinicians. | Improve secondary-information readability without a third large CTA |
| `fees-insurance.html` | Two `#payment-options` links in the same cost explainer. | Keep **Review Accepted Insurance**, remove **View Accepted Insurance and Fees**. | Prevent competing links to the same destination |
| `services.html`, `new-clients.html`, `contact.html`, `stonebridge-beige-refinement.css` | Each beige band repeated generic acceptance/consultation/Illinois facts immediately after the page hero. | Three individually opted-in, cache-versioned decorative beige transitions, 30px desktop or 14px mobile, with a restrained desktop gold rule and `aria-hidden=true`. No global band hiding or new filler language. | Preserve visual rhythm while avoiding repetitive copy |
| `tests/audit-october28-corrections.test.mjs`, `tests/conversion-improvements.test.mjs` | Tests expected old, intentionally redundant text. | Adjust contracts to the approved revision. | Avoid regression to redundant content |
| `tests/editorial-design-refinement.test.mjs` | No new-specific contracts. | Regression checks for new content and preservation of booking/consultation code. | Ensure isolated changes |

No edits to `script.js`, `consultation-request.js`, `api/consultation-request.mjs`, TherapyPortal destination, clinician credentials, supervision, accepted insurance details, fees, emergency guidance or clinical content.

## Interior beige-band audit — each page considered independently

- **About:** Retained its whole-person-care and therapeutic-frame language; considered meaningful editorial framing, though its generic availability item could be reconsidered later.
- **Services:** Converted repetitive generic marketing facts to a decorative transition.
- **Individual Therapy:** Retained **Relational + practical**, which summarizes its treatment orientation; no change without clinical review.
- **Couples Therapy:** Retained **Structure with warmth**, which distinguishes the relational approach.
- **Family Therapy:** Retained **Clear participation**, which signals a real treatment-planning distinction.
- **Parent Support:** Retained **Relational + practical** rather than inventing new clinical claims.
- **New Clients:** Converted repetitive generic facts to decorative transition; two entry routes remain intact.
- **Contact:** Converted repeated free-consultation/Illinois facts to decorative transition; functional consultation form unchanged.
- **Portal:** Retained its actual appointment/request and secure-account access explanation.

## Browser validation (real Chrome for Testing 156)

Live baseline and proposed branch HTML/CSS were rendered with the same production assets. At **375, 390, 430, 760, 768, 901, 1024, 1199, 1280 and 1440px**, measured:
- Homepage band: **56px desktop**, **14px on mobile** with its text container `display:none` at 760px and below.
- Hero facts: **13–14px** after revision (baseline 11.68–12px). Meet link: visible underline.
- No document horizontal overflow and no homepage services-heading scroll overflow at any checked width. No heading-wrap code changes warranted.
- Services/New Clients/Contact quiet bands: **14px on phones**, **30px at 1280px**, no leftover text or accessibility landmark.
- Fees cost explainer: **one** anchor to `#payment-options`, with deductibles/copays/coinsurance disclosure retained.
- The existing scroll-aware sticky CTA was separately exercised in real Chrome at 375/390/430/760px: hidden when the hero appointment is in view, visible while scrolling reading content, hidden again on return, with `tabindex=-1` and `inert` when hidden. No JS change.

The old screenshot baseline and proposed screenshots are intended for the pull request's visual review. Actual physical-device Safari testing is not yet complete.

## Conditional investigations left unchanged

- **Desktop header appointment button:** Retained because removing it is a conditional visual experiment requiring approval; the hero appointment action remains obvious.
- **Services heading nowrap:** No horizontal overflow at 901, 1024 or 1199px, so no workaround added.
- **Sticky CTA:** Existing feature passed tested scrolling scenarios; no replacement.
- **Clinician-specific booking labels:** The shared TherapyPortal availability URL opened a general Stonebridge request-choice screen, with no clinician named on its initial screen. No provider-specific URL was invented; a final selection-flow check is necessary before changing the named-clinician labels.
- **Social preview/OG metadata:** Not changed; previously deployed values left intact.
- **Email delivery:** No vendor/API code changes. Provider acceptance must be distinguished from actual inbox delivery, which requires authorized provider/inbox access.

## Privacy handling for practice review

The consultation form submits administrative contact fields (`fullName`, `email`, optionally `phone`, `preferredContact`, `preferredClinician`, `availability` and `service` for group inquiry) to Stonebridge's own `/api/consultation-request` endpoint. The server sends permitted administrative fields via Resend to the configured practice address. The browser may include advertising attribution identifiers (`gclid`, `gbraid`, `wbraid`) in that internal request, but server-side mail composition does not put those IDs in the message. Google Ads conversion code runs only after backend acceptance and does not include names, email, phone or clinical information. This is an implementation summary, **not** a HIPAA compliance determination.

## Release gate

The brief explicitly requires screenshots and owner approval before optional visual experiments are deployed. Maintain this branch/PR as review-only until approval. Before merging verify all existing GitHub tests and Vercel preview build, then verify new production commit/headers after launch.
