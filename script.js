(function () {
  function initMenu() {
    document.querySelectorAll('.mobile-toggle').forEach(function(toggle){
      toggle.addEventListener('click', function () {
        var header = toggle.closest('.site-header') || document.querySelector('.site-header');
        var menuWrap = header ? header.querySelector('.menu-wrap') : document.querySelector('.menu-wrap');
        var menu = header ? header.querySelector('.menu') : document.querySelector('.menu');
        var isOpen = menuWrap ? !menuWrap.classList.contains('open') : false;
        if (menuWrap) menuWrap.classList.toggle('open', isOpen);
        if (menu) menu.classList.toggle('open', isOpen);
        if (header) header.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMenu);
  else initMenu();
})();
