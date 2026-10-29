# Stonebridge — final targeted release candidate acceptance (approval HOLD)

**Review basis:** October 29, 2026 · Draft [PR #72](https://github.com/s1bryant019-cell/stonebridge-website/pull/72) only. This document is a test record, **not authorization to merge, deploy or use actual patient/applicant information**.

## 1. Approved and implemented changes

**Approved New Clients H2, one replacement only.** Original: “Request an appointment. Consultation is available if you prefer.” → **“Choose your next step.”** No accompanying hero, clinical, crisis, confirmation, appointment choice, navigation or link copy changed. The original two card destinations and pending-request disclosure remain in their approved positions. The separate editorial [PR #73](https://github.com/s1bryant019-cell/stonebridge-website/pull/73) remains **unmerged** and should never also be merged into main.

**Scoped text-only zoom/reflow CSS:** `stonebridge-brand-sync.css` and `home-visual-refresh.css`. These changes allow only intrinsically wide, enlarged text to wrap and allow existing header/footer/grid items to shrink without overflow. They address footer brand and copyright/email, header menu flexibility, limited Home no-wrap headings, and specific long New Clients/Team/Jasmine/Careers headings. **No font family, color, image, logo, standard CTA size, normal grid structure or content was changed.** The 200% text-only Firefox retest passes all 33 checked combinations.

### Visual non-regression
Paired full-page Chromium screenshots were captured on 11 representative pages at **320, 390, 1440 CSS px** after the CSS patch versus the unchanged H2-approved baseline (33 pairs). **30 pairs were pixel-identical**; 3 had small pixel differences on Home or Founder, not a document-height change. All 33 pairs had unchanged page height and no horizontal overflow. Before/after copy comparisons on [PR #73](https://github.com/s1bryant019-cell/stonebridge-website/actions/runs/40822575722) capture the approved H2 alone at all six requested phone dimensions plus desktop. The current PR #72 integrated visual workflow captures the combined release candidate. No generic redesign is justified by these findings.

## 2. Precisely disentangling the 49 simulation observations

The initial nonstandard root-font-size multiplication probe (11 pages × 3 CSS widths × 3 sizes) produced **49 overflowing cases in 99 observations**. Each is enumerated with page, CSS viewport, font multiplier, document width, overflowing selector and pixel overhang in [the 49-case register](./49-case-font-stress-selector-register.csv).

**Genuine browser tests were necessary**:
- In headed Chromium, real browser keyboard zoom (Ctrl+Plus) produced measured device-scale ratios of **1× / 2× / 4×** and CSS viewport widths **1280 / 640 / 320px** in a fixed 1280px window. Across 11 representative pages, all **33/33 true full-page zoom checks had no horizontal overflow** at 100%, 200% or 400%.
- In headed Firefox with **Zoom Text Only** enabled, genuine 200% text-only zoom reproduced overflow on **20 of 33 page/width combinations before** the scoped CSS changes. After targeted correction, **all 33/33 at 200% pass** across 11 pages × 320/640/1280 CSS px; computed root font is 32px. This is relevant to the 200% text resizing expectations of WCAG 1.4.4, but does not alone establish every possible content state is usable.
- At the **more extreme 400% Firefox text-only zoom** (root font 64px; not the same as ordinary full-page 400% zoom), **15/33** still show horizontal overflow; see [actual selector register](./15-optional-firefox-text-only-400-overflows.csv). These remain transparent optional stress findings, not misclassified as failures of WCAG 1.4.10's 400% *full-page* reflow target or silently declared a pass.
- The Contact honeypot elements deliberately placed off-screen are not visible copy defects and were not counted as failed user-visible controls merely because their bounds lie at negative coordinates. The source register captures the first off-viewport selector where applicable; the measured document width determines actual horizontal overflow.

This is **browser-based evidence**, not an absolute assertion of WCAG 2.2 AA conformity. 400% full-page reflow was sampled on representative routes only. Native screen readers, keyboard navigation across every state, and physical-device zoom/OS-scale validation remain material approval gates.

## 3. Approved H2 viewport evidence

On the owner-approved H2 branch (which changes only that text), before/after the exact standalone replacement gives:

| CSS viewport | Prior full-button scroll | Approved H2 scroll | H2 after |
|---|---:|---:|---|
| 320×568 | 325px | **230px** | Single clear next-step heading |
| 375×667 | 163px | **100px** | Shorter introduction |
| 390×844 | 0px | **0px** | CTA in initial viewport |
| 393×852 | 0px | **0px** | CTA in initial viewport |
| 412×915 | 0px | **0px** | CTA in initial viewport |
| 430×932 | 0px | **0px** | CTA in initial viewport |

At 1440×900, full-button scroll changes **68px → 25px** for the original heading versus the approved H2 alone. The full 320/390/1440 image comparisons show balanced pathway cards, retained original photo, pending disclosure and crisis guidance. The button is **not artificially forced above the fold** on short phones. V-11 remains a small-phone visitor-task limitation.

## 4. Updated twelve-category scorecard without blanket approval

[Complete 624-cell mobile/desktop scorecard](./sitewide-integrated-visual-scorecard.csv) and [rationale](./sitewide-integrated-visual-scorecard.md). Under the exact rubric (Redundancy & Clarity 9.5 minimum; eleven other categories 9.0 minimum), the **two New Clients Redundancy & Clarity cells** move from 8.8 FAIL to **9.5 PASS** because the sole needless introductory duplication has been removed and the repeated pending-confirmation status still serves a distinct safety/decision purpose. No other numeric score was increased just to claim approval.

**385 PASS / 89 FAIL / 150 NOT VERIFIED** cells. Small-phone New Clients Hierarchy, Craftsmanship and Premium Feel judgments remain failing where justified; physical-device/manual Accessibility cells remain NOT VERIFIED, as do external-service dependent Function cells. The Careers applicant CTA is still a real **FAIL (J-01)**.

## 5. Careers: unimplemented two-anchor alternative

[Exact proposed two-anchor diff](./careers-withhold-only-two-links-unimplemented.md) for owner review. It would withhold `Future Opportunities` and `Ask About Future Opportunities` which presently send applicants to clinical patient intake, and **preserve the real current role's Indeed application URL and its link**. No code patch to Careers has been applied, and no new route, email, ATS, data handling or replacement copy has been invented. Owner must expressly authorize either this temporary withholding option or a verified employment-specific URL. The surviving “Ask about future clinician or training opportunities” paragraph would require separately approved honest status wording if the CTAs are removed.

## 6. Actual verification matrix and material gaps

| Requirement | Result | Scope / limitation |
|---|---|---|
| Existing regression suite | Verified PASS at current candidate in CI once latest head run is green | 112 Node tests; no application dependency changes |
| Integrated axe | Verified PASS at current candidate once latest head run is green | 52 WCAG-tagged automated scans only; **not full WCAG certification** |
| Chromium, Firefox, WebKit baseline responsive matrix | Verified PASS at current candidate once latest head run is green | 234 routes/viewports; cannot guarantee all browser states |
| Real headed Chromium 100/200/400% full zoom | **33/33 PASS locally** | 11 representative pages at 1280px physical window (computed 1280/640/320 CSS px) |
| Real headed Firefox text-only 200% | **33/33 PASS locally after scoped CSS** | 11 pages at 320/640/1280 CSS px; selected normal-scale photo comparisons preserved |
| Firefox 400% text-only (optional stress) | **15/33 OVERFLOW** | Not the required 200% text-only criterion, nor failure of genuine 400% full zoom; documented explicitly |
| Keyboard focus, skip links, menu Enter | Partial PASS | 11 representative pages; complete manual keyboard workflow and screen-reader interaction are NOT VERIFIED |
| Accessibility tree labels and main landmarks | Partial PASS | Chromium inspection; not actual NVDA/JAWS/VoiceOver/TalkBack |
| Emulated iPhone/Android touch | Partial PASS | WebKit iPhone and Chromium Pixel emulators only; **physical devices NOT VERIFIED** |
| Full physical device / browser-native screen-reader | **NOT VERIFIED** | No device/accessibility service supplied in this session; do not claim |
| Public TherapyPortal appointment entry URL | HTTP 200 in read-only check | **Completion, clinician fit and pending confirmation NOT VERIFIED** |
| Consultation form required-field blocking | Local PASS | Real delivery to approved staging mailbox **NOT VERIFIED**; no unauthorized submissions |
| Legal/clinical/insurance/privacy facts | Content preserved | No source changes or independent clinical/legal reapproval claimed |
| Careers future-interest applicant route | **FAIL / unresolved** | Currently routes to patient intake; no approved employment route supplied |

## 7. Exact candidate SHA/merge-test integrity and release path

Only **draft PR #72** is a potential release path. The existing workflow was amended to check out **the actual PR head**, record its SHA and GitHub's separately generated merge-test SHA, compare their **Git tree IDs** (must match), and save a source-file hash manifest. The additional headed-browser zoom workflow gates on 100/200/400% actual full zoom and 200% Firefox text-only behavior. Exact SHA values should be read from the latest successful CI artifact and [PR #72](https://github.com/s1bryant019-cell/stonebridge-website/pull/72) at the time of review, since committing this report itself changes the head SHA. A SHA written into the commit being created cannot refer to its own final identity.

No component or editorial preview PR should separately merge into main. If owner subsequently authorizes the Careers patch or any new content change, apply it only to this release branch and rerun exact-head regression, accessibility, zoom, mobile/desktop screenshots and three-engine browser tests. Obtain **express final owner approval to merge and deploy** after those results are reviewed.

**RELEASE VERDICT: HOLD — NOT AUTHORIZED TO MERGE, AUTO-MERGE OR DEPLOY.**
