(function () {
  function initMenu() {
    document.querySelectorAll('.mobile-toggle').forEach(function (toggle, index) {
      var header = toggle.closest('.site-header') || document.querySelector('.site-header');
      var menuWrap = header ? header.querySelector('.menu-wrap') : document.querySelector('.menu-wrap');
      var menu = header ? header.querySelector('.menu') : document.querySelector('.menu');
      if (!header || !menuWrap || !menu) return;

      if (!menu.id) menu.id = index === 0 ? 'primary-menu' : 'primary-menu-' + (index + 1);
      toggle.setAttribute('aria-controls', menu.id);

      function closeServicesSubmenu() {
        var servicesDropdown = header.querySelector('.services-nav-dropdown');
        if (!servicesDropdown) return;
        var servicesToggle = servicesDropdown.querySelector('.services-menu-toggle');
        var servicesPanel = servicesDropdown.querySelector('.services-dropdown-menu');
        servicesDropdown.classList.remove('is-open');
        if (servicesToggle) {
          servicesToggle.setAttribute('aria-expanded', 'false');
          servicesToggle.setAttribute('aria-label', 'Open Services menu');
        }
        if (servicesPanel) servicesPanel.hidden = true;
      }

      function setOpen(open, returnFocus) {
        menuWrap.classList.toggle('open', open);
        menu.classList.toggle('open', open);
        header.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close main menu' : 'Open main menu');
        toggle.textContent = open ? 'Close' : 'Menu';
        if (!open) closeServicesSubmenu();
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
        if (toggle.getAttribute('aria-expanded') === 'true' && !header.contains(event.target)) {
          setOpen(false, false);
        }
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          event.preventDefault();
          setOpen(false, true);
        }
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 760 && toggle.getAttribute('aria-expanded') === 'true') {
          setOpen(false, false);
        }
      });
    });
  }

  function normalizeCareersNavigation() {
    var currentPath = (window.location.pathname || '').toLowerCase();
    var onCareersPage = currentPath.endsWith('/careers.html') || currentPath.endsWith('careers.html');

    document.querySelectorAll('.menu').forEach(function (menu) {
      Array.prototype.slice.call(menu.querySelectorAll('a[href="careers.html"]')).forEach(function (link) {
        link.remove();
      });

      var homeLink = Array.prototype.slice.call(menu.querySelectorAll('a')).find(function (link) {
        var href = (link.getAttribute('href') || '').toLowerCase();
        var text = (link.textContent || '').trim().toLowerCase();
        return text === 'home' && (href === 'index.html' || href === '/' || href === './' || href === '');
      });

      if (onCareersPage && !homeLink) {
        homeLink = document.createElement('a');
        homeLink.href = 'index.html';
        homeLink.textContent = 'Home';
        menu.insertBefore(homeLink, menu.firstChild);
      }
    });

    document.querySelectorAll('.site-footer a[href="careers.html"]').forEach(function (link) {
      link.remove();
    });
  }

  function normalizePrivacyFooter() {
    document.querySelectorAll('.site-footer').forEach(function (footer) {
      if (footer.querySelector('a[href="privacy-information.html"]')) return;

      var practiceSection = Array.prototype.slice.call(footer.querySelectorAll('.footer-title')).find(function (title) {
        return (title.textContent || '').trim().toLowerCase() === 'practice';
      });

      if (practiceSection) {
        var links = practiceSection.parentElement ? practiceSection.parentElement.querySelector('.footer-links') : null;
        if (links) {
          var link = document.createElement('a');
          link.href = 'privacy-information.html';
          link.textContent = 'Privacy & Information Use';
          links.appendChild(link);
          return;
        }
      }

      var fallback = footer.querySelector('.footer-bottom .footer-small:last-child');
      if (fallback) {
        var fallbackLink = document.createElement('a');
        fallbackLink.href = 'privacy-information.html';
        fallbackLink.textContent = 'Privacy & Information Use';
        fallback.insertBefore(document.createTextNode(' · '), fallback.firstChild);
        fallback.insertBefore(fallbackLink, fallback.firstChild);
      }
    });
  }

  function normalizeConsultationCtas() {
    document.querySelectorAll('.header-cta a').forEach(function (link) {
      link.textContent = 'Request a Consultation';
      if ((link.getAttribute('href') || '').indexOf('contact.html') !== -1) {
        link.setAttribute('href', 'contact.html#inquiry-form');
      }
    });

    var consultationLabels = [
      'begin a fit review',
      'start with a consultation',
      'request consultation',
      'get started',
      'contact us',
      'new clients'
    ];

    document.querySelectorAll('a').forEach(function (link) {
      var text = (link.textContent || '').trim().toLowerCase();
      var href = (link.getAttribute('href') || '').toLowerCase();
      if (consultationLabels.indexOf(text) !== -1 && href.indexOf('contact') !== -1) {
        link.textContent = 'Request a Consultation';
        if (href.indexOf('contact.html') !== -1) link.setAttribute('href', 'contact.html#inquiry-form');
      }
    });
  }

  function normalizeTargetedImageAltText() {
    document.querySelectorAll('body.home-page .home-hero-media img, body.home-page .home-clinician-photo img').forEach(function (img) {
      img.setAttribute('alt', '');
      img.setAttribute('role', 'presentation');
    });

    document.querySelectorAll('body.group-therapy-page .lobby-showcase-brand img').forEach(function (img) {
      img.setAttribute('alt', '');
      img.setAttribute('aria-hidden', 'true');
      img.setAttribute('role', 'presentation');
    });

    document.querySelectorAll('body.group-therapy-page #groups-forming img').forEach(function (img) {
      var src = (img.getAttribute('src') || '').toLowerCase();
      var alt = (img.getAttribute('alt') || '').trim().toLowerCase();
      var generic = alt === 'image' || alt === 'photo' || alt === 'picture';
      if (!generic) return;

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

  function addRevisionStyles() {
    if (document.getElementById('stonebridge-priority-revisions')) return;
    var style = document.createElement('style');
    style.id = 'stonebridge-priority-revisions';
    style.textContent = [
      ':root{--sb-system-wide:1220px;--sb-system-standard:1120px;--sb-system-content:1160px;--sb-system-reading:46rem;--sb-system-cream:#f2ece4;--sb-system-ink:#213142;--sb-system-muted:#5d6870;--sb-system-navy:#163b61;--sb-system-navy-deep:#102f4d;--sb-system-gold:#c0a06a;--sb-system-line:rgba(33,49,66,.14);--sb-system-warm-line:rgba(212,200,185,.74)}',
      '.clinicians-overview .professional-route-link{display:block;color:inherit;text-decoration:none;border-radius:4px}',
      '.clinicians-overview .professional-route-link:hover h2,.clinicians-overview .professional-route-link:focus-visible h2{text-decoration:underline;text-underline-offset:3px}',
      '.clinicians-overview .professional-route-link:focus-visible{outline:3px solid #163b61;outline-offset:5px}',
      '.clinicians-page #peer-groups,.clinicians-page #consultation-supervision,.clinicians-page #writing-review,.clinicians-page #professional-education,.clinicians-page #professional-fees{scroll-margin-top:104px}',
      '.clinicians-page .clinicians-service-category h2{margin:0;color:var(--clinicians-gold);font-family:"Inter",sans-serif;font-size:.7rem;font-weight:800;letter-spacing:.13em;line-height:1.4;text-transform:uppercase}',
      '.clinicians-page .professional-group-heading{margin:0 0 8px;color:var(--clinicians-ink);font-family:"EB Garamond",Georgia,serif;font-size:1.65rem;line-height:1.08;letter-spacing:-.02em}',
      '.sbx-founder-page .focus-compact-grid.founder-focus-compressed,.founder-page .focus-compact-grid.founder-focus-compressed{grid-template-columns:repeat(2,minmax(0,1fr))!important}',
      '.portal-page .portal-layout.portal-layout--privacy-only{grid-template-columns:1fr!important;justify-content:center!important}',
      '.portal-page .portal-privacy{width:min(100%,900px);justify-self:center}',
      '.hero-utility-strip{background:var(--sb-system-cream);border-bottom:1px solid var(--sb-system-warm-line);color:var(--sb-system-ink)}',
      '.hero-utility-strip-inner{width:min(var(--sb-system-standard),calc(100% - 72px));min-height:48px;margin:0 auto;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;padding:12px 0;text-align:center}',
      '.hero-utility-strip-item{color:#545f6b;font-family:"Inter",sans-serif;font-size:.84rem;font-weight:600;line-height:1.42}',
      '.hero-utility-strip-separator{width:4px;height:4px;margin:0 15px;border-radius:50%;background:var(--sb-system-gold);flex:0 0 4px}',
      '.sb-system-hero-rule{width:40px!important;height:2px!important;margin-bottom:20px!important;background:#d3b57f!important}',
      '.sb-system-hero-eyebrow{color:#e1c79c!important;font-family:"Inter",sans-serif!important;font-size:.68rem!important;font-weight:800!important;letter-spacing:.18em!important;line-height:1.35!important;text-transform:uppercase!important}',
      '.sb-system-hero-title{margin-top:10px!important;max-width:15ch!important;color:#fffaf2!important;font-family:"EB Garamond",Georgia,serif!important;font-size:clamp(3.1rem,4.1vw,4.45rem)!important;line-height:1.035!important;letter-spacing:-.048em!important;text-wrap:balance!important;text-shadow:0 10px 30px rgba(0,0,0,.18)!important}',
      '.sb-system-hero-body{max-width:40rem!important;margin-top:18px!important;color:rgba(255,250,242,.90)!important;font-family:"Inter",sans-serif!important;font-size:1rem!important;line-height:1.68!important}',
      '.sb-system-hero-actions{display:flex!important;flex-wrap:wrap!important;gap:12px!important;margin-top:25px!important}',
      '.sb-system-hero-actions .btn{min-height:50px;padding:0 22px;border-radius:12px;font-family:"Inter",sans-serif;font-size:.84rem;font-weight:700;line-height:1.2}',
      '.sb-system-hero-actions .btn-primary{background:#f4eee4!important;border-color:#f4eee4!important;color:var(--sb-system-navy-deep)!important;box-shadow:none}',
      '.sb-system-hero-actions .btn-primary:hover{background:#fffaf2!important;border-color:#fffaf2!important}',
      '.sb-system-hero-actions .btn-secondary{background:rgba(255,255,255,.08)!important;border-color:rgba(255,255,255,.42)!important;color:#fffaf2!important;box-shadow:none}',
      '.sb-system-hero-actions .btn-secondary:hover{background:rgba(255,255,255,.14)!important;border-color:rgba(255,255,255,.72)!important}',
      '.sb-overlay-dark-left::before{background:linear-gradient(90deg,rgba(12,31,49,.95) 0%,rgba(12,31,49,.89) 29%,rgba(12,31,49,.66) 49%,rgba(12,31,49,.28) 72%,rgba(12,31,49,.08) 100%),linear-gradient(180deg,rgba(10,24,38,.15) 0%,rgba(10,24,38,.03) 56%,rgba(10,24,38,.25) 100%)!important}',
      '.sb-overlay-full-dark::before{background:linear-gradient(180deg,rgba(12,31,49,.78),rgba(12,31,49,.72))!important}',
      '.sb-overlay-light::before{background:linear-gradient(90deg,rgba(12,31,49,.68),rgba(12,31,49,.12))!important}',
      '.sb-system-hero-media img{width:100%;height:100%;object-fit:cover}',
      '.contact-form-submit + .contact-crisis-note{margin-top:24px;padding-top:18px;border-top:1px solid var(--contact-line,rgba(33,49,66,.14))}',
      '.mobile-toggle,.services-menu-toggle{min-width:44px;min-height:44px}',
      '.menu a{min-height:44px;display:inline-flex;align-items:center}',
      '.menu a[aria-current="page"],.menu a.active{color:var(--sb-system-ink);font-weight:700}',
      '.site-header button:focus-visible,.site-header a:focus-visible{outline:3px solid #163b61;outline-offset:3px}',
      '.about-label,.services-label,.individual-label,.couples-label,.family-label,.parent-label,.group-label,.fees-label,.team-label,.clinicians-label,.contact-label,.portal-label,.form-eyebrow{font-family:"Inter",sans-serif;font-size:.68rem;font-weight:800;letter-spacing:.18em;line-height:1.35;text-transform:uppercase}',
      '.about-shell,.services-shell,.individual-shell,.couples-shell,.family-shell,.parent-shell,.fees-shell,.team-shell,.clinicians-shell,.contact-shell,.portal-shell{width:min(var(--sb-system-content),calc(100% - 72px))!important}',
      '.group-shell{width:min(1180px,calc(100% - 72px))!important}',
      '.about-relational-layout,.services-balanced-layout,.individual-intro-grid,.individual-focus-layout,.individual-process,.couples-intro-grid,.couples-focus-layout,.couples-process,.family-intro-grid,.family-focus-layout,.family-process,.parent-intro-grid,.parent-focus-layout,.parent-process,.group-intro-grid,.group-development,.group-value-layout,.group-process,.clinicians-scope-layout{grid-template-columns:minmax(240px,300px) minmax(0,1fr)!important;gap:44px!important}',
      '.about-intro{grid-template-columns:minmax(0,1.06fr) minmax(320px,.78fr)!important;gap:52px!important}',
      '.about-experience-item{grid-template-columns:1fr!important;gap:5px!important;padding:15px 0!important}',
      '.about-experience-item .about-item-label{margin-bottom:1px}',
      '.about-scope-inner,.individual-boundary-inner,.couples-boundary-inner,.family-boundary-inner,.parent-boundary-inner,.group-boundary-inner,.individual-related-group-inner,.portal-crisis-inner{width:min(var(--sb-system-content),calc(100% - 72px))!important;grid-template-columns:minmax(240px,300px) minmax(0,1fr)!important;gap:44px!important}',
      '.about-scope p,.individual-boundary p,.couples-boundary p,.family-boundary p,.parent-boundary p,.group-boundary p,.individual-related-group p,.portal-crisis p{max-width:none!important}',
      '.services-primary-intro{grid-template-columns:minmax(240px,300px) minmax(0,1fr)!important;gap:44px!important}',
      '.services-coverage-note{grid-template-columns:minmax(180px,220px) minmax(0,1fr)!important;gap:32px!important}',
      '.fees-relational-layout{grid-template-columns:minmax(240px,300px) minmax(0,1fr)!important;gap:44px!important}',
      '.fees-policy{grid-template-columns:minmax(220px,280px) minmax(0,1fr)!important;gap:40px!important}',
      '.team-growth-note,.team-professional-note{grid-template-columns:minmax(200px,240px) minmax(0,1fr)!important;gap:32px!important}',
      '.contact-layout{grid-template-columns:minmax(250px,320px) minmax(0,740px)!important;gap:44px!important;justify-content:space-between!important}',
      '.clinicians-offerings-grid{grid-template-columns:minmax(230px,280px) repeat(2,minmax(0,1fr))!important}',
      '.clinicians-scope-row{grid-template-columns:160px minmax(0,1fr)!important;gap:24px!important}',
      '.about-cta-inner,.services-cta-inner,.individual-cta-inner,.couples-cta-inner,.family-cta-inner,.parent-cta-inner,.group-cta-inner,.fees-cta-inner,.team-cta-inner,.clinicians-cta-inner,.portal-new-inner{width:min(var(--sb-system-content),calc(100% - 72px))!important;padding-top:27px!important;padding-bottom:27px!important}',
      '.contact-form-section{padding-top:48px!important;padding-bottom:52px!important}',
      '.portal-section{padding-top:48px!important;padding-bottom:52px!important}',
      '@media(min-width:1081px){.sb-system-hero{min-height:480px!important}.sb-system-hero.sb-system-hero--compact{min-height:460px!important}.sb-system-hero-copy{width:min(var(--sb-system-wide),calc(100% - 72px))!important;min-height:inherit!important;margin:0 auto!important;padding:42px 0 40px!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important}.about-section{padding-top:46px!important;padding-bottom:46px!important}.services-section,.individual-section,.couples-section,.family-section,.parent-section,.group-section{padding-top:50px!important;padding-bottom:50px!important}.fees-section,.team-section,.clinicians-section{padding-top:48px!important;padding-bottom:48px!important}}',
      '@media(max-width:1080px){.hero-utility-strip-inner{width:min(100% - 44px,var(--sb-system-standard))}.sb-system-hero-title{font-size:clamp(3rem,5.1vw,4.1rem)!important}.sb-system-hero-body{max-width:38rem!important}.about-shell,.services-shell,.individual-shell,.couples-shell,.family-shell,.parent-shell,.fees-shell,.team-shell,.clinicians-shell,.contact-shell,.portal-shell,.group-shell{width:min(100% - 44px,var(--sb-system-content))!important}.about-relational-layout,.services-balanced-layout,.individual-intro-grid,.individual-focus-layout,.individual-process,.couples-intro-grid,.couples-focus-layout,.couples-process,.family-intro-grid,.family-focus-layout,.family-process,.parent-intro-grid,.parent-focus-layout,.parent-process,.group-intro-grid,.group-development,.group-value-layout,.group-process,.clinicians-scope-layout,.about-intro,.about-scope-inner,.individual-boundary-inner,.couples-boundary-inner,.family-boundary-inner,.parent-boundary-inner,.group-boundary-inner,.individual-related-group-inner,.portal-crisis-inner,.contact-layout{grid-template-columns:1fr!important;gap:26px!important}.about-experience-item{grid-template-columns:1fr!important}.portal-page .portal-privacy{width:100%}}',
      '@media(max-width:720px){.hero-utility-strip-inner{width:min(100% - 34px,var(--sb-system-standard));min-height:0;flex-direction:column;align-items:flex-start;gap:6px;padding:14px 0;text-align:left}.hero-utility-strip-separator{display:none}.hero-utility-strip-item{font-size:.82rem}.sb-system-hero-title{max-width:13ch!important;font-size:clamp(2.55rem,10.5vw,3.55rem)!important;line-height:1.06!important}.sb-system-hero-body{font-size:.96rem!important;line-height:1.64!important}.sb-system-hero-actions{width:100%!important}.sb-system-hero-actions .btn{width:100%;min-height:48px;justify-content:center;text-align:center}.about-section,.services-section,.individual-section,.couples-section,.family-section,.parent-section,.group-section,.fees-section,.team-section,.clinicians-section{padding-top:40px!important;padding-bottom:42px!important}.sbx-founder-page .focus-compact-grid.founder-focus-compressed,.founder-page .focus-compact-grid.founder-focus-compressed{grid-template-columns:1fr!important}.about-shell,.services-shell,.individual-shell,.couples-shell,.family-shell,.parent-shell,.fees-shell,.team-shell,.clinicians-shell,.contact-shell,.portal-shell,.group-shell{width:min(100% - 34px,var(--sb-system-content))!important}.about-cta-inner,.services-cta-inner,.individual-cta-inner,.couples-cta-inner,.family-cta-inner,.parent-cta-inner,.group-cta-inner,.fees-cta-inner,.team-cta-inner,.clinicians-cta-inner,.portal-new-inner,.about-scope-inner,.individual-boundary-inner,.couples-boundary-inner,.family-boundary-inner,.parent-boundary-inner,.group-boundary-inner,.individual-related-group-inner,.portal-crisis-inner{width:min(100% - 34px,var(--sb-system-content))!important}}',
      '@media(max-width:760px){.menu{gap:8px!important}.menu a{width:100%;min-height:44px;padding:8px 10px;border-radius:8px}.mobile-toggle{justify-content:center}}',
      '@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}.btn,.menu a,.mobile-toggle,.services-menu-toggle,.sb-system-hero-actions .btn{transition:none!important;transform:none!important}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function findHeading(root, selector, text) {
    return Array.prototype.slice.call(root.querySelectorAll(selector)).find(function (element) {
      return (element.textContent || '').trim().toLowerCase() === text.toLowerCase();
    });
  }

  function getCurrentFilename() {
    var path = (window.location.pathname || '').split('/').pop();
    return (path || 'index.html').toLowerCase();
  }

  function buildUtilityStrip(items, label) {
    var strip = document.createElement('section');
    strip.className = 'hero-utility-strip';
    strip.setAttribute('aria-label', label || 'Page information');

    var inner = document.createElement('div');
    inner.className = 'hero-utility-strip-inner';

    items.forEach(function (item, index) {
      if (index > 0) {
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
      'index.html': {
        hero: '.home-hero',
        existing: '.home-trust',
        items: ['Illinois telehealth', 'Free 10–15 minute consultation', 'Aetna + BCBSIL accepted'],
        label: 'Practice information'
      },
      'about.html': {
        hero: '.about-hero',
        remove: '.about-overview',
        items: ['Clinical judgment', 'Whole-person care', 'Clear therapeutic frame'],
        label: 'Stonebridge practice principles'
      },
      'contact.html': {
        hero: '.contact-hero',
        removeInsideHero: '.contact-practical-line',
        items: ['Free 10–15 minute consultation', 'Illinois telehealth', 'Reviewed within 1–2 business days'],
        label: 'Consultation information'
      },
      'team.html': {
        hero: '.team-hero',
        remove: '.team-overview',
        items: ['Illinois telehealth', 'Relational outpatient care', 'Clinician matching by fit'],
        label: 'Team information'
      },
      'services.html': {
        hero: '.services-hero',
        remove: '.services-overview',
        items: ['Individual care', 'Relationship & family care', 'Groups & parent support'],
        label: 'Services overview'
      },
      'individual-therapy.html': {
        hero: '.individual-hero',
        remove: '.individual-overview',
        items: ['One-to-one care', 'Relational + practical', 'Illinois telehealth'],
        label: 'Individual therapy information'
      },
      'couples-therapy.html': {
        hero: '.couples-hero',
        remove: '.couples-overview',
        items: ['Relationship-centered', 'Structure with warmth', 'Illinois telehealth'],
        label: 'Couples therapy information'
      },
      'family-therapy.html': {
        hero: '.family-hero',
        remove: '.family-overview',
        items: ['Family-centered', 'Clear participation', 'Illinois telehealth'],
        label: 'Family therapy information'
      },
      'parent-support.html': {
        hero: '.parent-hero',
        remove: '.parent-overview',
        items: ['Support without blame', 'Relational + practical', 'Illinois telehealth'],
        label: 'Parent support information'
      },
      'group-therapy.html': {
        hero: '.group-hero',
        remove: '.group-overview',
        items: ['Live interpersonal practice', 'Stable membership', 'Illinois telehealth'],
        label: 'Group therapy information'
      },
      'fees-insurance.html': {
        hero: '.fees-hero',
        remove: '.fees-overview',
        items: ['Aetna', 'BCBSIL', 'Private pay + out-of-network options'],
        label: 'Fees and insurance information'
      },
      'team-founder.html': {
        hero: '.founder-intro',
        remove: '.founder-summary-band',
        items: ['Illinois telehealth', 'Relational + psychodynamic', 'Evidence-based integration'],
        label: 'Founder practice information'
      },
      'for-clinicians.html': {
        hero: '.clinicians-hero',
        remove: '.clinicians-overview',
        items: ['Peer groups', 'Consultation + supervision', 'Writing, review + education'],
        label: 'Professional offerings'
      },
      'portal.html': {
        hero: '.portal-hero',
        remove: '.portal-overview',
        items: ['Assigned forms', 'Telehealth sessions', 'Account + billing'],
        label: 'Client portal information'
      }
    };

    var config = configs[filename];
    if (!config) return;

    var hero = document.querySelector(config.hero);
    if (!hero) return;

    if (config.removeInsideHero) {
      var insideHero = hero.querySelector(config.removeInsideHero);
      if (insideHero) insideHero.remove();
    }

    if (config.remove) {
      var oldBand = document.querySelector(config.remove);
      if (oldBand) oldBand.remove();
    }

    if (config.existing) {
      var existing = document.querySelector(config.existing);
      if (existing) {
        existing.classList.add('hero-utility-strip');
        var existingInner = existing.querySelector('.home-trust-inner') || existing.firstElementChild;
        if (existingInner) {
          existingInner.classList.add('hero-utility-strip-inner');
          existingInner.innerHTML = '';
          config.items.forEach(function (item, index) {
            if (index > 0) {
              var existingSeparator = document.createElement('i');
              existingSeparator.className = 'hero-utility-strip-separator';
              existingSeparator.setAttribute('aria-hidden', 'true');
              existingInner.appendChild(existingSeparator);
            }
            var existingText = document.createElement('span');
            existingText.className = 'hero-utility-strip-item';
            existingText.textContent = item;
            existingInner.appendChild(existingText);
          });
        }
        existing.setAttribute('aria-label', config.label);
        if (existing.previousElementSibling !== hero) hero.insertAdjacentElement('afterend', existing);
        return;
      }
    }

    var previousStrip = hero.nextElementSibling && hero.nextElementSibling.classList.contains('hero-utility-strip')
      ? hero.nextElementSibling
      : null;
    if (previousStrip) previousStrip.remove();

    hero.insertAdjacentElement('afterend', buildUtilityStrip(config.items, config.label));
  }

  function normalizeHeroSystem() {
    var filename = getCurrentFilename();
    var configs = {
      'about.html': ['.about-hero', '.about-hero-copy'],
      'contact.html': ['.contact-hero', '.contact-hero-copy'],
      'team.html': ['.team-hero', '.team-hero-copy'],
      'services.html': ['.services-hero', '.services-hero-copy'],
      'individual-therapy.html': ['.individual-hero', '.individual-hero-copy'],
      'couples-therapy.html': ['.couples-hero', '.couples-hero-copy'],
      'family-therapy.html': ['.family-hero', '.family-hero-copy'],
      'parent-support.html': ['.parent-hero', '.parent-hero-copy', 'compact'],
      'group-therapy.html': ['.group-hero', '.group-hero-copy', 'compact'],
      'fees-insurance.html': ['.fees-hero', '.fees-hero-copy'],
      'for-clinicians.html': ['.clinicians-hero', '.clinicians-hero-copy'],
      'portal.html': ['.portal-hero', '.portal-hero-copy']
    };

    var config = configs[filename];
    if (!config) return;

    var hero = document.querySelector(config[0]);
    var copy = document.querySelector(config[1]);
    if (!hero || !copy) return;

    hero.classList.add('sb-system-hero', 'sb-overlay-dark-left');
    if (config[2] === 'compact') hero.classList.add('sb-system-hero--compact');
    copy.classList.add('sb-system-hero-copy');

    var rule = hero.querySelector('[class$="-hero-rule"]');
    if (rule) rule.classList.add('sb-system-hero-rule');

    var eyebrow = hero.querySelector('[class$="-kicker"]');
    if (eyebrow) eyebrow.classList.add('sb-system-hero-eyebrow');

    var title = hero.querySelector('h1');
    if (title) title.classList.add('sb-system-hero-title');

    var directParagraphs = Array.prototype.slice.call(copy.children).filter(function (element) {
      return element.tagName === 'P';
    });
    if (directParagraphs.length) directParagraphs[0].classList.add('sb-system-hero-body');

    var actions = copy.querySelector('[class$="-hero-actions"]');
    if (actions) actions.classList.add('sb-system-hero-actions');

    var media = hero.querySelector('[class$="-hero-media"]');
    if (media) media.classList.add('sb-system-hero-media');
  }

  function normalizeContactExperience() {
    var page = document.querySelector('body.contact-page');
    if (!page) return;

    var submitButton = page.querySelector('#submitButton');
    if (submitButton) {
      if (!submitButton.disabled) submitButton.textContent = 'Request Consultation';
      if (window.MutationObserver) {
        var buttonObserver = new MutationObserver(function () {
          if (!submitButton.disabled && submitButton.textContent.trim() === 'Request a Consultation') {
            submitButton.textContent = 'Request Consultation';
          }
        });
        buttonObserver.observe(submitButton, { childList: true, characterData: true, subtree: true });
      }
    }

    var crisisNote = page.querySelector('.contact-before-send .contact-crisis-note');
    var submitArea = page.querySelector('.contact-form-submit');
    if (crisisNote && submitArea) submitArea.insertAdjacentElement('afterend', crisisNote);
  }

  function normalizeImageLoading() {
    var heroSelectors = [
      '.home-hero',
      '.about-hero',
      '.contact-hero',
      '.team-hero',
      '.services-hero',
      '.individual-hero',
      '.couples-hero',
      '.family-hero',
      '.parent-hero',
      '.group-hero',
      '.fees-hero',
      '.clinicians-hero',
      '.portal-hero',
      '.founder-intro'
    ].join(',');

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

  function initFounderPage() {
    var page = document.querySelector('body.sbx-founder-page, body.founder-page');
    if (!page) return;
    var main = page.querySelector('main') || page;

    var summaryBand = main.querySelector('.founder-summary-band');
    if (summaryBand) {
      var approachSummary = findHeading(summaryBand, '.subpage-band-item h2', 'Clinical approach');
      if (approachSummary) {
        var approachItem = approachSummary.closest('.subpage-band-item');
        if (approachItem) approachItem.remove();
      }
      var summaryGrid = summaryBand.querySelector('.subpage-band-grid');
      if (summaryGrid) summaryGrid.classList.add('founder-summary-band--single');
    }

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
          '<div class="therapy-method-intro">',
            '<div class="section-label">Clinical approach</div>',
            '<h2>How Dr. Bryant works.</h2>',
          '</div>',
          '<div>',
            '<div class="therapy-method-list" aria-label="Psychotherapy approaches used by Dr. Bryant">',
              '<article class="therapy-method-row"><div class="therapy-method-number">01</div><div><h3>Relational &amp; psychodynamic</h3><p>Recurring emotional and relationship patterns, identity, defenses, needs, and the therapeutic relationship.</p></div></article>',
              '<article class="therapy-method-row"><div class="therapy-method-number">02</div><div><h3>Evidence-based skills &amp; behavior change</h3><p>CBT, ACT, DBT, and motivational interviewing are integrated when useful for regulation, avoidance, values, coping, and change.</p></div></article>',
              '<article class="therapy-method-row"><div class="therapy-method-number">03</div><div><h3>Trauma, attachment &amp; systems</h3><p>Trauma-informed, attachment-based, and family-systems approaches connect symptoms with safety, development, relationships, and family patterns.</p></div></article>',
            '</div>',
            '<p class="therapy-method-note">These approaches are not applied as a fixed formula. Dr. Bryant develops an individualized formulation and draws from different methods when they support the purpose of therapy.</p>',
          '</div>',
        '</div>'
      ].join('');
    }
  }

  function initProfessionalsPage() {
    var page = document.querySelector('body.clinicians-page');
    if (!page) return;

    var overview = page.querySelector('.clinicians-overview');
    var overviewGrid = overview ? overview.querySelector('.clinicians-overview-grid') : null;
    if (overview && overviewGrid) {
      overview.setAttribute('aria-labelledby', 'professional-services-routing-title');
      if (!overview.querySelector('#professional-services-routing-title')) {
        var routingTitle = document.createElement('h2');
        routingTitle.id = 'professional-services-routing-title';
        routingTitle.className = 'sr-only';
        routingTitle.textContent = 'Professional Services';
        overview.insertBefore(routingTitle, overviewGrid);
      }
      overviewGrid.innerHTML = [
        '<article><a class="professional-route-link" href="#peer-groups"><h2>Peer Consultation Groups</h2><p>Ongoing small-group consultation for clinicians.</p></a></article>',
        '<article><a class="professional-route-link" href="#consultation-supervision"><h2>Individual Consultation &amp; Supervision</h2><p>One-to-one professional consultation around clinical work.</p></a></article>',
        '<article><a class="professional-route-link" href="#writing-review"><h2>Assessment &amp; Professional Writing</h2><p>Consultation on reports, conceptualization, and professional documents.</p></a></article>',
        '<article><a class="professional-route-link" href="#professional-education"><h2>Education &amp; Training</h2><p>Workshops, talks, and educational offerings.</p></a></article>'
      ].join('');
    }

    var redundantIntro = page.querySelector('.clinicians-section-intro');
    if (redundantIntro) redundantIntro.remove();

    var groupSection = page.querySelector('#peer-groups');
    if (groupSection) {
      var groupHeading = groupSection.querySelector('.clinicians-consultation-cta > strong');
      if (groupHeading) {
        var h2 = document.createElement('h2');
        h2.className = 'professional-group-heading';
        h2.textContent = 'Peer Consultation Groups';
        groupHeading.replaceWith(h2);
      }
      var groupIntro = groupSection.querySelector('.clinicians-consultation-cta > p:not(.clinicians-boundary)');
      if (groupIntro) groupIntro.textContent = 'Separate monthly consultation groups are available for practicing clinicians and graduate/doctoral trainees.';
    }

    var categories = {
      'consultation-supervision': 'Individual Consultation & Supervision',
      'writing-review': 'Assessment & Professional Writing',
      'professional-education': 'Education & Training'
    };

    Object.keys(categories).forEach(function (id) {
      var category = page.querySelector('#' + id);
      if (!category) return;
      category.innerHTML = '<h2>' + categories[id] + '</h2>';
    });

    var consultationHeading = findHeading(page, '.clinicians-service-row h3', 'Individual Clinical Consultation');
    if (consultationHeading) {
      consultationHeading.parentElement.innerHTML = '<h3>Individual Clinical Consultation</h3><p>Focused consultation on formulation, diagnosis, treatment planning, risk, ethics, relational dynamics, or complex presentations. Consultation is advisory and does not establish supervision.</p>';
    }

    var supervisionHeading = findHeading(page, '.clinicians-service-row h3', 'External Clinical Supervision');
    if (supervisionHeading) {
      supervisionHeading.parentElement.innerHTML = '<h3>External Clinical Supervision</h3><p>Formal external supervision may be available to eligible counselors and trainees who are not employed by Stonebridge. Supervision is established through a written agreement defining the external role, documentation requirements, responsibilities, and compatibility with the applicable training or licensure pathway.</p>';
    }

    var assessmentHeading = findHeading(page, '.clinicians-service-row h3', 'Psychological assessment report drafting and review');
    if (!assessmentHeading) assessmentHeading = findHeading(page, '.clinicians-service-row h3', 'Assessment reports and clinical writing');
    if (assessmentHeading) {
      assessmentHeading.parentElement.innerHTML = [
        '<h3>Psychological assessment report drafting and review</h3>',
        '<p>Professional writing support for psychologists and assessment practices working from supplied assessment materials.</p>',
        '<ul class="clinicians-service-details">',
          '<li>Drafting or revising reports from supplied assessment materials</li>',
          '<li>Integrating history, findings, formulation, and recommendations</li>',
          '<li>Improving structure, clarity, and coherence before finalization</li>',
        '</ul>',
        '<p class="clinicians-boundary"><strong>Evaluator responsibility:</strong> The requesting evaluator retains responsibility for assessment procedures, data, interpretation, diagnosis, conclusions, signature, and release.</p>'
      ].join('');
    }

    var manuscriptHeading = findHeading(page, '.clinicians-service-row h3', 'Manuscript, article, and dissertation review');
    if (manuscriptHeading) {
      manuscriptHeading.parentElement.innerHTML = '<h3>Manuscript, article, and dissertation review</h3><p>Conceptual and editorial feedback on psychology manuscripts, articles, and dissertations, including argument development, literature integration, methodological coherence, clinical accuracy, and presentation.</p><p class="clinicians-boundary"><strong>Scholarly integrity:</strong> Review provides conceptual and editorial feedback rather than ghostwriting or completion of another person\'s academic work.</p>';
    }

    var educationHeading = findHeading(page, '.clinicians-service-row h3', 'Burnout training, webinars, and continuing education');
    if (!educationHeading) educationHeading = findHeading(page, '.clinicians-service-row h3', 'Workshops, presentations, and educational programs');
    if (educationHeading) {
      educationHeading.parentElement.innerHTML = [
        '<h3>Workshops, presentations, and educational programs</h3>',
        '<p>Education and training may be developed for clinicians, organizations, or professional groups.</p>',
        '<ul class="clinicians-service-details">',
          '<li>Burnout, secondary trauma, and compassion fatigue</li>',
          '<li>Caseloads, boundaries, and sustainable clinical practice</li>',
          '<li>Organizational and supervisory approaches to workforce sustainability</li>',
        '</ul>',
        '<p class="clinicians-boundary"><strong>Continuing education:</strong> CE credit is identified only when an event is offered through an appropriate approved sponsor or qualifying collaboration.</p>'
      ].join('');
    }

    var boundaries = page.querySelector('.clinicians-scope-list');
    if (boundaries) {
      boundaries.innerHTML = [
        '<div class="clinicians-scope-row"><strong>Consultation</strong><p>Consultation is not psychotherapy and does not transfer clinical responsibility. Legal, ethical, and professional responsibility remains with the professional.</p></div>',
        '<div class="clinicians-scope-row"><strong>Supervision</strong><p>A supervisory relationship exists only when it is explicitly established through the appropriate agreement and professional pathway.</p></div>',
        '<div class="clinicians-scope-row"><strong>Documents &amp; review</strong><p>The requesting evaluator or author retains responsibility for final professional judgment, authorship, conclusions, signature, and release. Document consultation does not make Stonebridge the author or evaluator of record.</p></div>'
      ].join('');
    }

    var finalCta = page.querySelector('.clinicians-cta .btn');
    if (finalCta) finalCta.textContent = 'Request a Consultation';
  }

  function initAboutPage() {
    var page = document.querySelector('body.about-page');
    if (!page) return;

    var aboutProse = page.querySelector('.about-prose');
    if (aboutProse) {
      Array.prototype.slice.call(aboutProse.querySelectorAll('p')).forEach(function (paragraph) {
        if ((paragraph.textContent || '').trim().indexOf('Stonebridge is organized around steady communication') === 0) paragraph.remove();
      });
    }

    var structureIntro = page.querySelector('.about-relational-intro');
    if (structureIntro) {
      var structureParagraph = structureIntro.querySelector('p');
      if (structureParagraph) structureParagraph.remove();
    }

    page.querySelectorAll('.about-experience-item').forEach(function (item) {
      var label = item.querySelector('.about-item-label');
      var text = label ? (label.textContent || '').trim() : '';
      if (text.indexOf('A whole-person view') !== -1) {
        item.remove();
      } else if (text.indexOf('A collaborative pace') !== -1 && label) {
        label.textContent = '02 · A collaborative pace';
      }
    });
  }

  function initPortalPage() {
    var page = document.querySelector('body.portal-page');
    if (!page) return;

    var portalMain = page.querySelector('.portal-main');
    if (portalMain) portalMain.remove();

    var layout = page.querySelector('.portal-layout');
    if (layout) layout.classList.add('portal-layout--privacy-only');
  }

  function initFeesPage() {
    var page = document.querySelector('body.fees-page');
    if (!page) return;
  }

  function initTeamPage() {
    var page = document.querySelector('body.team-page:not(.careers-page)');
    if (!page) return;

    var heroHeading = page.querySelector('.team-hero h1');
    if (heroHeading) heroHeading.textContent = 'A practice growing with care.';

    var heroCopy = page.querySelector('.team-hero-copy > p');
    if (heroCopy) {
      heroCopy.textContent = 'Stonebridge is building a thoughtful group of clinicians who share a commitment to relational outpatient care, clinical depth, and clear boundaries.';
    }

    var details = page.querySelector('.clinician-card.featured .clinician-details');
    if (details) {
      var bio = details.querySelector(':scope > p');
      if (bio) bio.textContent = 'Dr. Bryant provides relational psychotherapy for adolescents, adults, couples, and families, along with parent consultation. His work integrates psychodynamic and evidence-based approaches for complex outpatient concerns.';
    }
  }

  function initParentSupportPage() {
    var page = document.querySelector('body.parent-support-page');
    if (!page) return;

    var thoughtfulLabel = Array.prototype.slice.call(page.querySelectorAll('.parent-label')).find(function (label) {
      return (label.textContent || '').trim().toLowerCase() === 'a thoughtful place to begin';
    });
    if (thoughtfulLabel) {
      var standaloneSection = thoughtfulLabel.closest('.parent-section');
      if (standaloneSection) standaloneSection.remove();
    }

    var focusIntro = page.querySelector('.parent-focus-intro');
    if (focusIntro) {
      var focusParagraph = focusIntro.querySelector('p');
      if (focusParagraph) focusParagraph.textContent = 'Parent support considers behavior within its developmental, relational, emotional, and family context.';
    }
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
    addRevisionStyles();
    normalizeCareersNavigation();
    normalizePrivacyFooter();
    normalizeConsultationCtas();
    normalizeTargetedImageAltText();
    normalizeHeroSystem();
    normalizeHeroUtilityStrips();
    normalizeContactExperience();
    initFounderPage();
    initProfessionalsPage();
    initAboutPage();
    initFeesPage();
    initTeamPage();
    initPortalPage();
    initParentSupportPage();
    initCareersPage();
    normalizeImageLoading();
    initMenu();
    initSkipLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
