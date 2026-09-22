STONEBRIDGE PSYCHOLOGICAL GROUP
TEAM PAGE — CONSULTATION IMAGE PATCH

SCOPE
This package changes ONLY the "Consultation before commitment" visual treatment.

It does NOT change:
- the Team hero
- Dr. Bryant's headshot
- Jasmine Wilson's headshot
- clinician card sizing/crops
- clinician copy
- the "What guides our work" section
- the lower CTA/footer

FILES
1. team-consultation-chair.webp
   Optimized version of the chair image you approved.

2. team-consultation-section.html
   The exact replacement HTML for the consultation section.

3. team-consultation-overrides.css
   The CSS that makes the consultation image bleed all the way to the LEFT
   edge on desktop, matching the mockup direction.

4. apply_consultation_patch.py
   Optional automatic patcher for an existing team.html.

HOW TO APPLY — AUTOMATIC
1. Put your CURRENT team.html into this folder.
2. Run:
      python apply_consultation_patch.py
3. The script creates team.html.backup.
4. Upload the resulting team.html and team-consultation-chair.webp to the
   same directory on the website.

HOW TO APPLY — MANUAL
1. Upload team-consultation-chair.webp to the same directory as team.html.
2. In team.html, replace the existing <section class="team-consultation">...
   </section> block with team-consultation-section.html.
3. Copy the contents of team-consultation-overrides.css into a <style> block
   near the bottom of <head>, AFTER the existing Team-page styles.
4. Upload team.html.

EXPECTED RESULT
- Chair photograph reaches the LEFT edge of the viewport on desktop.
- Copy remains on the right.
- On tablet/mobile the layout stacks normally.
- Existing Stonebridge buttons/type/colors remain intact.
