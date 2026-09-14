(function () {
  var VERSION = '20260914e';

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

  function forceImage(img, src, alt) {
    if (!img) return;
    var picture = img.closest('picture');
    if (picture) {
      picture.querySelectorAll('source').forEach(function (source) {
        source.remove();
      });
    }
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.setAttribute('src', src);
    if (typeof alt === 'string') img.setAttribute('alt', alt);
  }

  function normalizeFounderImages() {
    var headshotSrc = 'founder-headshot-live-20260914.svg?v=' + VERSION;
    var environmentalSrc = 'founder-environmental.png?v=' + VERSION;

    document.querySelectorAll(
      '.portrait-frame img, .clinician-photo img, img[src*="practitioner-headshot-sbryant"], img[src*="founder-headshot"]'
    ).forEach(function (img) {
      forceImage(img, headshotSrc, 'Dr. Stephen W. Bryant, PsyD, LCPC');
    });

    document.querySelectorAll('.home-founder-media img').forEach(function (img) {
      forceImage(img, environmentalSrc, 'Dr. Stephen W. Bryant seated in an office');
    });
  }

  function ensureHotfixCss() {
    var link = document.getElementById('stonebridge-hotfix');
    if (!link) {
      link = document.createElement('link');
      link.id = 'stonebridge-hotfix';
      link.rel = 'stylesheet';
      link.href = 'stonebridge-hotfix.css?v=' + VERSION;
      document.head.appendChild(link);
    }
    return link;
  }

  function loadCore(brandLink, hotfixLink) {
    if (document.getElementById('stonebridge-script-core')) return;
    var script = document.createElement('script');
    script.id = 'stonebridge-script-core';
    script.src = 'script-core.js?v=' + VERSION;
    script.onload = function () {
      if (brandLink && brandLink.parentNode) document.head.appendChild(brandLink);
      if (hotfixLink && hotfixLink.parentNode) document.head.appendChild(hotfixLink);
    };
    document.body.appendChild(script);
  }

  function init() {
    normalizeHeader();
    var brandLink = ensureBrandCss();
    var hotfixLink = ensureHotfixCss();
    normalizeFounderImages();
    loadCore(brandLink, hotfixLink);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();