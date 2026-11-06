# Stonebridge — full-page visual consistency audit
**Review date:** October 28, 2026  
**Production snapshot:** `59b9ef77ab963c23c3ca1c6fd584829a6307a64e`  
**Comparison:** Chrome, 390 × 844 mobile with touch emulation, 1440 × 900 desktop; 21 sitemap pages plus 4 directly accessible non-sitemap / legacy URLs  
**Illustrated evidence:** [GitHub Actions screenshot archive](https://github.com/s1bryant019-cell/stonebridge-website/actions/runs/40760900628) (artifact: `stonebridge-visual-consistency-390-and-1440`, includes `index.html`, full-page images, first and last fold screenshots, and `measurements.json`).

## Executive result

The entire site **does have an identifiable shared visual system**. All 25 examined pages use the EB Garamond heading font, the same Stonebridge header logo image *filename*, and an off-white header color; the primary interior template consistently uses deep-blue photographic hero panels, off-white content surfaces and matching navigation/footer arrangements. The mobile headers on 22 standard and auxiliary pages measured **77px high** and their desktop counterparts **79px**. Three advertising landing pages use deliberately simplified **71px-high mobile** headers and **79px-high desktop** headers. The homepage stands apart with a lighter, editorial, split hero; its visual differentiation is substantial but not, on its own, a broken design.

**50 rendered page/viewport captures** completed successfully. No uncaught JavaScript exceptions were observed. **One measurable overflow issue** was identified: Careers had **9px of horizontal overflow at 390px**. All 22 standard/mobile menu implementations detected by the capture opened and closed with `aria-expanded: true → false`; the three advertising landing pages deliberately lack that shared mobile toggle and use their own simplified navigation.

The evidence does **not** establish that all pages are perfect or accessibility-compliant. Browser automation does not substitute for manual legibility, contrast, keyboard/screen-reader, Safari/device, real-user page speed, or actual booking flow evaluation.

## Classification and immediate decisions

| Finding | Type and priority | Confirmed evidence | Smallest recommendation |
| --- | --- | --- | --- |
| Careers student-consultation link extends outside the 390px layout | **Actual usability defect — medium** | 9px page overflow. The visible `.team-professional-link` anchor with “Explore Student Consultation” reached x≈397px in a 390px viewport | Add one scoped mobile wrapping/max-width constraint to that link only. Recheck 375–430px; do not change global navigation |
| Five homepage service-card images are heavy | **Performance issue — high** | Original PNGs are 1.65–2.10 MiB each, 1122×1402. Temporary 960px quality-82 WebP trials were 54–110 KiB, a ~95–97% reduction, not yet quality-approved | Separate image-only PR, use responsive `srcset`/WebP with PNG fallback, visual-diff check for all five images, then QA retina / crop / fallback |
| Direct-access `home-current.html` is outdated | **Content accuracy — medium** | Live `/` and `/index.html` exactly match updated `index.html`; `/home-current.html` still shows “PsyD, LCPC” and “Founder · Psychotherapist” | Separate credentials-only cleanup for the legacy page (or explicitly approved redirect). Keep active homepage and routing unchanged |
| Homepage has a different hero treatment and longer initial viewport | **Intentional-looking style distinction — review, not a defect** | Light editorial split hero, mobile hero ~1011px; interior mobile heroes ~331–542px except clinician profiles | Preserve its character. Review whether first-scroll orientation/CTA remains clear on physical devices before proposing any unification |
| Clinician hero treatment differs in mobile vertical length | **Visual/reading-flow difference — verify** | Founder ~754px and Jasmine ~841px tall on mobile; portraits can appear toward or below the first viewport. No horizontal overflow | Manual screenshot and mobile legibility review; do not move photographs/CTAs without a specific demonstrated obstruction |
| Header and footer implementations are not identical | **Stylistic/implementation variation — low-medium** | Same logo filename and off-white header across pages; homepage's beige footer is slightly darker (RGB 232,221,206) than the standard interior beige (242,235,228); standard page header heights match. Paid pages intentionally use compact navigation | Do **not** perform a sitewide header rewrite. Compare visual states and actual menu destinations, then address only demonstrable inconsistent behavior |
| Services desktop H1 omits “parents and groups” | **Messaging difference — low** | Mobile heading includes all five service audiences; desktop heading lists only individuals, couples, families. Both visible in page's source | Optional copy-only alignment if approved; maintain current H1 styling |
| Group Therapy homepage card omits enrollment status | **Expectation-setting — low-medium** | Group landing page explicitly identifies The Lobby as **gathering interest**, while homepage card describes Group Therapy generically | Optional small status text at the homepage entry point; avoid suggesting active enrollment |
| Professionals header shows patient booking action | **Audience mismatch — medium** | The Professionals page header links to general TherapyPortal booking; the main page provides “Email About Professional Services” | Make professional inquiry primary within this page's header *only after owner approval*; preserve patient booking elsewhere |
| Named-clinician appointment selections | **External workflow — unverified** | Both clinician pages link to general TherapyPortal availability; public portal starts with existing/new patient paths, but a clinician-specific selection was not confirmed | Ask practice administrator to confirm referral routing / clinician selection before editing wording or URLs |
| About text revisits the bridge metaphor | **Editorial preference — verify** | No identical paragraph duplicates detected algorithmically; conceptual repetition requires human copyediting | Mark candidate sentences for human editorial review. Do not silently remove philosophy/brand writing |

## Page-by-page visual and content assessment

Classification is a **review decision based on rendered screenshots and measured layouts**, not an automated design score. “No correction” means none is supported by current evidence, not a claim of aesthetic perfection.

| Sitemap page | 390px mobile vs 1440px desktop | Assessment / issue classification | Smallest justified correction |
| --- | --- | --- | --- |
| **Home** `/` | Hero **1011px / 544px**; full page **7818px / 4207px**. Editorial cream split layout, contrasting with dark interior hero treatment; consistent logo/font palette. | **Stylistic distinction**; long mobile first section. Heavy images confirmed. | Prioritize separate image asset PR; no hero redesign without usability evidence |
| **About** | Hero **385 / 351px**, page **5534 / 3212px**. Dark photographic hero, cream content and shared footer. | **Consistent design; editorial review** for bridge-metaphor repetition. No exact duplicate paragraphs detected. | No layout change; optional targeted prose review |
| **Team** | Hero **366 / 351px**, page **4326 / 2321px**. Same header/hero system and a paired clinician presentation. | **Consistent**; long Dr. Bryant credentials wrap without horizontal overflow. | None |
| **Founder Profile** | Hero **754 / 391px**, page **7067 / 3202px**. Different profile format with portrait and longer credentials; matching overall palette. | **Legitimate profile variation**; tall mobile introduction. | Manual text/portrait prominence review only |
| **Jasmine Wilson Profile** | Hero **841 / 391px**, page **5329 / 2576px**. Same profile concept as founder, taller mobile hero due different content. | **Legitimate variation; review first-fold content density**, not an overflow failure. | None until a specific obstructed action is demonstrated |
| **Services** | Hero **452 / 423px**, page **3603 / 2138px**. Interior layout and footer match. | **Content difference:** desktop H1 shorter than mobile H1. | Optional approved heading-only correction |
| **Individual Therapy** | Hero **432 / 370px**, page **4431 / 2457px**. Comparable to other service templates. | **Consistent**. | None |
| **Couples Therapy** | Hero **432 / 351px**, page **4084 / 2165px**. Shared service-template layout and button treatment. | **Consistent**. | None |
| **Family Therapy** | Hero **456 / 370px**, page **4263 / 2371px**. Shared service-template layout. | **Consistent**. | None |
| **Parent Support** | Hero **542 / 468px**, page **4019 / 2195px**. Slightly longer hero than peer services; content-oriented difference. | **Stylistic/word-length variation**, no demonstrated defect. | None |
| **Group Therapy** | Hero **456 / 481px**, page **5725 / 2927px**; The Lobby page provides an interest-gathering path. | **Consistent**; entry-point enrollment expectation may differ from homepage card. | Optional small homepage status phrase with approval |
| **Fees & Insurance** | Hero **385 / 391px**, page **6489 / 3479px**. Standard hero/footer. Dense fee and coverage information across narrower screen. | **Long but legitimate informative page**; no measured overflow. | No content removal; manual zoom/table scanning check |
| **Professionals** | Hero **382 / 392px**, page **6372 / 3038px**. Same visual shell as other pages; professional inquiry CTA is present in main content. | **Audience-path mismatch** at header, not a design-system failure. | Change only this page's header booking emphasis if approved |
| **Client Portal** | Hero **417 / 397px**, page **2305 / 1244px**. Shared header/footer and compact guidance. | **Consistent**. | None |
| **Contact** | Hero **331 / 351px**, page **2346 / 1307px**. Uses familiar interior hero and compact consultation form. | **Consistent**; no form flow changes warranted. | None |
| **Privacy & Information Use** | Hero **331 / 351px**, page **4579 / 2983px**. Same shell but visually text-heavy sections. | **Density / scanning review**, not overflow. | Optional future heading/paragraph readability review; preserve disclosures |
| **Careers** | Hero **432 / 351px**, page **4429 / 1937px**. Same branded shell; 390px layout has **9px overflow**. | **Confirmed usability issue** linked to the Student Consultation link. | Scoped responsive wrap/max-width fix to `.team-professional-link` |
| **New Clients** | Hero **361 / 351px**, page **2426 / 1354px**. Entry-page layout has clear scheduling and optional consultation choices. | **Consistent**, with appropriately simpler navigation. | None |
| **BCBS Therapy Illinois** | Hero **439 / 576px**, page **2873 / 2547px**. Compact advertising header **71px mobile**, compared with standard 77px; focused booking entry. | **Intentional landing-page exception**; not evidence of a broken shared header. | None; retain insurance qualifications |
| **Adolescent Therapy Illinois** | Hero **494 / 515px**, page **3727 / 2388px**. Same paid-landing header and booking-first pattern. | **Consistent within its landing-page family**. | None |
| **Trauma Therapy Illinois** | Hero **494 / 470px**, page **3622 / 2253px**. Matches paid-landing template. | **Consistent within its landing-page family**. | None |

## Supplemental direct-access pages (not part of the 21-page sitemap)

| Direct URL | Browser comparison | Status / smallest correction |
| --- | --- | --- |
| `/assessment.html` | Hero **409 / 419px**, length **2880 / 1541px**, no overflow. | Intentionally restricted assessment pathway. Do not add to service navigation without separate authorization |
| `/forensic.html` | Hero **392 / 378px**, length **2030 / 1125px**, no overflow. | Different professional-facing subject; keep unlaunched forensic offerings restricted |
| `/psychotherapy.html` | Rendered page matches Services (hero **452 / 423px**), canonical `/services.html`. | Legacy alias/redirect, not a separate competing service page; no styling change |
| `/home-current.html` | Hero **1011 / 544px**, length **7717 / 4601px**; older founder credentials. | Separate legacy content cleanup. **Do not** touch the confirmed active `/` homepage routing |

`/fit-safety-check.html` is another legacy route but redirects to New Clients and is therefore not a separate content page to score.

## Navigation and footer cross-check

The top-fold samples show a shared off-white header, Stonebridge wordmark/image-logo styling and consistent broad typography across the public site. Measured header background was `rgba(250, 245, 239, 0.984)` on all 25 local captures. The actual image filename is `stonebridge-header-logo.png` across those pages, though its cache query varies. The title uses **EB Garamond** on all 25; body font declarations use minor variations of **Inter** and fallbacks. Standard footer treatments are a pale beige `rgb(242,235,228)` while Home/legacy Home are slightly darker `rgb(232,221,206)`. These are mostly **design-system variations, not proved bugs**.

Mobile header menu-open/menu-close checks succeeded on the 22 standard or auxiliary layouts where `.mobile-toggle` appeared. The three paid landing pages use simplified navigation and do not expose that same toggle. No global navigation rewrite is justified; accessibility and keyboard checks remain separate.

## Performance and audit boundaries

The PNG versus WebP comparisons are **byte-count experiments**, not approved visual-quality comparisons. A separate image-optimization PR should include both original/optimized image crops at actual target render sizes, two DPRs, and a fallback test before merging. Performance claims are about image bytes; no field LCP, CLS or Core Web Vitals improvement was measured.

No user data was entered, no forms were submitted, no live styling or backend code was edited. The captured pages were served locally from the production Git commit. They reflect that revision in Chrome; browser/network/font differences could produce slight rendering variation on the live domain.

## Follow-up work: isolated review and rollback

1. **Images:** image-only PR, five image groups, WebP `srcset` plus PNG fallback; maintain existing crop and `alt`, compare before/after screenshots and payload. **No publish until reviewed.**
2. **Legacy credentials:** one-file `home-current.html` text-only PR. Preserve routing and current live homepage; check the direct legacy URL.
3. **Careers overflow:** one small scoped CSS-only PR, after review/approval.
4. **Service-status / professional-inquiry messaging:** separate copy/CTA PR only with the practice's approved wording.
5. **Broader header/nav styling:** defer unless further qualitative review establishes a specific user-facing problem.
6. **TherapyPortal clinician selection:** verify through the real portal/admin flow before editing clinician-specific labels.

**Publication gate:** This report does not authorize merging or deploying any of these proposals.
