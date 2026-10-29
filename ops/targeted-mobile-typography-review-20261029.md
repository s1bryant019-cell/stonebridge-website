# Selected mobile paragraph readability — scoped implementation review
**Base:** existing integrated test PR #68. No production merge or deploy.

## Visual and measured rationale
The mobile reading pass inspected rendered paragraph font sizes, line wraps, line height, full-page scroll and existing section balance. Only substantial explanatory paragraphs and selected long list items were targeted at widths ≤640px. Display headings, small editorial labels, CTA text, fees, safety, and all copy stay unchanged.

| Page | Exact affected selector group | Long paragraphs below 15px (390px) | Page height before → after |
|---|---|---:|---:|
| Founder | `#patient-fit p`, `#therapy-style p`, `#background .founder-background-panel p` | 12→4 | 7063→7284px (+3.1%) |
| Jasmine | `#clinical-focus article p`, `#clinical-approach p`, `#fit-background p`, `.cp-scope-scan-list li` | 14→4 | 5369→5554px (+3.4%) |
| Professionals | `.clinicians-section--offerings p`, `.clinicians-boundaries-section p`, `#professional-fees p` | 20→4 | 6411→6762px (+5.5%) |
| Individual Therapy | `#adult-therapy .individual-focus p`, `.individual-boundary-inner p` | 12→4 | 4482→4610px (+2.9%) |
| Family Therapy | `#family-focus p`, `.family-boundary-inner p` | 9→2 | 4366→4517px (+3.5%) |
| Couples Therapy | `#couples-focus p`, `.couples-boundary-inner p` | 9→3 | 4077→4221px (+3.5%) |
| Parent Support | `.parent-focus p`, `.parent-boundary-inner p` | 8→3 | 4059→4194px (+3.3%) |
| Privacy & Information Use | `.privacy-note p` only | 12→11 | 4619→4658px (+0.8%) |

Paragraphs above are computed-font observations in a local Chromium 390px viewport. The count **does not** represent all paragraphs on a page and **does not** imply every remaining sub-15px treatment is defective; some are appropriate minor disclosure/label text.

- Founder receives `1rem = 16px` for selected long explanations.
- Other targeted pages receive `.98rem = 15.68px` and `line-height:1.6`; Privacy note receives `.96rem = 15.36px`.
- All changes are page-scoped, `@media(max-width:640px)`, appended at the end of that page's `head` to handle established stylesheets. Specific `!important` is required where existing page rules are unusually strong.
- At 1440px, **all eight pages measured zero change in page height**. Mobile 390px, 320px and 430px have no observed horizontal overflow.
- The increased height is intentional reading space, not invented sections. Retain carefully differentiated labels, secondary links and service boundaries.

## Explicit non-changes
**Fees & Insurance:** inspected substantive paragraphs; no qualifying long paragraph below 14.6px in that pass. The previously corrected fee footnote contrast is already covered by PR #65. Do not alter fees, payer participation or table layout merely to produce a typography change.

**Professionals and clinician profile art direction:** the asymmetrical desktop rails, images, section grids and credentials remain intact. No typography family, brand color, photograph or logo changed.

**Privacy:** only the long note receives a limited increase, not every legal paragraph or the overall site type scale.

## Evidence
The review workflow generates before/after full-page mobile (390px) and desktop (1440px) images for all eight affected pages, records median body typography and page heights at five widths, and runs WCAG-tagged axe on the candidate. It cannot replace manual readability, zoom/reflow and screen-reader evaluation. CI must pass before approval.

**Owner design approval required; do not merge/deploy.**