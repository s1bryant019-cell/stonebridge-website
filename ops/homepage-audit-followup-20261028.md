# Homepage audit follow-up — 28 October 2026

**Status:** draft, **not published**. Production baseline: `86714814dc2e2a0b897cbcff8692c3840f2e5d03`.

This follow-up is grounded in the user-supplied Stonebridge Website Review (October 28, 2026), current repository source, the existing Fees & Insurance / Group Therapy pages, browser rendering in real Chrome for Testing 156, and the pull request's automated regression/screenshot workflows.

## Confirmed content findings and proposed revisions

| Audit finding | Before | Proposed change | Boundaries |
| --- | --- | --- | --- |
| Repeated reassurance in Getting Started | Intro repeats a reassurance already provided above: “You do not need to have everything figured out before reaching out.” | Remove that one intro paragraph. Keep **Starting Therapy at Stonebridge** heading and all three numbered steps, including appointment confirmation qualifications. | No change to three-step outcomes or safety/clinical guidance |
| Illinois telehealth description repeated above service cards | “Online psychotherapy throughout Illinois for a range of concerns and life stages.” | “Explore what each service offers.” | Keep full Illinois service area and intended audience in hero |
| Perspective duplicate in extracted text | Two `span` alternatives, one desktop/one mobile, without a separating space | Use one existing concise statement on both layouts: “Stonebridge provides clinically grounded psychotherapy within a clear and relational setting.” Remove dead alternate-copy selector fragments while preserving founder eyebrow behavior. | Real Chrome renders **only one** original alternative at a time, so the “setting.Clinically” concatenation was a **source extraction artifact**, not proven visible duplication |
| Mobile hero insurance cue lists Aetna and BCBSIL only | Missing other accepted networks listed on Fees & Insurance | “Insurance options vary by clinician and plan. Review accepted coverage.” The last sentence links to `fees-insurance.html#payment-options`. Existing Fees page includes Aetna, BCBSIL, Medicaid FFS and Guidehealth; clinician/service/plan eligibility caveats retained there. | Prior approved design hides the **whole facts row on desktop**. Desktop visitors retain Fees & Insurance in nav; do not reintroduce a desktop hero information bar |
| Group Therapy card could imply general scheduling | Existing description lacked enrollment status | “Clinician-led groups. Featured teen group gathering interest; consultation available.” | Group Therapy source confirms The Lobby is **gathering interest**, with screening and cohort formation; no placement/start-date guarantees |

## Browser checks completed

- Chrome for Testing 156 at **320, 375, 390, 760, 768, 1024, 1280, 1440 CSS pixels**, comparing current production HTML with proposed homepage HTML while reusing production styles/scripts/assets.
- **No horizontal document overflow** at those eight settled viewport widths. The existing hero photography, header, button destinations, beige transition, and service/clinician/step structure were preserved.
- The updated mobile insurance link is visible at phone widths, targets the exact fees-page `#payment-options` section, and was successfully **clicked in a browser**; the expected section loaded.
- Keyboard Tab navigation at **320/375/390px** reached the mobile insurance link (7th focus stop), with a visible `:focus-visible` outline. The mobile menu expanded when clicked. These are **targeted interaction checks**, not a full WCAG 2.2 AA accessibility audit.
- At **390px** with root font size raised to **200%**, Chrome showed no document or insurance-link horizontal overflow in that check. Text sizing, screen-reader behavior and all possible zoom states are not universally certified.
- The Perspective copy is represented as a single text statement in the revised DOM, avoiding alternate-span concatenation. Three Getting Started cards remained rendered.
- Updated homepage service card still directs to `group-therapy.html`. The full group's own explanation of inquiry/screening/placement was left unchanged.
- No real patient contact data was used; no production consultation submission was necessary for content-only changes.

## Automated evidence

- **Sitewide regression:** all tests passing on the latest proposed branch. Added five targeted content/safety contracts.
- **Before/after screenshots:** GitHub Actions workflow `Homepage content audit visual review` captured Chrome images at 390, 430, 1024, 1280, and 1440px, using exact current-production baseline. See pull request checks/artifacts.
- No changes to `script.js`, consultation request JS, `/api/consultation-request`, Resend, TherapyPortal, interior clinical copy, fee schedules or the 24px/14px beige transition.

## Original scorecard: what is and is not resolved

The supplied external audit rated extracted-text **Redundancy & Clarity 9.4/10** (below its own 9.5 requirement). The proposed edits address the audit's identified repetitions, but **no independent replacement numeric score has been established**. Do not claim this is now 9.5/10 or that the entire site meets a 9.0+ visual/a11y threshold.

The supplied scorecard marked most visual, functional, performance, and accessibility categories **not verified**. These targeted real-Chrome checks provide better evidence for layout reflow and a keyboard path, but **do not** establish comprehensive premium visual quality, WCAG 2.2 AA compliance, full appointment completion, actual email inbox delivery, or Core Web Vitals.

**Release gate:** leave the pull request **draft and unmerged** until the owner reviews the copy/screenshot changes and explicitly authorizes deployment. Verify the exact deployment SHA only after approval.
