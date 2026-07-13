(function () {
  var toggle = document.getElementById('mobileMenuToggle');
  var menu = document.getElementById('mobileMenu');
  var sidebarToggle = document.querySelector('[data-sidebar-toggle]');

  function closeMenu() {
    if (menu) menu.style.transform = 'translateX(-100%)';
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    if (menu) menu.style.transform = 'translateX(0)';
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      document.body.classList.toggle('sidebar-open');
    });
  }

  (menu ? menu.querySelectorAll('a') : []).forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', function (e) {
    if (menu && !menu.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });
})();
