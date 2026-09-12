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

    document.querySelectorAll('.site-footer').forEach(function (footer) {
      var practiceTitle = Array.prototype.slice.call(footer.querySelectorAll('.footer-title')).find(function (title) {
        return (title.textContent || '').trim().toLowerCase() === 'practice';
      });
      if (!practiceTitle) return;

      var links = practiceTitle.parentElement ? practiceTitle.parentElement.querySelector('.footer-links') : null;
      if (!links || links.querySelector('a[href="careers.html"]')) return;

      var careersLink = document.createElement('a');
      careersLink.href = 'careers.html';
      careersLink.textContent = 'Careers';

      var portalLink = links.querySelector('a[href="portal.html"]');
      if (portalLink) links.insertBefore(careersLink, portalLink);
      else links.appendChild(careersLink);
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

  function normalizeImageAltText() {
    document.querySelectorAll('img[alt]').forEach(function (img) {
      var alt = (img.getAttribute('alt') || '').trim();
      var normalized = alt.toLowerCase();
      var src = (img.getAttribute('src') || '').split('/').pop() || '';
      var srcBase = src.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim().toLowerCase();

      if (normalized === 'image' || normalized === 'photo' || normalized === 'picture') {
        img.setAttribute('alt', '');
        return;
      }

      if (normalized.indexOf('photo of ') === 0) {
        img.setAttribute('alt', alt.slice(9).replace(/^./, function (character) { return character.toUpperCase(); }));
        return;
      }

      if (normalized.indexOf('picture of ') === 0) {
        img.setAttribute('alt', alt.slice(11).replace(/^./, function (character) { return character.toUpperCase(); }));
        return;
      }

      if (srcBase && normalized === srcBase) img.setAttribute('alt', '');
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
      '.clinicians-page .professional-topic-list{margin:14px 0 0;padding:0;list-style:none;border-top:1px solid var(--clinicians-line)}',
      '.clinicians-page .professional-topic-list li{position:relative;padding:9px 0 9px 16px;border-bottom:1px solid var(--clinicians-line);color:var(--clinicians-muted);font-family:"Inter",sans-serif;font-size:.89rem;line-height:1.55}',
      '.clinicians-page .professional-topic-list li:before{content:"";position:absolute;left:0;top:1rem;width:6px;height:6px;border-radius:50%;background:#b89661}',
      '.founder-page .founder-focus-compact{scroll-margin-top:100px}',
      '.founder-page .focus-compact-grid.founder-focus-compressed{grid-template-columns:repeat(2,minmax(0,1fr))!important}',
      '.founder-page .founder-approach-compressed{width:min(1080px,calc(100% - 72px));margin:0 auto;max-width:1080px;padding:50px 0}',
      '.founder-page .founder-approach-compressed .section-copy{max-width:820px}',
      '.founder-page .founder-approach-compressed .section-copy h2{margin:10px 0 16px;color:var(--sb-navy);font-family:"EB Garamond",serif;font-size:clamp(2.15rem,3.15vw,3.25rem);line-height:1.02;letter-spacing:-.04em}',
      '.founder-page .founder-approach-compressed .section-copy p{margin:0 0 14px;color:var(--sb-muted);font-family:"Inter",sans-serif;font-size:1rem;line-height:1.72}',
      '.founder-page .founder-books-compressed{padding:50px 0;background:var(--sb-bg-soft);border-top:1px solid var(--sb-line-warm);border-bottom:1px solid var(--sb-line-warm)}',
      '.founder-page .founder-books-compressed .founder-wide-shell{width:min(1080px,calc(100% - 72px));margin:0 auto}',
      '@media(max-width:720px){.founder-page .focus-compact-grid.founder-focus-compressed{grid-template-columns:1fr!important}.founder-page .founder-approach-compressed,.founder-page .founder-books-compressed .founder-wide-shell{width:min(100% - 34px,1080px)}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function findHeading(root, selector, text) {
    return Array.prototype.slice.call(root.querySelectorAll(selector)).find(function (element) {
      return (element.textContent || '').trim().toLowerCase() === text.toLowerCase();
    });
  }

  function initProfessionalsPage() {
    var page = document.querySelector('body.clinicians-page');
    if (!page) return;

    var overview = page.querySelector('.clinicians-overview');
    var overviewGrid = overview ? overview.querySelector('.clinicians-overview-grid') : null;
    if (overview && overviewGrid) {
      overview.setAttribute('aria-labelledby', 'professional-services-routing-title');
      var routingTitle = document.createElement('h2');
      routingTitle.id = 'professional-services-routing-title';
      routingTitle.className = 'sr-only';
      routingTitle.textContent = 'Professional Services';
      overview.insertBefore(routingTitle, overviewGrid);
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
      if (groupIntro) groupIntro.textContent = 'Separate monthly peer-consultation spaces are available for practicing clinicians and for graduate or doctoral mental-health students. Groups emphasize practical discussion of current clinical work in a small-group format.';
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
      var consultationBody = consultationHeading.parentElement;
      consultationHeading.textContent = 'Individual Clinical Consultation';
      consultationBody.innerHTML = '<h3>Individual Clinical Consultation</h3>' +
        '<p>Focused one-to-one consultation for clinicians seeking another perspective on clinical work. Consultation is advisory and does not create a supervisory relationship.</p>' +
        '<ul class="professional-topic-list">' +
        '<li><strong>Case conceptualization &amp; treatment planning</strong></li>' +
        '<li><strong>Relational or clinical complexity</strong></li>' +
        '<li><strong>Professional development &amp; decision-making</strong></li>' +
        '<li><strong>Documentation, boundaries, or systems issues</strong></li>' +
        '</ul>';
    }

    var supervisionHeading = findHeading(page, '.clinicians-service-row h3', 'External Clinical Supervision');
    if (supervisionHeading) {
      var supervisionBody = supervisionHeading.parentElement;
      supervisionBody.innerHTML = '<h3>External Clinical Supervision</h3><p>Formal external supervision may be available to eligible counselors and trainees who are not employed by Stonebridge. Eligibility, scope, responsibilities, documentation, and compatibility with the applicable training or licensure pathway are established before supervision begins.</p>';
    }

    var assessmentHeading = findHeading(page, '.clinicians-service-row h3', 'Psychological assessment report drafting and review');
    if (assessmentHeading) {
      var assessmentBody = assessmentHeading.parentElement;
      assessmentBody.innerHTML = '<h3>Assessment reports and clinical writing</h3>' +
        '<p>Consultation for psychologists and assessment practices on clinical reports, case formulations, and professional documents where organization, clinical reasoning, and communication need refinement.</p>' +
        '<ul class="clinicians-service-details">' +
        '<li>Drafting from supplied assessment materials</li>' +
        '<li>Integrating history, findings, formulation, and recommendations</li>' +
        '<li>Revising structure, clarity, and coherence</li>' +
        '<li>Reviewing a draft before finalization</li>' +
        '</ul>';
    }

    var manuscriptHeading = findHeading(page, '.clinicians-service-row h3', 'Manuscript, article, and dissertation review');
    if (manuscriptHeading) {
      manuscriptHeading.parentElement.innerHTML = '<h3>Manuscript, article, and dissertation review</h3><p>Conceptual and editorial feedback on argument development, literature integration, clinical accuracy, methodological coherence, APA-style presentation, and responses to reviewers or committees.</p>';
    }

    var educationHeading = findHeading(page, '.clinicians-service-row h3', 'Burnout training, webinars, and continuing education');
    if (educationHeading) {
      educationHeading.parentElement.innerHTML = '<h3>Workshops, presentations, and educational programs</h3>' +
        '<p>Education and training may be developed for clinicians, supervisors, treatment programs, organizations, or professional groups.</p>' +
        '<ul class="clinicians-service-details">' +
        '<li>Burnout, secondary trauma, compassion fatigue, and vicarious trauma</li>' +
        '<li>Caseloads, boundaries, and sustainable clinical practice</li>' +
        '<li>Workforce stress in addiction and behavioral-health settings</li>' +
        '<li>Supervisory and organizational approaches to burnout prevention</li>' +
        '</ul>';
    }

    page.querySelectorAll('.clinicians-service-list .clinicians-boundary, #peer-groups .clinicians-boundary').forEach(function (element) {
      element.remove();
    });

    var boundaries = page.querySelector('.clinicians-scope-list');
    if (boundaries) {
      boundaries.innerHTML = [
        '<div class="clinicians-scope-row"><strong>Consultation</strong><p>Consultation is not psychotherapy and does not transfer clinical responsibility. Legal, ethical, and professional responsibility remains with the clinician, and consultation is not emergency response or legal advice.</p></div>',
        '<div class="clinicians-scope-row"><strong>Supervision</strong><p>A supervisory relationship exists only when it is explicitly established. External supervision depends on professional eligibility, role clarity, a written agreement, documentation requirements, and the applicable training or licensure pathway.</p></div>',
        '<div class="clinicians-scope-row"><strong>Documents &amp; review</strong><p>The requesting evaluator or author retains responsibility for assessment procedures, data, interpretation, diagnosis, conclusions, signature, release, and final authorship. Document consultation does not make Stonebridge the evaluator or author of record, and scholarly review is not ghostwriting.</p></div>',
        '<div class="clinicians-scope-row"><strong>Peer groups</strong><p>Groups meet by secure video and clinical material must be appropriately de-identified. The student group is peer consultation, not supervision, and does not replace university, practicum, internship, or site supervision.</p></div>',
        '<div class="clinicians-scope-row"><strong>Education</strong><p>Continuing-education credit is identified only when an event is offered through an appropriate approved sponsor or qualifying collaboration.</p></div>'
      ].join('');
    }

    var finalCta = page.querySelector('.clinicians-cta .btn');
    if (finalCta) finalCta.textContent = 'Request a Consultation';
  }

  function initFounderPage() {
    var main = document.querySelector('main.founder-page');
    if (!main) return;

    var summaryBand = main.querySelector('.founder-summary-band');
    if (summaryBand) summaryBand.remove();

    var focus = main.querySelector('#clinical-focus');
    if (focus) {
      var focusIntro = focus.querySelector('.compact-section-intro p');
      if (focusIntro) focusIntro.textContent = 'Primary areas of Dr. Bryant’s clinical work include:';

      var focusGrid = focus.querySelector('.focus-compact-grid');
      if (focusGrid) {
        focusGrid.classList.add('founder-focus-compressed');
        focusGrid.setAttribute('aria-label', 'Clinical focus');
        focusGrid.innerHTML = [
          '<article><span>01</span><h3>Addiction and co-occurring concerns</h3><p>Substance use, relapse and recovery patterns, ambivalence, process addictions, shame, coping cycles, and dual-diagnosis concerns.</p></article>',
          '<article><span>02</span><h3>Trauma, PTSD, and complex stress</h3><p>Threat responses, dissociation, safety, emotional regulation, body-based distress, self-worth, and protective patterns.</p></article>',
          '<article><span>03</span><h3>Mood, anxiety, and emotional regulation</h3><p>Depression, panic, overthinking, irritability, shutdown, mood instability, avoidance, and difficulty feeling steady.</p></article>',
          '<article><span>04</span><h3>Relationships, couples, and family concerns</h3><p>Relationship patterns, attachment, family stress, conflict, closeness, and recurring interpersonal concerns.</p></article>',
          '<article><span>05</span><h3>Identity, grief, and life transitions</h3><p>Identity and self-worth, grief, changing roles, and significant life transitions.</p></article>',
          '<article><span>06</span><h3>Neurodevelopmental concerns and parent support</h3><p>Neurodevelopmental concerns, family context, and parent support when these are part of the clinical picture.</p></article>'
        ].join('');
      }

      var broaderCare = focus.querySelector('.broader-care-compact');
      if (broaderCare) broaderCare.remove();
    }

    var approach = main.querySelector('#therapy-style');
    if (approach) {
      approach.className = 'founder-therapy-combined';
      approach.innerHTML = '<div class="founder-approach-compressed">' +
        '<div class="section-label">Clinical approach</div>' +
        '<div class="section-copy">' +
        '<h2>How Dr. Bryant works.</h2>' +
        '<p>Dr. Bryant’s work is psychodynamic and relational at the foundation, with attention to recurring patterns, relationships, meaning, and the ways earlier experiences can shape present-day distress.</p>' +
        '<p>He integrates practical, evidence-based methods—including CBT, ACT, DBT, motivational interviewing, trauma-informed, attachment-based, and family-systems approaches—according to the client’s concerns and treatment goals. Treatment is collaborative and individualized rather than organized around a fixed formula.</p>' +
        '</div></div>';
    }

    var background = main.querySelector('#background');
    if (background) {
      var backgroundHeading = background.querySelector('.credibility-heading h2');
      if (backgroundHeading) backgroundHeading.textContent = 'Clinical experience and credentials.';

      var credentialsList = background.querySelector('.selected-credentials-column ul');
      if (credentialsList && !credentialsList.querySelector('[data-founder-role]')) {
        var role = document.createElement('li');
        role.setAttribute('data-founder-role', 'true');
        role.innerHTML = '<strong>Founder</strong><span>Stonebridge Psychological Group</span>';
        credentialsList.insertBefore(role, credentialsList.firstChild);
      }

      var pathway = background.querySelector('.founder-professional-pathway');
      if (pathway) pathway.remove();

      var publications = background.querySelector('#publications');
      if (publications) {
        var publicationsSection = document.createElement('section');
        publicationsSection.className = 'founder-books-compressed';
        publicationsSection.id = 'books-writing';
        var publicationsShell = document.createElement('div');
        publicationsShell.className = 'founder-wide-shell';
        publications.parentElement.removeChild(publications);
        publicationsShell.appendChild(publications);
        publicationsSection.appendChild(publicationsShell);
        background.insertAdjacentElement('afterend', publicationsSection);
      }
    }
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
    normalizeConsultationCtas();
    normalizeImageAltText();
    initProfessionalsPage();
    initFounderPage();
    initMenu();
    initSkipLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
