# Stonebridge mobile-first site review — evidence and change register
**Date:** October 29, 2026
**Review branch:** `fix/new-clients-heading-measure-20261029` · draft PR #64
**Production baseline checked:** `0939e8439d63b5b42aace1ea90320c9c8baf73d4` on `main`
**Release status:** REVIEW ONLY — no merge or production deployment authorized.

## 1. Scope and methodology
- Framework: static HTML/CSS/vanilla JavaScript, served through Vercel (`vercel.json`), with consultation requests handled by `/api/consultation-request.mjs`; no declared application dependencies in `package.json`.
- 26 root-level HTML entry points inspected in a local static-server copy of the GitHub baseline (including the legacy and specialized routes). 21 canonical routes are present in `sitemap.xml`, some with extensionless canonical paths. Direct HTML paths are inventory references, not a claim that all are independently indexed.
- Chromium 156 headless, Linux, 1× DPR, 900px viewport height, widths **320 / 360 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920**. 26 × 9 = **234 page/viewport checks**. Full-page captures collected at 390 and 1440px for all 26 source routes. Separately captured New Clients before/after at 320 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920px.
- Automated accessibility: axe-core on all 26 routes at 390 and 1440px (**52 scans**), covering tagged WCAG 2 A/AA, WCAG 2.1 A/AA, WCAG 2.2 AA. This is not a substitute for a manual or screen-reader audit.
- Static link inventory: **788 local link references** checked for existing files and matching fragment IDs. No missing local paths or fragment IDs detected. This does **not** establish that every external destination or interaction was clicked.
- Existing `npm test`: **112/112 pass** after the New Clients change.
- No clinical intake submissions were made.

## 2. Route and component inventory
Each entry below was loaded in Chromium at **all nine widths**. `C` means source-rendered and measured, not clinically or accessibility approved. Most pages share `styles.css`, the global header and `script.js`; page-specific CSS is noted where important.

| HTML entry point | Purpose / primary visitor path | Main dependency / route note | M/D |
|---|---|---|---|
| `index.html` | Home → services, clinicians, appointments or consultation | `home-visual-refresh.css`, `stonebridge-brand-sync.css` | C/C |
| `home-current.html` | Directly accessible legacy home variant | Separate content from live `index.html`; don't replace root routing | C/C |
| `about.html` | Practice philosophy and relational approach | `styles.css` | C/C |
| `team.html` | Clinician comparison → profiles | `team-hero-overrides.css` | C/C |
| `team-founder.html` | Dr. Bryant profile → appointments | `stonebridge-refresh.css` | C/C |
| `team-jasmine-wilson.html` | Jasmine Wilson profile → appointments | Verified supervision disclosures must remain intact | C/C |
| `services.html` | Six service paths with relevant section links | `stonebridge-beige-refinement.css` | C/C |
| `individual-therapy.html` | Adult / adolescent therapy; distinct section anchors | `#adult-therapy`, `#adolescent-therapy` exist | C/C |
| `group-therapy.html` | Group scope, current status and group inquiry | Uses `service=teen-group` consultation context | C/C |
| `couples-therapy.html` | Couples therapy → appointment path | `styles.css` | C/C |
| `family-therapy.html` | Family therapy → appointment path | `styles.css` | C/C |
| `parent-support.html` | Parent-support offerings and next steps | `styles.css` | C/C |
| `fees-insurance.html` | Fees and clinician/plan-specific eligibility | `#fee-schedule`, `#payment-options` | C/C |
| `new-clients.html` | Pending appointment request vs optional consultation | `new-client-access.css`, inline two-path rules | C/C |
| `contact.html` | Administrative consultation request form | `consultation-request.js`, server handler; no live form submission | C/C |
| `portal.html` | Existing-client portal and appointment routes | TherapyPortal link destination preserved | C/C |
| `for-clinicians.html` | Professional services → current contact link | Professional rates/eligibility untouched | C/C |
| `careers.html` | Current role via Indeed, future opportunities CTA | Future-interest link issue documented below | C/C |
| `privacy-information.html` | Privacy and information use | Legal/operational copy not changed | C/C |
| `assessment.html` | Specialized assessment pathway explanation | Not a general psychotherapy booking page | C/C |
| `forensic.html` | Forensic pathway/scope explanation | `stonebridge-interior.css` | C/C |
| `fit-safety-check.html` | Separate fit/safety screening utility | `new-client-access.css`, `fit-safety-check.js` | C/C |
| `psychotherapy.html` | Noindex legacy redirect to Services | Meta refresh + JS redirect → `services.html` | C/C |
| `adolescent-therapy-illinois.html` | Adolescent-focused acquisition landing | `paid-search-landing.css` | C/C |
| `bcbs-therapy-illinois.html` | BCBS-focused acquisition landing | `paid-search-landing.css` | C/C |
| `trauma-therapy-illinois.html` | Trauma-focused acquisition landing | `paid-search-landing.css` | C/C |

