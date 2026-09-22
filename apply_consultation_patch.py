#!/usr/bin/env python3
"""
Apply the Stonebridge consultation-image/left-bleed patch to team.html.

Place this script, team.html, team-consultation-overrides.css, and
team-consultation-chair.webp in the same directory, then run:

    python apply_consultation_patch.py

It creates team.html.backup before changing anything.
"""

from pathlib import Path
import re
import shutil

root = Path(__file__).resolve().parent
team = root / "team.html"
css_file = root / "team-consultation-overrides.css"

if not team.exists():
    raise SystemExit("team.html was not found in this folder.")

html = team.read_text(encoding="utf-8")
original = html

# Backup before modifying.
backup = root / "team.html.backup"
shutil.copy2(team, backup)

# Replace ONLY the consultation image source and alt text.
img_pattern = re.compile(
    r'(<figure class="team-consultation-media">\s*<img\s+src=")[^"]+'
    r'(" alt=")[^"]+'
    r'(" loading="lazy" decoding="async"\s*>)',
    re.S
)

replacement = (
    r'\1team-consultation-chair.webp'
    r'\2Warm psychotherapy room with upholstered chair, lamp, plant, and soft natural light'
    r'\3'
)

html, count = img_pattern.subn(replacement, html, count=1)
if count != 1:
    raise SystemExit(
        "Could not find the current consultation image markup exactly once. "
        "No changes were written."
    )

# Append a scoped override block before </head>.
css = css_file.read_text(encoding="utf-8")
style_block = (
    "\n<style id=\"stonebridge-consultation-left-bleed-20260922\">\n"
    + css
    + "\n</style>\n"
)

# Make reruns safe.
html = re.sub(
    r'\n<style id="stonebridge-consultation-left-bleed-20260922">.*?</style>\n',
    "\n",
    html,
    flags=re.S,
)

if "</head>" not in html:
    raise SystemExit("Could not find </head>. No changes were written.")

html = html.replace("</head>", style_block + "\n</head>", 1)

team.write_text(html, encoding="utf-8")

print("Patched team.html successfully.")
print("Backup:", backup.name)
print("Asset required in same web directory: team-consultation-chair.webp")
