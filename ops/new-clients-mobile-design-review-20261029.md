# New Clients mobile hero — targeted design review
**Scope:** mobile-only `min-height` correction on existing photographic hero and its copy container. No content, artwork, colors, links, appointment order or safety change.

## Exactly what changed
At widths `max-width:720px`, the inherited 360px hero minimum becomes **300px** on `.new-client-access-page .access-hero` and its `.access-hero-copy` only. Existing CSS currently forces a 360px minimum, so the local override uses `!important` rather than rewriting shared hero rules. Hero photograph, dark protective overlay, text block, body copy, and option cards remain unchanged. Desktop is unaffected.

## Observed six-device measurements
Pixel positions are document-relative from unscrolled top; browser toolbar and physical device safe area are not simulated. No forced above-the-fold button.

| Viewport | Hero height before → after | CTA bottom before → after | Scroll for entire CTA before → after |
|---|---:|---:|---:|
| 320×568 | 361→301px | 953→893px | 385→**325px** |
| 375×667 | 361→301px | 890→830px | 223→**163px** |
| 390×844 | 361→301px | 893→833px | 49→**0px** |
| 393×852 | 361→301px | 893→833px | 41→**0px** |
| 412×915 | 361→301px | 898→838px | 0→**0px** |
| 430×932 | 361→301px | 881→821px | 0→**0px** |

## Why this is demonstrably more intentional
- Reduces *pre-task* visual distance by 60px without moving cards over the photograph or trimming required content.
- Keeps the important Stonebridge hero image visibly photographic and cropped within the established overlay; no new asset, generated logo or unapproved alternate layout.
- Preserves the paired appointment/optional consultation choices and existing strong primary button.
- Retains the emergency guidance immediately after the two pathways. The guidance remains reachable, not removed.
- Does **not** artificially force the first appointment button into the fold on 320×568 or 375×667, where a reading-first scroll remains appropriate.

### Separate proposed editorial option — NOT IMPLEMENTED
Existing H2: “Request an appointment. Consultation is available if you prefer.”

**Suggested alternative for owner approval only:** “Choose your next step.”

Rationale: the hero has already described appointment requests, and the numbered cards specify the two pathways; a shorter H2 would reduce semantic repetition and free additional height. It is **not included** in the HTML or PR. If approved, update the H2 in a separate editorial PR and recheck the hierarchy at six widths. No hero confirmation disclaimer, crisis guidance or card text is changed by this suggestion.

## Verification
Compare full-page AND first-fold images at all six widths from the PR Actions artifact `stonebridge-new-clients-mobile-hero-before-after`. The test also records exact box positions, horizontal overflow, pending appointment disclaimer, and 988 presence, and runs WCAG-tagged axe on the candidate. This is automated review, not complete WCAG certification. Manual device/Safari/screen-reader evaluation remains outstanding.

**Release:** Draft only, base = integrated testing branch. Do not merge/deploy without explicit owner approval.