**Measured baseline:** zero page-level horizontal overflow, zero uncaught browser page errors, zero broken locally loaded image elements across the 234 Chromium observations. This is a static/server-rendered local copy, not an assertion about user-specific production conditions or all external providers.

## 3. Reproduced issue register (ranked by user impact)

| Priority | Location / evidence | Root cause or observed behavior | Status and proof needed |
|---|---|---|---|
| **P1** | `careers.html`, future-opportunity CTAs | `Future Opportunities` and `Ask About Future Opportunities` lead to `contact.html`, the patient consultation form, not an employment-specific path | **Unresolved, owner destination required.** Preserve existing active Indeed application route. Do not invent a recruitment email, form, or applicant storage workflow |
| **P1** | Axe scan, 390px/1440px: About; three paid pages; Fees; Fit/Safety; Professionals; live and legacy Home; both clinician profiles (profile findings mobile only) | WCAG-tagged `color-contrast` violations on 11 pages after excluding New Clients; includes small eyebrow/step/footer text, some body notes | **Unresolved.** Use approved Stonebridge palette to scope contrast adjustments, then rerun axe, check screenshot and manual states on each affected page; no broad palette redesign |
| **P2 — corrected in draft** | `new-clients.html`, 320–1920px; screenshot supplied at desktop | Heading constrained by `max-width:13ch` in shared CSS and `24ch` in its desktop override despite a full-width intro/card grid | Scoped `max-width:min(100%,48rem)` on New Clients H2; measured before/after; review PR #64 |
| **P2 — corrected in draft** | `new-clients.html`, 390/1440px | Two numbered choice labels in low-contrast `#8c7551` on light background; axe flagged both | Existing `#78613f` Stonebridge text color reused for just those labels; **0 WCAG-tagged axe violations on New Clients at 390/1440 after fix** |
| **P2 — editorial review** | New Clients H1, introductory H2, and choice-card headings | Repeated appointment/starting language increases duplication | Proposed `Choose your next step.` and shorter card labels are **not implemented**, pending content approval under the supplied brief |

### Findings checked and **not** changed
- Adult and Adolescent service links already navigate to their specific anchors on `individual-therapy.html`; both anchors exist. Mobile browser clicks confirmed the correct destinations.
- The Lobby group consultation link contains `?service=teen-group#inquiry-form`. In a local browser, the contact form contained an input `name=service` with value `teen-group`.
- TherapyPortal appointment availability URL returned **HTTP 200** when requested directly. That does not prove clinician selection, request confirmation, or booking completion.
- No measured horizontal overflow justified a global grid, heading or navigation rewrite.
- New Clients emergency/crisis wording, pending-appointment disclaimer, clinician facts, fees, insurance, photos, form delivery, analytics and all external booking links remain unchanged.

## 4. Evidence and verification matrix

