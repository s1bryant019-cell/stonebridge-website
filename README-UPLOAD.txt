STONEBRIDGE PSYCHOLOGICAL GROUP
TEAM PAGE — HERO IMAGE PATCH

SCOPE
This package changes ONLY the Team-page hero.

It does NOT change:
- the Consultation before commitment section
- Dr. Bryant's headshot
- Jasmine Wilson's headshot
- clinician card sizing/crops
- clinician copy
- lower Team-page sections

FILES
1. team-hero-final.webp
   Optimized version of the hero image you supplied.

2. team-hero-section.html
   The exact Team hero markup using that image.

3. team-hero-overrides.css
   Hero-only CSS with the existing Stonebridge blue overlay.

4. apply_team_hero_patch.py
   Optional patch script for an existing team.html.

HOW TO APPLY — AUTOMATIC
1. Put your CURRENT team.html into this folder.
2. Run:
      python apply_team_hero_patch.py
3. Upload the resulting team.html and team-hero-final.webp.

HOW TO APPLY — MANUAL
1. Upload team-hero-final.webp to the same directory as team.html.
2. Replace the current Team hero section with team-hero-section.html.
3. Add the contents of team-hero-overrides.css in a <style> block near the bottom of <head>.

EXPECTED RESULT
- Your supplied room image becomes the Team hero.
- Existing blue Stonebridge overlay remains.
- Existing hero headline and copy remain.
- No other Team-page section changes.
