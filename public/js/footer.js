const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('active');
  });
}, observerOptions);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
function updateNavBg() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const isScrolled = window.scrollY > 50;
  const theme = document.documentElement.getAttribute('data-theme');
  nav.style.background = isScrolled
    ? theme === 'light'
      ? 'rgba(254,251,255,0.95)'
      : 'rgba(19,19,19,0.95)'
    : theme === 'light'
      ? 'rgba(254,251,255,0.8)'
      : 'rgba(19,19,19,0.8)';
  nav.style.backdropFilter = 'blur(20px)';
  nav.classList.toggle('shadow-lg', isScrolled);
}
window.addEventListener('scroll', updateNavBg);
const _to = document.getElementById('themeToggle');
if (_to) {
  _to.addEventListener('click', function () {
    setTimeout(updateNavBg, 50);
  });
}
