(function () {
  var VERSION = '20260914b';

  function pageName() {
    var path = (window.location.pathname || '').split('/').pop().toLowerCase();
    return path || 'index.html';
  }

  function activeKey() {
    var page = pageName();
    if (page === 'about.html') return 'about';
    if (page === 'team.html' || page === 'team-founder.html') return 'team';
    if ([
      'services.html','psychotherapy.html','individual-therapy.html','couples-therapy.html',
      'family-therapy.html','parent-support.html','group-therapy.html','assessment.html'
    ].indexOf(page) !== -1) return 'services';
    if (page === 'fees-insurance.html') return 'fees';
    if (page === 'contact.html') return 'new-clients';
    if (page === 'for-clinicians.html' || page === 'forensic.html') return 'professionals';
    if (page === 'portal.html') return 'portal';
    return '';
  }

  function navLink(href, label, key, active) {
    var current = key && key === active;
    return '<a href="' + href + '"' + (current ? ' class="active" aria-current="page"' : '') + '>' + label + '</a>';
  }

  function canonicalHeader() {
    var active = activeKey();
    return [
      '<header class="site-header compact-site-header sb-global-header">',
      '  <div class="container nav">',
      '    <a class="brand-link" href="index.html" aria-label="Stonebridge Psychological Group home">',
      '      <img class="sb-header-logo" src="stonebridge-header-logo.png?v=' + VERSION + '" alt="Stonebridge Psychological Group" width="640" height="154">',
      '    </a>',
      '    <button class="mobile-toggle" type="button" aria-label="Open main menu" aria-expanded="false">Menu</button>',
      '    <div class="menu-wrap">',
      '      <nav class="menu" aria-label="Primary navigation">',
      navLink('about.html','About','about',active),
      navLink('team.html','Team','team',active),
      navLink('services.html','Services','services',active),
      navLink('fees-insurance.html','Fees &amp; Insurance','fees',active),
      navLink('contact.html','New Clients','new-clients',active),
      navLink('for-clinicians.html','Professionals','professionals',active),
      navLink('portal.html','Portal','portal',active),
      '      </nav>',
      '      <div class="header-cta"><a class="btn btn-primary" href="contact.html#inquiry-form">Request a Consultation</a></div>',
      '    </div>',
      '  </div>',
      '</header>'
    ].join('');
  }

  function normalizeHeader() {
    var existing = document.querySelector('.site-header, .home-site-header');
    if (!existing) return;
    if (existing.classList.contains('sb-global-header')) return;
    var wrapper = document.createElement('div');
    wrapper.innerHTML = canonicalHeader();
    existing.replaceWith(wrapper.firstElementChild);
  }

  function ensureBrandCss() {
    var link = document.getElementById('stonebridge-brand-sync');
    if (!link) {
      link = document.createElement('link');
      link.id = 'stonebridge-brand-sync';
      link.rel = 'stylesheet';
      link.href = 'stonebridge-brand-sync.css?v=' + VERSION;
      document.head.appendChild(link);
    }
    return link;
  }

  function bustFounderImageCache() {
    document.querySelectorAll('source[srcset*="practitioner-headshot-sbryant"], img[src*="practitioner-headshot-sbryant"]').forEach(function (node) {
      if (node.tagName.toLowerCase() === 'source') {
        var set = node.getAttribute('srcset') || '';
        node.setAttribute('srcset', set.split(',').map(function (part) {
          var bits = part.trim().split(/\s+/);
          if (!bits[0]) return part;
          bits[0] = bits[0].split('?')[0] + '?v=' + VERSION;
          return bits.join(' ');
        }).join(', '));
      } else {
        var src = node.getAttribute('src') || '';
        if (src) node.setAttribute('src', 'practitioner-headshot-sbryant-760.webp?v=' + VERSION);
      }
    });
  }

  function loadCore(brandLink) {
    if (document.getElementById('stonebridge-script-core')) return;
    var script = document.createElement('script');
    script.id = 'stonebridge-script-core';
    script.src = 'script-core.js?v=' + VERSION;
    script.onload = function () {
      /* Keep exact Brand Sheet overrides last in the cascade after core injects its compatibility styles. */
      if (brandLink && brandLink.parentNode) document.head.appendChild(brandLink);
    };
    document.body.appendChild(script);
  }

  function init() {
    normalizeHeader();
    var brandLink = ensureBrandCss();
    bustFounderImageCache();
    loadCore(brandLink);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
