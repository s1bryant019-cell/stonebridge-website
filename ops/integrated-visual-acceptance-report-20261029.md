# Stonebridge Psychological Group — integrated visual acceptance report
**Audit date:** October 29, 2026 (GitHub Actions UTC)
**Proposed integrated branch:** `test/integrated-visual-acceptance-20261029` / draft [PR #68](https://github.com/s1bryant019-cell/stonebridge-website/pull/68)
**Production baseline:** `main` at `0939e8439d63b5b42aace1ea90320c9c8baf73d4`
**Release decision:** **NOT APPROVED**. This is a review artifact; no production merge or deployment is authorized or performed.

## 1. Scope and change isolation
Integrated website changes from **draft PR #64** (New Clients heading measure and two step numerals), **draft PR #65** (scoped low-contrast supporting text) and **draft PR #66** (Contact privacy and Portal emergency notice typographic legibility) into a fresh branch from main. All existing source changes were kept; no clinical copy, header links, portal destinations, brand artwork, imagery, form handlers, metadata, fee/insurance statements, crisis/safety guidance, or nav architecture were modified. The only additional code is test/evidence instrumentation.

The PR #66 width bug is corrected in that PR and copied into the integrated branch: `viewportWidthCssPx` and `elementWidthCssPx` are independent properties; `elementHeightCssPx` and `documentWidthCssPx` are also recorded. [PR #66 corrected evidence workflow](https://github.com/s1bryant019-cell/stonebridge-website/actions/runs/40812341276) passed.

## 2. Verified passes — on the combined code, not on each draft independently

| Test | Observed result | Evidence and limits |
|---|---|---|
| `npm test` on integrated sources | **112/112 PASS** | No dependency/build-system change to site |
| 26 root HTML source entries × 390px and 1440px | **52 measured combinations**, zero recorded page errors / broken loaded local images / document-level horizontal overflows | Local Playwright Chromium; retired redirect URLs are not scored as independently rendered page designs |
| Tagged axe WCAG 2.0/2.1/2.2 A/AA baseline and integrated verification | **52/52 automated scans: zero detected violations** on integrated branch | This passes *automated* WCAG-tagged checks only; manual screen-reader and keyboard/zoom/browser review required |
| Before vs integrated screenshots | **13 actively rendered changed source files** at 390px and 1440px, each before/after; plus New Clients task screenshots at selected phone dimensions | See screenshot artifact. Scoped contrast differences may be hard to perceive in reduced full-page images: open originals |
| New Clients desktop heading composition | Existing long H2 uses shared section width rather than artificial 24ch cap | Two choice cards, actions, privacy/confirmation language remain unchanged |
| Contact privacy and Portal emergency notice | 11.52px→14.72px, 12px→14.72px respectively | Full-page before/after at 390/1440; no copy change or email submission |
| Representative adult/teen/service navigation, clinician link targets, fee anchors, existing portal entry, professional email path, group hidden service context | **Passed at 390px and 1440px**, except the known Careers future-interest route | Clicks/internal actions only, not third-party completion |
| Blank consultation form validation | Invalid required fields stopped request; **zero network submissions** | Does not establish real SMTP/Resend delivery |
| Mobile keyboard menu | Enter expanded menu with `aria-expanded=true` | Does not complete entire screen-reader/tab-order testing |
| CI integrated visual acceptance | **Passed** | [GitHub Actions run #40813158652](https://github.com/s1bryant019-cell/stonebridge-website/actions/runs/40813158652), artifact `stonebridge-integrated-acceptance-before-after` |

## 3. Mobile task visibility — actual measured position of first appointment CTA
These are **CSS pixels from top of loaded document** and represent unscrolled viewport; device browser bars/safe-area differences are not simulated.

| Requested viewport | Button top before | Button top integrated | Full-button scroll required before | Full-button scroll required integrated |
|---|---:|---:|---:|---:|
| 320 × 568 | 931 | 900 | 417 | **385** |
| 360 × 640 | 909 | 846 | 313 | **250** |
| 375 × 667 | 909 | 846 | 286 | **223** |
| 390 × 844 | 914 | 849 | 114 | **49** |
| 393 × 852 | 915 | 849 | 107 | **41** |
| 412 × 915 | 923 | 854 | 52 | **0** |
| 430 × 932 | 908 | 837 | 20 | **0** |

**Actual finding V-11:** heading correction improves the action position, but the primary booking CTA remains below first fold on short/medium phones. At 390×844 the hero ends near y=438 and H2 near y=616; the appointment button finishes at y=893. At 320×568 it finishes near y=953. The full 361px mobile hero and repeated appointment wording make the path longer than the user-task priority warrants; however, a blanket hero shrink or copy rewrite would change approved composition/content. No further unapproved layout change was made. Recommend a separate owner-reviewed page-scoped reduction of nonessential vertical spacing and/or approved copy de-duplication, not safety-text removal. The emergency/crisis guidance remains preserved after the choice cards.

## 4. Category scores using the original twelve-category standard
Original exact category names and required thresholds:

| # | Category | Required |
|---|---|---:|
| 1 | Redundancy & Clarity | **9.5** |
| 2 | Comprehension | 9.0 |
| 3 | Complexity Control | 9.0 |
| 4 | Hierarchy | 9.0 |
| 5 | Grouping | 9.0 |
| 6 | Consistency | 9.0 |
| 7 | Craftsmanship | 9.0 |
| 8 | Readability | 9.0 |
| 9 | Distinctiveness | 9.0 |
| 10 | Function | 9.0 |
| 11 | Accessibility | 9.0 |
| 12 | Premium Feel | 9.0 |

**[Full scorecard CSV: all 26 HTML entries, mobile + desktop × 12 categories](./sitewide-integrated-visual-scorecard.csv)**. This is a machine-readable long-format table with independent `Score`, `Required minimum`, `PASS/FAIL/NOT VERIFIED`, page/category-specific issue IDs, evidence and gaps. **[Score interpretation and page-level summary](./sitewide-integrated-visual-scorecard.md)**.

| Category cells | Number |
|---|---:|
| **PASS** | **375** |
| **FAIL** | **65** |
| **NOT VERIFIED** | **184** |
| Total | 624 |

Numeric visual scores are calibrated inspection judgments, not measurement precision or blanket page approvals. A meaningful limitation earns less than 9.0; a mere hypothetical refinement does not. **Full legal/clinical semantic repetition review, authenticated third-party completion and manual accessibility are material gaps, not invented passes.** Retired redirects do not receive fictitious page-level visual ratings.

## 5. Actual failures — distinguish from missing evidence

| ID | Where | Confirmed failure / limitation | Responsible action |
|---|---|---|---|
| **J-01 OPEN** | Careers, mobile + desktop | “Future Opportunities” routes candidates to `contact.html`, the patient consultation form. This violates intended applicant journey. | Owner must approve employment-specific destination. **Do not redirect through clinical intake or invent applicant email/workflow** |
| **V-11 OPEN** | New Clients, short/mobile screens | Primary appointment action remains below initial viewport on 320/360/375/390/393px samples. | Owner-reviewed tiny vertical-composition or editorial refinement, preserving hero design and safety text |
| **C-01 OPEN** | New Clients, mobile + desktop | Repeated appointment/request framing in hero, H2 and choice card limits 9.5 Redundancy & Clarity. | Separate editorial approval; pending appointment/safety wording preserved |
| **T-01 REVIEW** | Certain mobile profile, service and supporting paragraphs | Measured type on some long content blocks at ~13.28–14.4px; mobile premium readability below rubric threshold, although not a standalone WCAG font-size violation. | Fine-grained typography review, with before/after and brand sheet; no global scale rewrite |
| **L-01 REVIEW** | Selected long-form mobile pages only | Substantive stacked explanations create fatigue/extended scanning in some sequences; not evidence that required clinical/legal facts are expendable. | Practice-owner decision about hierarchy/conditional disclosure; do not silently cut material content |

Corrected issue IDs V-01–V-10 appear only on the page/category entries actually affected in the scorecard. `R-01` is the intentional retired Fit/Safety URL redirect, not a failing active public screener design.

## 6. Material NOT VERIFIED requirements (do not convert to PASS)
- Physical-device iPhone/Android touch, viewport chrome and real text scaling, plus Safari/WebKit and Firefox rendering, especially at zoom 200%–400%.
- Manual screen-reader reading order, landmarks, complete keyboard focus/modal/flyout interactions and actual WCAG 2.2 AA accessibility determination.
- Actual TherapyPortal appointment selection, clinician matching and final pending appointment confirmation, and authenticated portal tasks.
- Real consultation request submission via a privacy-approved staging email-delivery test; no private patient data sent in this audit.
- Employment-specific intake URL, owner approved; currently does not exist in the known website source.
- Full practice-owner review of clinical/legal/fees/insurance statements and redundancies. All current wording kept intact.
- Native-resolution brand-sheet confirmation where not otherwise in source; existing actual logos/images unchanged.
- User-sourced current Lighthouse/CWV field data across devices and networks.

## 7. Decision / release control
**NOT APPROVED FOR PRODUCTION.** Integrated automated accessibility and existing regression tests pass, but genuine functional/design failures and material verification gaps remain. Three source PRs (#64, #65, #66) and the integrated PR (#68) remain draft/review-only. No merge, commit to main, or production deployment is authorized.

Next approval gates: (a) inspect full-size integrated screenshot gallery, (b) approve or decline New Clients task-access refinement and separate copy changes, (c) provide Careers employment route, (d) resolve or explicitly accept page-specific T-01/L-01 visual limitations, (e) complete material external/manual checks, (f) explicitly approve merge/deploy only after results are reviewed.
