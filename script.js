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
    initMenu();
    initSkipLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
