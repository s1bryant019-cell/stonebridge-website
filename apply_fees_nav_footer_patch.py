#!/usr/bin/env python3
"""
Stonebridge Fees & Insurance nav/footer patcher.

Place this script in the same folder as your site HTML files and run:

    python apply_fees_nav_footer_patch.py

It will create .bak backups and update any .html file in the folder so the
new fees-insurance.html page is linked from the top nav and footer.
"""
from pathlib import Path

FEES_NAV = '          <a href="fees-insurance.html">Fees &amp; Insurance</a>\n'
FEES_NAV_ACTIVE = '          <a class="active" href="fees-insurance.html">Fees &amp; Insurance</a>\n'
LINKEDIN = '          <a href="https://www.linkedin.com/company/stonebridge-psychological-group/" target="_blank" rel="noopener noreferrer" aria-label="Stonebridge Psychological Group on LinkedIn">LinkedIn</a>\n'

def patch_html(path: Path, text: str) -> str:
    original = text
    active_fees = path.name == 'fees-insurance.html'

    # Top navigation: add Fees & Insurance before Portal.
    nav_part = text.split('</nav>', 1)[0]
    if 'href="fees-insurance.html"' not in nav_part:
        insertion = FEES_NAV_ACTIVE if active_fees else FEES_NAV
        text = text.replace(
            '          <a href="portal.html">Portal</a>',
            insertion + '          <a href="portal.html">Portal</a>',
            1
        )

    footer_pos = text.find('<footer')
    if footer_pos != -1:
        footer = text[footer_pos:]

        # Footer Services column: add Fees & Insurance before Consultation.
        services_pos = footer.find('<div class="footer-title">Services</div>')
        if services_pos != -1:
            services_seg = footer[services_pos:services_pos + 700]
            if 'fees-insurance.html' not in services_seg:
                before = text[:footer_pos + services_pos]
                after = text[footer_pos + services_pos:]
                after = after.replace(
                    '          <a href="forensic.html">Forensic Services</a>\n          <a href="contact.html">Consultation</a>',
                    '          <a href="forensic.html">Forensic Services</a>\n          <a href="fees-insurance.html">Fees &amp; Insurance</a>\n          <a href="contact.html">Consultation</a>',
                    1
                )
                text = before + after
                footer_pos = text.find('<footer')
                footer = text[footer_pos:]

        # Footer Quick Links column: add Fees & Insurance before Portal.
        quick_pos = footer.find('<div class="footer-title">Quick Links</div>')
        if quick_pos != -1:
            quick_seg = footer[quick_pos:quick_pos + 700]
            if 'fees-insurance.html' not in quick_seg:
                before = text[:footer_pos + quick_pos]
                after = text[footer_pos + quick_pos:]
                after = after.replace(
                    '          <a href="services.html">Services</a>\n          <a href="portal.html">Portal</a>',
                    '          <a href="services.html">Services</a>\n          <a href="fees-insurance.html">Fees &amp; Insurance</a>\n          <a href="portal.html">Portal</a>',
                    1
                )
                text = before + after

    # Footer Contact column: add LinkedIn quietly after the consultation line.
    if 'linkedin.com/company/stonebridge-psychological-group' not in text:
        text = text.replace(
            '          <span>Consultation requests by form, email, or phone</span>\n',
            '          <span>Consultation requests by form, email, or phone</span>\n' + LINKEDIN,
            1
        )

    return text

updated = []
for path in sorted(Path('.').glob('*.html')):
    text = path.read_text(encoding='utf-8')
    new_text = patch_html(path, text)
    if new_text != text:
        backup = path.with_suffix(path.suffix + '.bak')
        if not backup.exists():
            backup.write_text(text, encoding='utf-8')
        path.write_text(new_text, encoding='utf-8')
        updated.append(path.name)

if updated:
    print('Updated:', ', '.join(updated))
else:
    print('No changes needed. Fees & Insurance links already appear to be present.')