| Test | Scope | Result |
|---|---|---|
| Chromium responsive layout | 26 × 9 = 234 observations, from 320 to 1920px | No document-level overflow / page JS errors / broken local images measured |
| Internal link integrity | 788 HTML link references | No nonexistent local file/anchor IDs detected; source-level only |
| Automated regression | 112 Node tests | Pass |
| New Clients layout comparison | 320 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920px | Heading and cards share left alignment; no horizontal overflow |
| New Clients tagged axe | 390, 1440px after the contrast change | Zero detected violations; **not full WCAG certification** |
| Sitewide tagged axe | 26 × (390, 1440) = 52 scans on baseline | 22 page/viewport scans flagged `color-contrast`; 12 source pages originally affected; 11 remain after New Clients fix |
| Adult mobile navigation | 390px home → mobile menu → Services → Adult Therapy | Click and correct fragment target verified |
| Adolescent mobile navigation | 390px Services → Adolescent Therapy | Click and correct fragment target verified |
| The Lobby referral context | Group Therapy → consultation form with teen-group parameter | Query parameter and local hidden input verified; **no clinical submission** |
| Careers future opportunities | Careers → CTA destination read | **Mismatch confirmed**, links to patient contact page |
| TherapyPortal reachability | Existing appointment availability URL | HTTP 200 only; completed booking **NOT VERIFIED** |
| Sitewide external-link click-through | All external destinations | **NOT VERIFIED** |
| Consultation production email delivery and analytics attribution | Resend/portal/inbox events | **NOT VERIFIED; no production submission** |
| Safari/WebKit, Firefox, physical-touch QA | All pages | **NOT VERIFIED** |
| Screen-reader, complete keyboard, 200%/400% zoom | All pages | **NOT VERIFIED** |
| Lighthouse/CWV field data | All pages | **NOT VERIFIED; no scores invented** |
| Privacy/legal/vendor confirmation | Practice owner and privacy advisor | **NOT VERIFIED** |

**Proof:** review GitHub Actions run for `Stonebridge mobile and desktop visual evidence`, artifact **`stonebridge-mobile-desktop-visual-proof`**. It contains a side-by-side HTML gallery, full-page before/after New Clients at nine widths, full-site candidate screenshots at 390/1440px, and machine-readable measurements. The PR does not deploy or submit patient information.

## 5. Evidence-based mobile/desktop verdicts and scorecard

- **New Clients:** functional layout fix staged; automated contrast check clear at 390/1440; **INCOMPLETE VERIFICATION** until full manual accessibility/cross-browser and owner visual approval.
- **Careers:** **NOT APPROVED** pending a valid employment-specific future-interest destination.
- **About, paid adolescent, BCBS, trauma, Fees, Fit/Safety, Professionals, Home, legacy Home, Founder, Jasmine:** **NOT APPROVED** under the brief's threshold because automated text-contrast failures remain at one or both tested widths.
- **All other routes:** **INCOMPLETE VERIFICATION**; a lack of detected automated violations does not establish approved design/clinical/accessibility status.

For every route, both mobile and desktop category scores under the brief's 12-category rubric remain **N/V — NOT VERIFIED**. Browser data supports narrower factual observations (overflow, images, specific link targets and automated findings), not reliable 9.0/9.5 design-quality numerical scores. An average score is therefore not assigned.

## 6. Deliberately preserved and next steps
1. Preserve the established brand, structure and copy; do not merge PR #64 until the owner reviews the visual comparison.
2. Resolve the Careers future-interest pathway with an approved employment contact/action; do not route job candidates into clinical intake.
3. Run narrow text-contrast adjustments, using the actual Stonebridge Brand Sheet when available, in a **separate** review PR with screenshots and axe results for affected pages.
4. Owner-review proposed New Clients wording separately; retain the pending-confirmation disclaimer and all crisis guidance.
5. Complete WebKit/Firefox, physical/mobile/touch, zoom, manual keyboard and screen-reader QA, external path checks, and a privacy-approved contact-form staging test. Mark each as verified only after execution.
6. Confirm all relevant Vercel preview results, then obtain owner sign-off before any merge or production deployment.
