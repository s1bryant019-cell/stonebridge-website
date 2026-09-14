(function () {
  var VERSION = '20260914j';

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
      '      <img class="sb-header-logo" src="stonebridge-header-logo.png?v=' + VERSION + '" alt="Stonebridge Psychological Group" width="640" height="128" fetchpriority="high" decoding="async">',
      '    </a>',
      '    <button class="mobile-toggle" type="button" aria-label="Open main menu" aria-expanded="false">Menu</button>',
      '    <div class="menu-wrap">',
      '      <nav class="menu" aria-label="Primary navigation">',
      navLink('about.html','About','about',active),
      navLink('team.html','Team','team',active),
      navLink('services.html','Services','services',active),
      navLink('fees-insurance.html','Fees &amp; Insurance','fees',active),
      navLink('for-clinicians.html','Professionals','professionals',active),
      navLink('portal.html','Portal','portal',active),
      '      </nav>',
      '      <div class="header-cta"><a class="btn btn-primary" href="contact.html#inquiry-form">Request a Consultation</a></div>',
      '    </div>',
      '  </div>',
      '</header>'
    ].join('');
  }

  function removeDuplicateConsultationNav(header) {
    if (!header) return;
    header.querySelectorAll('.menu > a[href^="contact.html"]').forEach(function (link) {
      link.remove();
    });
  }

  function normalizeHeader() {
    var existing = document.querySelector('.site-header, .home-site-header');
    if (!existing) return;

    if (existing.classList.contains('sb-global-header')) {
      removeDuplicateConsultationNav(existing);
      return;
    }

    var wrapper = document.createElement('div');
    wrapper.innerHTML = canonicalHeader();
    var replacement = wrapper.firstElementChild;
    removeDuplicateConsultationNav(replacement);
    existing.replaceWith(replacement);
  }

  function ensureStylesheet(id, href) {
    var link = document.getElementById(id);
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    } else if (href) {
      link.href = href;
    }
    return link;
  }

  function forceImage(img, src, alt) {
    if (!img) return;
    var picture = img.closest('picture');
    if (picture) {
      picture.querySelectorAll('source').forEach(function (source) { source.remove(); });
    }
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.setAttribute('src', src);
    if (typeof alt === 'string') img.setAttribute('alt', alt);
  }

  function normalizeFounderImages() {
    var headshotSrc = 'dr-stephen-bryant-headshot.png?v=' + VERSION;
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

  function setHeroImage(selector, src, alt) {
    var img = document.querySelector(selector + ' img');
    if (!img) return;
    forceImage(img, src + '?v=' + VERSION, alt);
  }

  function setCardImage(href, src) {
    var card = document.querySelector('.home-service-card[href="' + href + '"]');
    if (!card) return;
    forceImage(card.querySelector('img'), src + '?v=' + VERSION, '');
  }

  function refineHomepage() {
    var copy = document.querySelector('.home-hero-copy');
    var lede = document.querySelector('.home-hero-lede');
    var cta = copy ? copy.querySelector('.home-primary-btn') : null;
    var ctaWrap = cta ? cta.parentElement : null;
    if (copy && lede && ctaWrap) {
      ctaWrap.classList.add('home-hero-cta-wrap');
      copy.insertBefore(ctaWrap, lede);
    }

    setCardImage('individual-therapy.html#adult-therapy', 'hero-portal-workspace-960.webp');
    setCardImage('individual-therapy.html#adolescent-therapy', 'profile-nature-hero.jpg');
    setCardImage('couples-therapy.html', 'home-bridge-v11.jpg');
    setCardImage('family-therapy.html', 'team-nature-hero.jpg');
    setCardImage('parent-support.html', 'hero-contact-desk-960.webp');
  }

  function refineGroupTherapy() {
    setHeroImage(
      '.group-hero-media',
      'teen-cooperative-group-participant-1600.webp',
      'Adolescent wearing headphones at a desk with cooperative gameplay visible on a monitor'
    );

    var lobbyPhoto = document.querySelector('#groups-forming .lobby-showcase-photo img');
    if (lobbyPhoto) {
      forceImage(
        lobbyPhoto,
        'teen-cooperative-group-desk-1600.webp?v=' + VERSION,
        'Cooperative farming gameplay displayed on a desk during The Lobby group activity'
      );
    }

    var hero = document.querySelector('.group-hero');
    var lobby = document.getElementById('groups-forming');
    if (hero && lobby) {
      var anchor = hero.nextElementSibling && hero.nextElementSibling.classList.contains('hero-utility-strip')
        ? hero.nextElementSibling
        : hero;
      anchor.insertAdjacentElement('afterend', lobby);
    }
  }

  function refineParentSupport() {
    setHeroImage(
      '.parent-hero-media',
      'hero-contact-desk-1600.webp',
      'Quiet workspace prepared for an online consultation'
    );

    var process = document.querySelector('.parent-process');
    if (process) {
      process.innerHTML = [
        '<div class="parent-process-heading">',
        '  <h2>What to expect</h2>',
        '</div>',
        '<div class="parent-process-summary">',
        '  <p>Early work focuses on understanding the concern within the family’s relationships, development, stressors, and strengths. From there, support may include communication planning, behavioral structure, emotional-regulation strategies, and adjustments as the family’s needs change.</p>',
        '</div>'
      ].join('');
    }
  }

  function refineCouplesTherapy() {
    setHeroImage('.couples-hero-media', 'home-bridge-v11.jpg', '');
  }

  function refineFamilyTherapy() {
    setHeroImage('.family-hero-media', 'team-nature-hero.jpg', '');

    var principles = document.querySelector('.family-principles');
    if (principles) {
      principles.innerHTML = [
        '<article class="family-principle">',
        '  <div class="family-principle-label">Pattern</div>',
        '  <div class="family-principle-copy">',
        '    <h3>See the family pattern.</h3>',
        '    <p>Map recurring interactions, make room for each person’s perspective, and clarify the roles and boundaries that shape the family system. The work holds support, privacy, development, safety, and individual accountability together rather than treating one person as the entire problem.</p>',
        '  </div>',
        '</article>',
        '<article class="family-principle">',
        '  <div class="family-principle-label">Response</div>',
        '  <div class="family-principle-copy">',
        '    <h3>Practice a different response.</h3>',
        '    <p>Translate insight into clearer communication, more predictable limits, greater accountability, and repair when familiar patterns return. The aim is not perfect agreement, but a family that can respond with more intention when stress, conflict, or old roles reappear.</p>',
        '  </div>',
        '</article>'
      ].join('');
    }
  }

  function refineIndividualTherapy() {
    setHeroImage(
      '.individual-hero-media',
      'hero-portal-workspace-1600.webp',
      'Quiet workspace prepared for a telehealth psychotherapy session'
    );

    var overview = document.querySelector('.individual-overview-grid');
    if (overview) {
      overview.classList.add('individual-overview-grid--telehealth');
      overview.innerHTML = [
        '<article>',
        '  <h2>Illinois telehealth</h2>',
        '  <p>Secure online sessions for adults and adolescents who are located in Illinois.</p>',
        '</article>'
      ].join('');
    }

    document.querySelectorAll('.individual-section').forEach(function (section) {
      var label = section.querySelector('.individual-label');
      if (label && label.textContent.trim() === 'A treatment frame shaped around the person') {
        section.remove();
      }
    });
  }

  function refineServices() {
    setHeroImage('.services-hero-media', 'about-arch-v11.jpg', '');
  }

  function refineContact() {
    var intro = document.querySelector('.contact-intro');
    if (intro) {
      intro.classList.add('contact-intro--condensed');
      intro.innerHTML = [
        '<h2>A clear first step.</h2>',
        '<p>Share enough for Stonebridge to understand what you are looking for and how to reach you. If care moves forward, detailed clinical information can be handled through the appropriate secure process. Submitting this form does not schedule an appointment.</p>'
      ].join('');
    }

    var informationUse = document.querySelector('.contact-information-use');
    if (informationUse) {
      informationUse.innerHTML = [
        '<strong>Keep clinical details brief. Please do not submit records or detailed clinical history through this form.</strong>',
        '<p><a href="privacy-information.html">Privacy &amp; Information Use</a></p>'
      ].join('');
    }

    var briefReasonHelp = document.getElementById('brief-reason-help');
    if (briefReasonHelp) briefReasonHelp.textContent = 'A few sentences is enough.';

    var beforeSend = document.querySelector('.contact-before-send-copy');
    if (beforeSend) {
      beforeSend.innerHTML = '<p>Stonebridge typically reviews consultation requests within 1–2 business days.</p>';
    }

    var submitNote = document.querySelector('.contact-submit-note');
    if (submitNote) submitNote.remove();

    var dob = document.getElementById('date-of-birth');
    if (dob) {
      dob.required = false;
      dob.removeAttribute('required');
      var dobField = dob.closest('.contact-field');
      if (dobField) dobField.remove();
    }
  }

  function refineFounder() {
    var summaryBand = document.querySelector('.founder-summary-band');
    if (summaryBand) {
      summaryBand.querySelectorAll('.subpage-band-item').forEach(function (item) {
        var heading = item.querySelector('h2');
        if (heading && heading.textContent.trim() === 'Clinical approach') item.remove();
      });
      summaryBand.classList.add('is-condensed');
    }

    var methodList = document.querySelector('.therapy-method-list');
    if (methodList) {
      methodList.innerHTML = [
        '<article class="therapy-method-row">',
        '  <div class="therapy-method-number">01</div>',
        '  <div>',
        '    <h3>Psychodynamic and relational</h3>',
        '    <p>Work focuses on recurring emotional and relationship patterns, defenses, identity, self-worth, and the ways earlier experiences continue to shape present life. The therapeutic relationship can also make patterns more visible in real time, creating a place to understand them with greater clarity and develop more flexible ways of responding.</p>',
        '  </div>',
        '</article>',
        '<article class="therapy-method-row">',
        '  <div class="therapy-method-number">02</div>',
        '  <div>',
        '    <h3>Evidence-based and skills-focused methods</h3>',
        '    <p>When useful, Dr. Bryant integrates cognitive, behavioral, acceptance-based, emotion-regulation, and motivational methods to support practical change. This may include examining avoidance and behavior patterns, clarifying values, building distress-tolerance or interpersonal skills, and exploring ambivalence about change without relying on confrontation or applying techniques simply because they fit a diagnostic label.</p>',
        '  </div>',
        '</article>',
        '<article class="therapy-method-row">',
        '  <div class="therapy-method-number">03</div>',
        '  <div>',
        '    <h3>Trauma, attachment, and systems</h3>',
        '    <p>Trauma-informed, attachment-based, and family-systems perspectives help connect symptoms with safety, protective responses, development, relationships, and family patterns. These lenses can guide pacing, attention to trust and regulation, and decisions about when parent or family involvement may support the work without reducing the individual to a single symptom or role.</p>',
        '  </div>',
        '</article>',
        '<p class="therapy-method-note">These approaches are not applied as a fixed formula. Dr. Bryant develops an individualized formulation and draws from different methods when they support the purpose of therapy.</p>'
      ].join('');
    }
  }

  function refineProfessionals() {
    var overview = document.querySelector('.clinicians-overview-grid');
    if (overview) {
      overview.classList.add('refined-professional-nav');
      overview.innerHTML = [
        '<a href="#peer-groups">Peer Groups</a>',
        '<a href="#consultation-supervision">Consultation &amp; Supervision</a>',
        '<a href="#writing-review">Writing &amp; Review</a>',
        '<a href="#professional-education">Training &amp; Education</a>'
      ].join('');
    }

    document.querySelectorAll('.clinicians-boundary').forEach(function (note) {
      if (note.textContent.indexOf('Evaluator responsibility:') !== -1) note.remove();
    });

    var scopeCopy = document.querySelector('.clinicians-scope-copy');
    if (scopeCopy) {
      var scopeIntro = scopeCopy.querySelector('p');
      if (scopeIntro) scopeIntro.remove();
    }

    var scopeList = document.querySelector('.clinicians-scope-list');
    if (scopeList) {
      scopeList.innerHTML = [
        '<div class="clinicians-scope-row">',
        '  <strong>Consultation</strong>',
        '  <p>Clinical responsibility remains with the treating professional.</p>',
        '</div>',
        '<div class="clinicians-scope-row">',
        '  <strong>Supervision</strong>',
        '  <p>A supervisory relationship exists only when formally established through the appropriate written agreement and professional pathway.</p>',
        '</div>',
        '<div class="clinicians-scope-row">',
        '  <strong>Writing &amp; review</strong>',
        '  <p>The requesting professional retains responsibility for final judgment, authorship, conclusions, signature, and release.</p>',
        '</div>'
      ].join('');
    }
  }

  function applyTargetedRefinements() {
    var page = pageName();
    if (page === 'index.html') refineHomepage();
    else if (page === 'group-therapy.html') refineGroupTherapy();
    else if (page === 'parent-support.html') refineParentSupport();
    else if (page === 'couples-therapy.html') refineCouplesTherapy();
    else if (page === 'family-therapy.html') refineFamilyTherapy();
    else if (page === 'individual-therapy.html') refineIndividualTherapy();
    else if (page === 'services.html') refineServices();
    else if (page === 'contact.html') refineContact();
    else if (page === 'team-founder.html') refineFounder();
    else if (page === 'for-clinicians.html') refineProfessionals();
  }

  function scheduleTargetedRefinements() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyTargetedRefinements, { once: true });
    } else {
      applyTargetedRefinements();
    }
  }

  function loadCore(onReady) {
    var existing = document.getElementById('stonebridge-script-core');
    if (existing) {
      if (typeof onReady === 'function') onReady();
      return;
    }
    var script = document.createElement('script');
    script.id = 'stonebridge-script-core';
    script.src = 'script-core.js?v=' + VERSION;
    script.async = false;
    if (typeof onReady === 'function') {
      script.addEventListener('load', onReady, { once: true });
      script.addEventListener('error', onReady, { once: true });
    }
    document.body.appendChild(script);
  }

  function init() {
    ensureStylesheet('stonebridge-brand-sync', 'stonebridge-brand-sync.css?v=' + VERSION);
    ensureStylesheet('stonebridge-hotfix', 'stonebridge-hotfix.css?v=' + VERSION);
    normalizeHeader();
    normalizeFounderImages();
    loadCore(scheduleTargetedRefinements);
  }

  if (document.body) init();
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();