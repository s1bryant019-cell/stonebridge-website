# Careers: exact unimplemented option to withhold future inquiries

**Status: OWNER REVIEW ONLY. NOT IMPLEMENTED.** No change to \`careers.html\` is authorized by this document.

The current prospective-applicant inquiry path mistakenly routes to the **patient consultation form** (\`contact.html\`). The current genuine advertised-role application is the separate Indeed link and **must remain**.

## Option B: exact two-line removal (requires express approval)

Proposed \`careers.html\` diff, not applied:

\`\`\`diff
@@ Careers hero .team-hero-actions @@
 <div class="team-hero-actions">
   <a class="btn btn-primary" href="#current-opening">View Current Opening</a>
-  <a class="btn btn-secondary" href="contact.html">Future Opportunities</a>
 </div>

@@ Careers future-opportunities section @@
 <p>Ask about future clinician or training opportunities.</p>
 </div>
-<a class="btn btn-secondary" href="contact.html">Ask About Future Opportunities</a>
 </div>
\`\`\`

There are **exactly two** proposed anchor removals and **no replacements, redirects, hidden forms, applicant email addresses or data-collection features**. The existing current-opening link remains unchanged:

\`\`\`html
<a class="btn btn-primary" href="https://www.indeed.com/job/therapist-dcc3ac4028419732" target="_blank" rel="noopener noreferrer">View Role &amp; Apply on Indeed</a>
\`\`\`

**Editorial concern:** The surviving paragraph, “Ask about future clinician or training opportunities,” becomes an invitation without an action. Updating that text to an honest temporary-unavailable status requires **separate owner approval**; it is not included in the proposed two-line code patch.

## Option A: owner-approved employment inquiry destination

The alternative is a verified, owner-approved employment-specific URL or route with an appropriate privacy/data-handling process. Only after approval would the **two existing anchor hrefs** be changed to that destination. Do not use patient intake or invent an employment inbox/ATS.

## Verification gate if either option is authorized

Review the exact diff; check hero actions, current-opening card and Indeed route; confirm no dead or misleading CTA remains; rerun keyboard, mobile/desktop screenshot, internal-link and CI checks on the **single PR #72 candidate**. Do not merge this review document as permission for an applicant workflow.

**Current state:** J-01 remains an actual function FAIL and is **not fixed** in the release candidate.
