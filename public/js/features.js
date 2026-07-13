(function () {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseFloat(entry.target.style.transitionDelay) || 0;
          setTimeout(() => entry.target.classList.add('active'), delay * 1000 + 100);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  const cards = document.querySelectorAll('.demo-card');
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseFloat(entry.target.style.transitionDelay) || 0;
          setTimeout(() => entry.target.classList.add('active'), delay * 1000 + 200);
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  cards.forEach((c) => cardObserver.observe(c));
})();
