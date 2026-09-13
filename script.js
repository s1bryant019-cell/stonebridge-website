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
      '.clinicians-overview .professional-route-link{display:block;color:inherit;text-decoration:none;border-radius:4px}',
      '.clinicians-overview .professional-route-link:hover h2,.clinicians-overview .professional-route-link:focus-visible h2{text-decoration:underline;text-underline-offset:3px}',
      '.clinicians-overview .professional-route-link:focus-visible{outline:3px solid #163b61;outline-offset:5px}',
      '.clinicians-page #peer-groups,.clinicians-page #consultation-supervision,.clinicians-page #writing-review,.clinicians-page #professional-education,.clinicians-page #professional-fees{scroll-margin-top:104px}',
      '.clinicians-page .clinicians-service-category h2{margin:0;color:var(--clinicians-gold);font-family:"Inter",sans-serif;font-size:.7rem;font-weight:800;letter-spacing:.13em;line-height:1.4;text-transform:uppercase}',
      '.clinicians-page .professional-group-heading{margin:0 0 8px;color:var(--clinicians-ink);font-family:"EB Garamond",Georgia,serif;font-size:1.65rem;line-height:1.08;letter-spacing:-.02em}',
      '.sbx-founder-page .founder-summary-band .subpage-band-grid.founder-summary-band--single,.founder-page .founder-summary-band .subpage-band-grid.founder-summary-band--single{grid-template-columns:1fr!important}',
      '.sbx-founder-page .focus-compact-grid.founder-focus-compressed,.founder-page .focus-compact-grid.founder-focus-compressed{grid-template-columns:repeat(2,minmax(0,1fr))!important}',
      '.about-page .about-overview-grid.about-overview-grid--two{grid-template-columns:repeat(2,minmax(0,1fr))}',
      '.portal-page .portal-layout.portal-layout--privacy-only{grid-template-columns:minmax(0,760px);justify-content:start}',
      '.team-page .team-overview-grid.team-overview-grid--single{grid-template-columns:1fr}',
      '@media(max-width:720px){.sbx-founder-page .focus-compact-grid.founder-focus-compressed,.founder-page .focus-compact-grid.founder-focus-compressed{grid-template-columns:1fr!important}.about-page .about-overview-grid.about-overview-grid--two{grid-template-columns:1fr}.portal-page .portal-layout.portal-layout--privacy-only{grid-template-columns:1fr}}'
    ].join('\n');
    document.head.appendChild(style);
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

    var overviewGrid = page.querySelector('.about-overview-grid');
    if (overviewGrid) {
      var boundaryHeading = findHeading(overviewGrid, 'article h2', 'Boundaries as care');
      if (boundaryHeading) {
        var boundaryArticle = boundaryHeading.closest('article');
        if (boundaryArticle) boundaryArticle.remove();
      }
      overviewGrid.classList.add('about-overview-grid--two');
    }

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
    var overview = page.querySelector('.fees-overview');
    if (overview) overview.remove();
  }

  function initTeamPage() {
    var page = document.querySelector('body.team-page:not(.careers-page)');
    if (!page) return;

    var details = page.querySelector('.clinician-card.featured .clinician-details');
    if (details) {
      var bio = details.querySelector(':scope > p');
      if (bio) bio.textContent = 'Dr. Bryant provides relational psychotherapy for adolescents, adults, couples, and families, along with parent consultation. His work integrates psychodynamic and evidence-based approaches for complex outpatient concerns.';
    }

    var overviewGrid = page.querySelector('.team-overview-grid');
    if (overviewGrid) {
      var smallTeamHeading = findHeading(overviewGrid, 'article h2', 'Small-team model');
      if (smallTeamHeading) {
        var smallTeamArticle = smallTeamHeading.closest('article');
        if (smallTeamArticle) smallTeamArticle.remove();
      }
      overviewGrid.classList.add('team-overview-grid--single');
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
    initFounderPage();
    initProfessionalsPage();
    initAboutPage();
    initFeesPage();
    initTeamPage();
    initPortalPage();
    initParentSupportPage();
    initCareersPage();
    initMenu();
    initSkipLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();