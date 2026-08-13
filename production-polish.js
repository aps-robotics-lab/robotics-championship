/* APS ShauryaTech 2026 — lightweight UX polish. No content changes. */
(() => {
  const init = () => {
    const header = document.querySelector('.site-header');
    if (header) {
      let ticking = false;
      const update = () => {
        header.classList.toggle('scrolled', window.scrollY > 24);
        ticking = false;
      };
      window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
      }, { passive: true });
      update();
    }

    // Add a subtle active-nav state based on the visible section.
    const links = [...document.querySelectorAll('#mainNav a[href^="#"]')];
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && links.length && sections.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const link = document.querySelector(`#mainNav a[href="#${entry.target.id}"]`);
          if (!link) return;
          links.forEach(item => item.classList.remove('active'));
          link.classList.add('active');
        });
      }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
      sections.forEach(section => observer.observe(section));
    }

    // Smoothly close mobile navigation after Escape.
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const nav = document.getElementById('mainNav');
      const menu = document.getElementById('menuBtn');
      if (nav?.classList.contains('open')) {
        nav.classList.remove('open');
        menu?.classList.remove('open');
        menu?.setAttribute('aria-expanded', 'false');
      }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
