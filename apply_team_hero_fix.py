#!/usr/bin/env python3
"""
Stonebridge Team hero structural fix.

Usage:
  1. Put this file in the same folder as team.html.
  2. Run: python apply_team_hero_fix.py

What it does:
  - Changes compact-team-hero to hero-team.
  - Removes the watermark class from the Team hero panel.
  - Removes overlay/caption markup from the first Team hero panel.
  - Preserves the current image src and current page copy.
  - Creates team.html.bak before writing.
"""
from pathlib import Path
import re

path = Path("team.html")
if not path.exists():
    raise SystemExit("Could not find team.html in this folder.")

html = path.read_text(encoding="utf-8")
original = html

html = html.replace(
    '<section class="stone-page-hero compact-team-hero">',
    '<section class="stone-page-hero hero-team">',
    1,
)
html = html.replace(
    '<div class="stone-hero-panel watermark">',
    '<div class="stone-hero-panel">',
    1,
)

# Remove the overlay/caption block immediately following the first hero image, if present.
html = re.sub(
    r'\n\s*<div class="stone-hero-overlay"></div>\s*\n\s*<div class="stone-panel-caption">[\s\S]*?\n\s*</div>\s*(?=\n\s*</div>\s*\n\s*<div class="stone-page-inner">)',
    '\n',
    html,
    count=1,
)

if html == original:
    raise SystemExit("No changes made. The Team hero may already be updated or the markup is different.")

backup = path.with_suffix(".html.bak")
backup.write_text(original, encoding="utf-8")
path.write_text(html, encoding="utf-8")
print("Updated team.html and created team.html.bak")
