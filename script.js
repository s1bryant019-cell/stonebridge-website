(function () {
  function initMenu() {
    var toggles = document.querySelectorAll('.mobile-toggle');
    toggles.forEach(function(toggle){
      toggle.addEventListener('click', function () {
        var header = toggle.closest('.site-header') || document.querySelector('.site-header');
        var menuWrap = header ? header.querySelector('.menu-wrap') : document.querySelector('.menu-wrap');
        var menu = header ? header.querySelector('.menu') : document.querySelector('.menu');
        if (menuWrap) menuWrap.classList.toggle('open');
        if (menu) menu.classList.toggle('open');
        if (header) header.classList.toggle('is-open');
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
  } else {
    initMenu();
  }
})();
