# Stonebridge Careers — owner choice for future-opportunity inquiries

**Current confirmed defect (J-01):** On `careers.html`, the public “Future Opportunities” and “Ask About Future Opportunities” actions point to `contact.html`, which is intended for prospective patients seeking a consultation. That is not an appropriate applicant-data or employment route. No change has been made to these links in the current release candidate.

## Option A — approve a dedicated employment inquiry destination
The owner provides and authorizes an existing *employment-specific* destination (a correctly labeled external job-board posting, an approved hiring/contact route, or a separately designed privacy-reviewed employment form). Only after confirmation, replace the two future-interest actions to point there, verify the exact URL, keyboard focus, link semantics and any candidate privacy notice, and retest both mobile and desktop. The existing current-job Indeed application path remains unchanged. **No applicant email, ATS or personal-data collection is created by this option.**

## Option B — withhold only the future-opportunities action
Until a properly approved pathway exists, remove or render non-interactive **only** the two future-opportunity inquiry CTAs, with an honest descriptive non-submission state if owner-approved. Preserve all genuine current-opening information and current Indeed application links. Do not route an applicant to patient intake. This is a deliberate temporary **loss of future-interest inquiry functionality**, so the owner must explicitly approve it before editing the page.

## Approval required
Select **A** with a verified employment destination or **B** with express approval to suspend the two actions. Do not infer an address or employment policy. No clinical contact pathway or intake data handling changes are authorized by either option alone.

**Status:** OPEN J-01. Not included as a silent code change in PR #72. Any final release should either resolve it by approved choice or explicitly record an accepted exception; a FAIL must never be reclassified as PASS merely because external details are unavailable.
