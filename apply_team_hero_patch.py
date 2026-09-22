#!/usr/bin/env python3
from pathlib import Path
import re, shutil

root = Path(__file__).resolve().parent
team = root / "team.html"
css_file = root / "team-hero-overrides.css"

if not team.exists():
    raise SystemExit("team.html was not found in this folder.")

html = team.read_text(encoding="utf-8")
backup = root / "team.html.backup"
shutil.copy2(team, backup)

img_pattern = re.compile(
    r'(<figure class="team-page-hero-media sb-standard-hero-media">\s*<img\s+src=")[^"]+'
    r'(" alt=")[^"]+'
    r'(" fetchpriority="high" decoding="async"\s*>)',
    re.S
)

replacement = (
    r'\1team-hero-final.webp'
    r'\2Warm Stonebridge therapy room with blue sofa, lamp, shelving, and natural light'
    r'\3'
)

html, count = img_pattern.subn(replacement, html, count=1)
if count != 1:
    raise SystemExit("Could not find the Team hero image markup exactly once. No changes were written.")

html = re.sub(
    r'\n<style id="stonebridge-team-hero-final">.*?</style>\n',
    "\n",
    html,
    flags=re.S,
)

css = css_file.read_text(encoding="utf-8")
style_block = '\n<style id="stonebridge-team-hero-final">\n' + css + '\n</style>\n'

if "</head>" not in html:
    raise SystemExit("Could not find </head>. No changes were written.")

html = html.replace("</head>", style_block + "\n</head>", 1)
team.write_text(html, encoding="utf-8")

print("Patched Team hero successfully.")
print("Backup:", backup.name)
print("Upload required asset: team-hero-final.webp")
