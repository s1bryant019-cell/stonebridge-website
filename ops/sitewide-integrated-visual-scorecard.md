# Stonebridge integrated visual scorecard — calibrated to the supplied 12-category standard
**Scope:** 26 HTML entries × 2 independent viewports × 12 rubric categories = **624 scored cells**.
**Source:** Evidence-Based Premium Website Design Review Standard, sections 1.2–1.6 and 6–19.
**State:** integrated review branch only, not production; no owner approval assumed.

## Exact thresholds
1. **Redundancy & Clarity: 9.5+**
2. **Comprehension: 9.0+**
3. **Complexity Control: 9.0+**
4. **Hierarchy: 9.0+**
5. **Grouping: 9.0+**
6. **Consistency: 9.0+**
7. **Craftsmanship: 9.0+**
8. **Readability: 9.0+**
9. **Distinctiveness: 9.0+**
10. **Function: 9.0+**
11. **Accessibility: 9.0+**
12. **Premium Feel: 9.0+**

**Per-category semantics:** numeric score when the observed full-page screenshot, mobile/desktop interaction, computed text/layout data, and appropriate page context support a defensible judgment; **N/V** only where material verification is missing. Numeric values are calibrated design judgments, not statistical measurements. A score of 8.9 or below is an identified material limitation, not a theoretical possibility; 9.0 or higher denotes no identified issue materially undermining that category's inspected central question. **PASS / FAIL / NOT VERIFIED** is calculated separately from the score and the required minimum. Zero axe warnings is not final accessibility approval. A redirect route is not independently scored as a page.

## Scorecell summary
- PASS: **375**
- FAIL: **65**
- NOT VERIFIED: **184**

These cells do not imply a sitewide pass: **each page must meet every required category**. In particular the **unfixed** Careers employment inquiry route remains a genuine FAIL, and New Clients mobile action placement and repeated appointment language remain FAIL.
The most relevant 3 visual scores are summarized below as `mobile / desktop`; the linked CSV contains **all 12 categories for every page separately**, with score, threshold, status, evidence and exact issue IDs.

| Entry | Hierarchy M / D | Readability M / D | Premium Feel M / D | Associated issue IDs |
|---|---:|---:|---:|---|
| `about.html` | 9.0 / 9.1 | 8.8 / 9.0 | 9.0 / 9.1 | V-04 |
| `adolescent-therapy-illinois.html` | 9.0 / 9.1 | 8.8 / 9.0 | 9.0 / 9.0 | V-05 |
| `assessment.html` | 9.0 / 9.1 | 8.9 / 9.0 | 9.0 / 9.0 | KEEP |
| `bcbs-therapy-illinois.html` | 9.0 / 9.1 | 8.8 / 9.0 | 8.9 / 9.0 | V-05 |
| `careers.html` | 9.0 / 9.0 | 8.9 / 9.0 | 8.9 / 9.0 | J-01 |
| `contact.html` | 9.0 / 9.1 | 9.0 / 9.0 | 9.0 / 9.0 | V-09 |
| `couples-therapy.html` | 9.0 / 9.1 | 8.9 / 9.0 | 9.0 / 9.1 | KEEP |
| `family-therapy.html` | 9.0 / 9.1 | 8.8 / 9.0 | 8.9 / 9.0 | KEEP |
| `fees-insurance.html` | 8.9 / 9.1 | 8.8 / 9.0 | 8.9 / 9.0 | V-06 |
| `fit-safety-check.html` | N/V (redirect) | N/V | N/V | R-01 |
| `for-clinicians.html` | 8.9 / 9.1 | 8.8 / 8.9 | 8.9 / 9.1 | V-07 |
| `forensic.html` | 9.0 / 9.1 | 8.9 / 9.0 | 9.0 / 9.0 | KEEP |
| `group-therapy.html` | 9.1 / 9.2 | 8.9 / 9.0 | 9.1 / 9.2 | KEEP |
| `home-current.html` | 9.0 / 9.1 | 8.9 / 9.0 | 9.0 / 9.1 | V-03 |
| `index.html` | 9.0 / 9.1 | 8.9 / 9.0 | 9.0 / 9.1 | V-03 |
| `individual-therapy.html` | 9.0 / 9.1 | 8.8 / 9.0 | 8.9 / 9.0 | KEEP |
| `new-clients.html` | 8.5 / 9.1 | 9.0 / 9.0 | 8.8 / 9.1 | V-01, V-02 |
| `parent-support.html` | 9.0 / 9.1 | 8.9 / 9.0 | 8.9 / 9.0 | KEEP |
| `portal.html` | 9.0 / 9.1 | 9.0 / 9.0 | 9.0 / 9.0 | V-10 |
| `privacy-information.html` | 9.0 / 9.1 | 8.8 / 9.0 | 8.9 / 9.0 | KEEP |
| `psychotherapy.html` | N/V (redirect) | N/V | N/V | KEEP |
| `services.html` | 9.1 / 9.1 | 8.9 / 9.0 | 9.0 / 9.1 | KEEP |
| `team-founder.html` | 9.0 / 9.1 | 8.7 / 8.9 | 8.9 / 9.0 | V-08 |
| `team-jasmine-wilson.html` | 9.0 / 9.1 | 8.7 / 8.9 | 8.9 / 9.0 | V-08 |
| `team.html` | 9.1 / 9.1 | 9.0 / 9.0 | 9.1 / 9.1 | KEEP |
| `trauma-therapy-illinois.html` | 9.0 / 9.1 | 8.8 / 9.0 | 9.0 / 9.0 | V-05 |

