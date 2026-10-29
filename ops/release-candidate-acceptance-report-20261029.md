# Stonebridge — final integrated release-candidate acceptance report
**Review date:** October 29, 2026
**Candidate:** [Draft PR #72](https://github.com/s1bryant019-cell/stonebridge-website/pull/72) (`release/stonebridge-mobile-acceptance-20261029` against `main`)
**Decision:** **HOLD / NOT APPROVED FOR PRODUCTION**. No merge, auto-merge or live deployment has been authorized or performed.

## 1. Verified improvements contained in the candidate
The source changes from drafts **#64 (New Clients), #65 (label contrast), #66 (Contact/Portal readability), #69 (New Clients mobile photographic hero), and #70 (eight-page mobile paragraph legibility)** are consolidated in one candidate. The proposed H2 wording is **not in the code**. Separate draft #71 contributes an editorial-only report, not a website copy change.

| Revision | Scope | Evidence-based finding |
|---|---|---|
| New Clients desktop | H2 measure aligned with existing two-choice grid, no paragraph or asset changes | Previously awkward 24ch H2 now uses shared 48rem cap |
| New Clients mobile | Hero min-height 360→300px for `max-width:720px`; photography/overlay/headline/paths preserved | Entire primary CTA requires 60 fewer pixels of scroll at each requested phone size |
| Supporting contrast | Specific muted-gold/dim supporting selectors, no global palette replacement | Combined 52 tagged axe checks: no detected violations |
| Contact + Portal | Privacy note 11.52→14.72px; portal emergency note 12→14.72px; comfortable leading | Public task and high-stakes notes more readable; identical content and destination |
| Eight mobile content pages | Selected long paragraphs/list rows at 15.36–16px and 1.6 leading, width≤640px | Long-text under-15px counts decrease; +0.8–5.5% mobile page height, zero desktop height change |
| Fees & Insurance | Previously corrected note contrast, **no arbitrary body-type change** | No qualifying long body paragraph below the targeted small-font cutoff in source inspection |

## 2. New Clients mobile CTA measured from the top
**Original integrated baseline → refined hero** (unscrolled CSS pixels; browser chrome/safe areas not simulated):

| Phone viewport | Hero min. height effect | Full primary CTA bottom before → after | Scroll needed before → after |
|---|---|---|---|
| 320×568 | 361→301px | 953→893px | 385→**325px** |
| 375×667 | 361→301px | 890→830px | 223→**163px** |
| 390×844 | 361→301px | 893→833px | 49→**0px** |
| 393×852 | 361→301px | 893→833px | 41→**0px** |
| 412×915 | 361→301px | 898→838px | 0→**0px** |
| 430×932 | 361→301px | 881→821px | 0→**0px** |

The chosen hero adjustment is intentionally restrained: it does not force the CTA above the fold on short 320/375px phones or sacrifice the image/heading. **V-11 is improved but still open** for very short screens. The approved pending-appointment disclaimer, 988/911 emergency text and optional consultation route remain unchanged.

**Editorial alternative requiring separate approval:** replace the H2 only with **“Choose your next step.”** This would eliminate duplicated invitation language, not remove clinical requirements. **Not implemented.**

## 3. Mobile type, visual tradeoffs, and desktop preservation
See [eight-page selector-level review](https://github.com/s1bryant019-cell/stonebridge-website/blob/refine/selected-mobile-body-text-20261029/ops/targeted-mobile-typography-review-20261029.md).
Founder: 390px height +221px; Jasmine +185px; Professionals +351px; Individual +128px; Family +151px; Couples +144px; Parent Support +135px; Privacy note +39px. All eight pages' measured desktop heights are unchanged. The improvements increase body text width/line spacing without homogenizing display labels or altering asymmetrical desktop rails.

## 4. Verification on integrated proposed code

| Evidence | Current result | Boundary |
|---|---|---|
| Node `npm test` | **112 PASS / 0 FAIL** | Existing code tests only |
| Chromium, Firefox, WebKit 26 HTML routes × 320/390/1440px | **234 checks, zero measured overflow/loaded-image failure/uncaught page errors** | Browser engines in Linux automation, not physical-device Safari/Android |
| Tagged WCAG 2.2 A/AA axe 26 × 390/1440px | **52 scans, zero detected violations** | Not a manual screen-reader, 200–400% zoom or complete WCAG certification |
| Six-phone New Clients proof | Before/after fold and full screenshots; exact box measurements above | Physical browser bars and OS text scaling require manual verification |
| Click-path checks at 390/1440px | Adult, adolescent, clinician links, fees anchors, group context, consultation validation and existing-client/professional routes worked | **Careers applicant path FAIL**; no live appointment/clinical submission |
| Candidate GitHub Actions workflow | [Exact-commit validation run](https://github.com/s1bryant019-cell/stonebridge-website/actions/workflows/release-candidate-validation.yml) produces full before/after and browser/source-hash artifacts | Confirm successful workflow and the exact commit SHA before considering any release approval |

The release-workflow outputs `tested-commit.txt` and source-file SHA-256 manifest to prevent a mismatch between approved screenshots and deployed source. No live form submissions or real appointments were made.

## 5. Full-site content review and corrected 12-category scorecard
- [24-page completed redundancy report](./complete-redundancy-clarity-review-20261029.md): conceptual duplication with exact sections, KEEP/necessary reinforcement versus REVIEW/consolidate distinctions, and no content edits.
- [Reconciled CSV for 26 entries × 2 viewports × 12 categories](./sitewide-integrated-visual-scorecard.csv): **387 PASS / 91 FAIL / 146 NOT VERIFIED** cells. Original stricter **9.5** for Redundancy & Clarity and **9.0** for the other categories. Each cell separates numeric score, threshold, decision, evidence, open category-specific issue ID and formerly corrected issue ID.
- [Scorecard interpretation](./sitewide-integrated-visual-scorecard.md): missing manual/external evidence is N/V, not misreported as PASS. No score was raised just to reach a required threshold.

## 6. Genuine open failures
- **J-01 — Careers:** future-opportunities actions still direct applicants to patient consultation. [Two owner-reviewable choices](./careers-owner-pathway-options-20261029.md): **A** use an approved employment-specific URL/route, or **B** explicitly authorize temporarily withholding just those actions. Neither is implemented or assumed.
- **V-11 — New Clients on short phones:** first CTA still requires 325px of scrolling at 320×568 and 163px at 375×667, although the revised hero is more balanced. No forced above-fold action.
- **C-01/other editorial decisions:** repeated appointment framing and additional potential consolidations in BCBS/Fees/Professionals require owner approval before any copy change.
- **T-01 / L-01:** some other mobile copy areas remain dense/small; the eight-page typed corrections are verified improvements, not a blanket claim of a perfected mobile reading experience.

## 7. Material remaining NOT VERIFIED
- **Physical devices** (iPhone Safari and Android Chrome), native screen readers/VoiceOver/TalkBack, complete keyboard journeys and true browser zoom/text scaling at 200%/400%.
- **Real third-party TherapyPortal workflow** to final request state/clinician selection and actual authorized consultation email delivery. Public links and local validation were checked, but no patient/applicant information was submitted.
- Formal owner/clinical/privacy/legal approval of potential copy edits, insurer/fee/clinician claims, and an approved employment destination.
- Real-user performance field data and final owner visual approval of full-size screenshot proofs.

## 8. Single-release path; no duplicate merges
**Only the final candidate PR #72 targets `main` as a possible release.** The earlier component/integration/refinement PRs #64, #65, #66, #68, #69, #70 and editorial-only #71 are review provenance, **not additional merges**. After explicit approval and after all blocking issues are addressed or explicitly accepted, merge **only** the tested candidate and then close superseded PRs without merging them. Any source edit after approval requires a rerun at the new commit SHA.

**No deployment, merge or auto-merge has been enabled. Current acceptance verdict: HOLD.**
