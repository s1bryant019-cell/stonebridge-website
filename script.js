(function () {
  'use strict';

  function getCurrentFilename() {
    var path = (window.location.pathname || '').split('/').pop();
    return (path || 'index.html').toLowerCase();
  }

  function ensurePremiumStylesheet() {
    if (document.querySelector('link[href="stonebridge-premium.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'stonebridge-premium.css';
    document.head.appendChild(link);
  }

  function navActiveKey(filename) {
    if (filename === 'about.html') return 'approach';
    if (filename === 'services.html' || [
      'individual-therapy.html','couples-therapy.html','family-therapy.html','parent-support.html','group-therapy.html'
    ].indexOf(filename) !== -1) return 'services';
    if (filename === 'team.html' || filename === 'team-founder.html') return 'clinicians';
    if (filename === 'fees-insurance.html') return 'fees';
    return '';
  }

  function normalizePrimaryNavigation() {
    var filename = getCurrentFilename();
    var active = navActiveKey(filename);
    var links = [
      { key: 'approach', href: 'about.html', label: 'Approach' },
      { key: 'services', href: 'services.html', label: 'Services' },
      { key: 'clinicians', href: 'team.html', label: 'Clinicians' },
      { key: 'fees', href: 'fees-insurance.html', label: 'Fees' }
    ];

    document.querySelectorAll('.site-header').forEach(function (header, headerIndex) {
      var menu = header.querySelector('.menu');
      var menuWrap = header.querySelector('.menu-wrap');
      var toggle = header.querySelector('.mobile-toggle');
      if (!menu || !menuWrap) return;

      menu.id = headerIndex === 0 ? 'primary-menu' : 'primary-menu-' + (headerIndex + 1);
      menu.innerHTML = '';
      links.forEach(function (item) {
        var link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.label;
        if (item.key === active) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
        menu.appendChild(link);
      });

      var cta = header.querySelector('.header-cta a');
      if (!cta) {
        var ctaWrap = document.createElement('div');
        ctaWrap.className = 'header-cta';
        cta = document.createElement('a');
        cta.className = 'btn btn-primary';
        ctaWrap.appendChild(cta);
        menuWrap.appendChild(ctaWrap);
      }
      cta.href = 'contact.html#inquiry-form';
      cta.textContent = 'Request a Consultation';

      if (toggle) {
        toggle.setAttribute('aria-controls', menu.id);
        toggle.setAttribute('aria-label', 'Open main menu');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
      }
    });
  }

  function initMenu() {
    document.querySelectorAll('.mobile-toggle').forEach(function (toggle) {
      var header = toggle.closest('.site-header');
      var menuWrap = header ? header.querySelector('.menu-wrap') : null;
      var menu = header ? header.querySelector('.menu') : null;
      if (!header || !menuWrap || !menu) return;

      function setOpen(open, returnFocus) {
        menuWrap.classList.toggle('open', open);
        menu.classList.toggle('open', open);
        header.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close main menu' : 'Open main menu');
        toggle.textContent = open ? 'Close' : 'Menu';
        if (!open && returnFocus) toggle.focus();
      }

      setOpen(false, false);
      toggle.addEventListener('click', function () {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true', false);
      });
      menu.addEventListener('click', function (event) {
        if (event.target.closest('a')) setOpen(false, false);
      });
      document.addEventListener('click', function (event) {
        if (toggle.getAttribute('aria-expanded') === 'true' && !header.contains(event.target)) setOpen(false, false);
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          event.preventDefault();
          setOpen(false, true);
        }
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth > 960 && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, false);
      });
    });
  }

  function footerMarkup() {
    return [
      '<div class="premium-footer-grid">',
        '<div class="premium-footer-brand">',
          '<div class="footer-brand">STONEBRIDGE</div>',
          '<div class="footer-sub">Psychological Group</div>',
          '<p>Thoughtful online psychotherapy for Illinois clients, grounded in clinical judgment, relationship, and clear structure.</p>',
        '</div>',
        '<div><div class="footer-title">Stonebridge</div><div class="footer-links">',
          '<a href="about.html">Approach</a><a href="team.html">Clinicians</a><a href="services.html">Services</a><a href="fees-insurance.html">Fees</a>',
        '</div></div>',
        '<div><div class="footer-title">Clients</div><div class="footer-links">',
          '<a href="contact.html#inquiry-form">Request a Consultation</a><a href="contact.html">New Client Information</a><a href="portal.html">Client Portal</a>',
        '</div></div>',
        '<div><div class="footer-title">Professionals</div><div class="footer-links">',
          '<a href="for-clinicians.html">Professional Offerings</a><a href="mailto:info@stonebridgepsychgroup.com">Contact</a>',
        '</div></div>',
        '<div><div class="footer-title">Practice</div><div class="footer-links">',
          '<a href="privacy-information.html">Privacy &amp; Information Use</a><span>Serving Illinois via telehealth</span><a href="tel:+17734171688">(773) 417-1688</a>',
        '</div></div>',
      '</div>',
      '<div class="container footer-bottom">',
        '<div class="footer-small">© 2026 Stonebridge Psychological Group. All rights reserved.</div>',
        '<div class="footer-small"><a href="mailto:info@stonebridgepsychgroup.com">info@stonebridgepsychgroup.com</a></div>',
      '</div>'
    ].join('');
  }

  function normalizeFooter() {
    document.querySelectorAll('.site-footer').forEach(function (footer) {
      footer.innerHTML = footerMarkup();
    });
  }

  function normalizeConsultationCtas() {
    var labels = [
      'begin a fit review','start with a consultation','request consultation','request a consultation',
      'get started','contact us','new clients','begin therapy'
    ];
    document.querySelectorAll('a').forEach(function (link) {
      var href = (link.getAttribute('href') || '').toLowerCase();
      var text = (link.textContent || '').trim().toLowerCase();
      if (href.indexOf('contact') !== -1 && labels.indexOf(text) !== -1) {
        link.textContent = 'Request a Consultation';
        link.setAttribute('href', 'contact.html#inquiry-form');
      }
    });
  }

  function buildUtilityStrip(items, label) {
    var strip = document.createElement('section');
    strip.className = 'hero-utility-strip';
    strip.setAttribute('aria-label', label || 'Page information');
    var inner = document.createElement('div');
    inner.className = 'hero-utility-strip-inner';
    items.forEach(function (item, index) {
      if (index) {
        var separator = document.createElement('i');
        separator.className = 'hero-utility-strip-separator';
        separator.setAttribute('aria-hidden', 'true');
        inner.appendChild(separator);
      }
      var text = document.createElement('span');
      text.className = 'hero-utility-strip-item';
      text.textContent = item;
      inner.appendChild(text);
    });
    strip.appendChild(inner);
    return strip;
  }

  function normalizeHeroUtilityStrips() {
    var filename = getCurrentFilename();
    var configs = {
      'contact.html': { hero: '.contact-hero', removeInsideHero: '.contact-practical-line', items: ['Free 10–15 minute consultation','Illinois telehealth','Reviewed within 1–2 business days'], label: 'Consultation information' },
      'individual-therapy.html': { hero: '.individual-hero', remove: '.individual-overview', items: ['One-to-one care','Relational + practical','Illinois telehealth'], label: 'Individual therapy information' },
      'couples-therapy.html': { hero: '.couples-hero', remove: '.couples-overview', items: ['Relationship-centered','Structure with warmth','Illinois telehealth'], label: 'Couples therapy information' },
      'family-therapy.html': { hero: '.family-hero', remove: '.family-overview', items: ['Family-centered','Clear participation','Illinois telehealth'], label: 'Family therapy information' },
      'parent-support.html': { hero: '.parent-hero', remove: '.parent-overview', items: ['Support without blame','Relational + practical','Illinois telehealth'], label: 'Parent support information' },
      'group-therapy.html': { hero: '.group-hero', remove: '.group-overview', items: ['Live interpersonal practice','Stable membership','Illinois telehealth'], label: 'Group therapy information' },
      'fees-insurance.html': { hero: '.fees-hero', remove: '.fees-overview', items: ['Aetna','BCBSIL','Private pay + out-of-network options'], label: 'Fees and insurance information' },
      'team-founder.html': { hero: '.founder-intro', remove: '.founder-summary-band', items: ['Illinois telehealth','Relational + psychodynamic','Evidence-based integration'], label: 'Founder practice information' },
      'for-clinicians.html': { hero: '.clinicians-hero', remove: '.clinicians-overview', items: ['Peer groups','Consultation + supervision','Writing, review + education'], label: 'Professional offerings' },
      'portal.html': { hero: '.portal-hero', remove: '.portal-overview', items: ['Assigned forms','Telehealth sessions','Account + billing'], label: 'Client portal information' }
    };
    var config = configs[filename];
    if (!config) return;
    var hero = document.querySelector(config.hero);
    if (!hero) return;
    if (config.removeInsideHero) {
      var inside = hero.querySelector(config.removeInsideHero);
      if (inside) inside.remove();
    }
    if (config.remove) {
      var old = document.querySelector(config.remove);
      if (old) old.remove();
    }
    var next = hero.nextElementSibling;
    if (next && next.classList.contains('hero-utility-strip')) next.remove();
    hero.insertAdjacentElement('afterend', buildUtilityStrip(config.items, config.label));
  }

  function normalizeContactExperience() {
    var page = document.querySelector('body.contact-page');
    if (!page) return;
    var submitButton = page.querySelector('#submitButton');
    if (submitButton && !submitButton.disabled) submitButton.textContent = 'Request Consultation';
    var crisisNote = page.querySelector('.contact-before-send .contact-crisis-note');
    var submitArea = page.querySelector('.contact-form-submit');
    if (crisisNote && submitArea) submitArea.insertAdjacentElement('afterend', crisisNote);
  }

  function normalizeTargetedImageAltText() {
    document.querySelectorAll('body.group-therapy-page .lobby-showcase-brand img').forEach(function (img) {
      img.setAttribute('alt', '');
      img.setAttribute('aria-hidden', 'true');
      img.setAttribute('role', 'presentation');
    });
    document.querySelectorAll('body.group-therapy-page #groups-forming img').forEach(function (img) {
      var src = (img.getAttribute('src') || '').toLowerCase();
      var alt = (img.getAttribute('alt') || '').trim().toLowerCase();
      if (alt !== 'image' && alt !== 'photo' && alt !== 'picture') return;
      if (src.indexOf('the-lobby-wordmark') !== -1) {
        img.setAttribute('alt', '');
        img.setAttribute('aria-hidden', 'true');
        img.setAttribute('role', 'presentation');
      } else if (src.indexOf('teen-cooperative-group-participant') !== -1) {
        img.setAttribute('alt', 'Adolescent viewed from behind wearing headphones at a desk with cooperative farming gameplay visible on a monitor');
      } else if (src.indexOf('teen-cooperative-group-desk') !== -1) {
        img.setAttribute('alt', 'Cooperative farming gameplay displayed on a desk during a teen group therapy activity');
      }
    });
  }

  function findHeading(root, selector, text) {
    return Array.prototype.slice.call(root.querySelectorAll(selector)).find(function (element) {
      return (element.textContent || '').trim().toLowerCase() === text.toLowerCase();
    });
  }

  function initFounderPage() {
    var page = document.querySelector('body.sbx-founder-page, body.founder-page');
    if (!page) return;
    var main = page.querySelector('main') || page;
    var focus = main.querySelector('#clinical-focus');
    if (focus) {
      var focusIntro = focus.querySelector('.compact-section-intro p');
      if (focusIntro) focusIntro.textContent = 'Dr. Bryant has particular experience across these areas within a broader outpatient practice.';
      var focusGrid = focus.querySelector('.focus-compact-grid');
      if (focusGrid) {
        focusGrid.classList.add('founder-focus-compressed');
        focusGrid.setAttribute('aria-label', 'Clinical focus');
        focusGrid.innerHTML = [
          '<article><span>01</span><h3>Addiction and co-occurring concerns</h3><p>Substance use, relapse and recovery patterns, ambivalence, process addictions, shame, coping cycles, and dual-diagnosis concerns.</p></article>',
          '<article><span>02</span><h3>Trauma, PTSD, and complex stress</h3><p>Threat responses, dissociation, safety, emotional regulation, body-based distress, self-worth, and protective patterns.</p></article>',
          '<article><span>03</span><h3>Mood, anxiety, and emotional regulation</h3><p>Depression, panic, overthinking, irritability, shutdown, mood instability, avoidance, and difficulty feeling steady.</p></article>',
          '<article><span>04</span><h3>Relationships, identity &amp; life transitions</h3><p>Couples and family concerns, identity, grief, family stress, parent support, and significant life transitions.</p></article>'
        ].join('');
      }
      var broaderCare = focus.querySelector('.broader-care-compact');
      if (broaderCare) broaderCare.remove();
    }
    var approach = main.querySelector('#therapy-style');
    if (approach) {
      approach.innerHTML = [
        '<div class="founder-wide-shell therapy-method-layout">',
          '<div class="therapy-method-intro"><div class="section-label">Clinical approach</div><h2>How Dr. Bryant works.</h2></div>',
          '<div><div class="therapy-method-list" aria-label="Psychotherapy approaches used by Dr. Bryant">',
            '<article class="therapy-method-row"><div class="therapy-method-number">01</div><div><h3>Relational &amp; psychodynamic</h3><p>Recurring emotional and relationship patterns, identity, defenses, needs, and the therapeutic relationship.</p></div></article>',
            '<article class="therapy-method-row"><div class="therapy-method-number">02</div><div><h3>Evidence-based skills &amp; behavior change</h3><p>CBT, ACT, DBT, and motivational interviewing are integrated when useful for regulation, avoidance, values, coping, and change.</p></div></article>',
            '<article class="therapy-method-row"><div class="therapy-method-number">03</div><div><h3>Trauma, attachment &amp; systems</h3><p>Trauma-informed, attachment-based, and family-systems approaches connect symptoms with safety, development, relationships, and family patterns.</p></div></article>',
          '</div><p class="therapy-method-note">These approaches are not applied as a fixed formula. Dr. Bryant develops an individualized formulation and draws from different methods when they support the purpose of therapy.</p></div>',
        '</div>'
      ].join('');
    }
  }

  function initProfessionalsPage() {
    var page = document.querySelector('body.clinicians-page');
    if (!page) return;
    var redundantIntro = page.querySelector('.clinicians-section-intro');
    if (redundantIntro) redundantIntro.remove();
    var groupSection = page.querySelector('#peer-groups');
    if (groupSection) {
      var heading = groupSection.querySelector('.clinicians-consultation-cta > strong');
      if (heading) {
        var h2 = document.createElement('h2');
        h2.className = 'professional-group-heading';
        h2.textContent = 'Peer Consultation Groups';
        heading.replaceWith(h2);
      }
      var intro = groupSection.querySelector('.clinicians-consultation-cta > p:not(.clinicians-boundary)');
      if (intro) intro.textContent = 'Separate monthly consultation groups are available for practicing clinicians and graduate/doctoral trainees.';
    }
    var categories = {
      'consultation-supervision': 'Individual Consultation & Supervision',
      'writing-review': 'Assessment & Professional Writing',
      'professional-education': 'Education & Training'
    };
    Object.keys(categories).forEach(function (id) {
      var category = page.querySelector('#' + id);
      if (category) category.innerHTML = '<h2>' + categories[id] + '</h2>';
    });
    var finalCta = page.querySelector('.clinicians-cta .btn');
    if (finalCta) finalCta.textContent = 'Request a Consultation';
  }

  function initParentSupportPage() {
    var page = document.querySelector('body.parent-support-page');
    if (!page) return;
    var label = Array.prototype.slice.call(page.querySelectorAll('.parent-label')).find(function (element) {
      return (element.textContent || '').trim().toLowerCase() === 'a thoughtful place to begin';
    });
    if (label) {
      var section = label.closest('.parent-section');
      if (section) section.remove();
    }
    var focusIntro = page.querySelector('.parent-focus-intro p');
    if (focusIntro) focusIntro.textContent = 'Parent support considers behavior within its developmental, relational, emotional, and family context.';
  }

  function initPortalPage() {
    var page = document.querySelector('body.portal-page');
    if (!page) return;
    var portalMain = page.querySelector('.portal-main');
    if (portalMain) portalMain.remove();
    var layout = page.querySelector('.portal-layout');
    if (layout) layout.classList.add('portal-layout--privacy-only');
  }

  function initCareersPage() {
    var page = document.querySelector('body.careers-page');
    if (!page) return;
    var cta = page.querySelector('.team-cta');
    if (!cta) return;
    var heading = cta.querySelector('h2');
    var paragraph = cta.querySelector('p');
    if (heading) heading.textContent = 'Interested in a future opportunity?';
    if (paragraph) paragraph.textContent = 'Ask about future clinician or training opportunities.';
  }

  function normalizeImageLoading() {
    var heroSelectors = ['.premium-home-hero','.premium-interior-hero','.home-hero','.about-hero','.contact-hero','.team-hero','.services-hero','.individual-hero','.couples-hero','.family-hero','.parent-hero','.group-hero','.fees-hero','.clinicians-hero','.portal-hero','.founder-intro'].join(',');
    document.querySelectorAll('main img').forEach(function (img) {
      var inHero = Boolean(img.closest(heroSelectors));
      if (inHero) {
        img.removeAttribute('loading');
        if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'high');
      } else if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    });
  }

  function initSkipLinks() {
    document.querySelectorAll('.skip-link[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function () {
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        window.setTimeout(function () { target.focus({ preventScroll: true }); }, 0);
      });
    });
  }

  function init() {
    ensurePremiumStylesheet();
    normalizePrimaryNavigation();
    normalizeFooter();
    normalizeConsultationCtas();
    normalizeHeroUtilityStrips();
    normalizeContactExperience();
    normalizeTargetedImageAltText();
    initFounderPage();
    initProfessionalsPage();
    initParentSupportPage();
    initPortalPage();
    initCareersPage();
    normalizeImageLoading();
    initMenu();
    initSkipLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