## Interpretation and outstanding material evidence
- **New Clients mobile action:** after integrating the heading measure fix, 320×568 needs **385px** scroll to fully show the primary appointment button; 390×844 needs **49px**. H1 and emergency wording are preserved; mobile hierarchy remains below the 9.0 threshold pending owner-approved targeted spacing improvement. Redundancy remains below 9.5 (hero, introduction and appointment card repeat the same appointment request concept).
- **Small type and density:** several clinician, services, family and fee mobile sections use paragraphs around 13.3–14.4px. These receive concrete readability/complexity failures rather than an unsupported universal 9.0.
- **Careers:** future-interest CTA currently leads to clinical intake, and Function receives a recorded failing score at both widths. This link must not be redirected or invented before an employment-specific destination is authorized.
- **Accessibility:** 52 integrated automated axe scans are clear but **manual keyboard traversal, physical mobile, screen reader and 200–400% zoom remain material N/V** for accessibility. The site cannot receive final APPROVED status.
- **Function:** representative local internal journeys worked; external TherapyPortal completion, clinician selection, successful consultation delivery and applicant workflow are still material N/V for affected entries.
- **Redundancy & Clarity:** the full clinical/legal wording has not been rewritten or exhaustively semantically reviewed; score remains N/V for pages without enough content evidence. No clinical, fee, insurance, safety or legal copy was edited.
- **Editorial art direction:** asymmetrical professional, Lobby, Services and therapy layouts were judged in the original 390/1440 screenshot gallery; their difference is purposeful, not a reason for generic uniformization.

## Evidence provenance
- Baseline full-page mobile/desktop captures of 26 source entries; integrated before/after screenshots of impacted entries at 390/1440px.
- Browser-computed section/heading widths and mobile paragraph sizes from the prior visual register, integrated mobile first-action measurements, and representative click/navigation checks.
- A 'PASS' here applies to the supported **category judgment at that viewport**, not unverified operational and accessibility requirements.

The accompanying machine-readable `sitewide-integrated-visual-scorecard.csv` contains the complete audit trail.

## Issue-ID calibration and editorial hold
The long-format CSV assigns an issue ID to **only the rubric categories affected**, never an unrelated category just because its page has an issue.

- **C-01 (New Clients only):** repeated appointment/request framing across hero, H2 and first pathway card; editorial review only.
- **V-11 (New Clients mobile only):** primary appointment CTA sits below initial screen on 320×568, 375×667, 390×844, and 393×852. No safety/clinical text removed.
- **T-01 (only individual mobile readability/craft rows with measured sub-14.5px paragraph type):** occasional dense small supporting text; not a WCAG font-size violation, but an outstanding premium reading/typography judgment.
- **L-01 (only mobile long-page complexity, grouping, premium-perception rows showing substantial content density):** the required information may still be legitimate; restructuring or trimming clinical/legal content needs owner approval.
- **J-01 (Careers only):** future applicant action points at patient consultation; actual task failure remains open.
- **V-01–V-10:** original scoped corrections as documented in PRs #64–#66 and the prior page register, marked corrected in integration where applicable.
- **R-01:** retired Fit/Safety public redirect; no independent visual page is presented.

Numbers at or above 9.0 reflect observed category-specific composition with no *identified material* shortcoming within tested dimensions, not a blanket site approval. Material verification gaps still prevent approval even when a visual category passes.
