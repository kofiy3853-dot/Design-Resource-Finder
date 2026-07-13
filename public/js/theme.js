(function () {
  'use strict';

  var THEME_KEY = 'theme';
  var DARK_CLASS = 'dark';

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    updateIcons(theme);
  }

  function updateIcons(theme) {
    var icons = document.querySelectorAll('[data-theme-icon]');
    icons.forEach(function (icon) {
      icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    });
  }

  function init() {
    var theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    updateIcons(theme);

    var toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.Theme = { getTheme: getTheme, setTheme: setTheme };
})();
