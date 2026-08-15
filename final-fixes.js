/* APS Tinkering Lab RoboKriti 2026 — consolidated final interaction layer. */
(() => {
  'use strict';
  const ready = fn => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, {once:true})
    : fn();

  ready(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.getElementById('siteHeader') || document.querySelector('.event-header');
    const headerHeight = () => (header?.offsetHeight || 78) + 10;

    // Single anchor-scroll controller: prevents multiple scripts from fighting over scroll position.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight());
        window.scrollTo({top, behavior: reduce ? 'auto' : 'smooth'});
        history.replaceState(null, '', id);
        const nav = document.getElementById('mainNav');
        const menu = document.getElementById('menuBtn');
        if (nav?.classList.contains('open')) {
          nav.classList.remove('open');
          menu?.classList.remove('open');
          menu?.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // One scroll-progress indicator and one compact/hide header controller.
    if (!reduce) {
      const progress = document.createElement('div');
      progress.className = 'rk-progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progress);
      let ticking = false;
      let lastY = window.scrollY;
      const update = () => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        progress.style.width = `${Math.min(100, Math.max(0, window.scrollY / max * 100))}%`;
        if (header) header.classList.toggle('rk-compact', window.scrollY > 24);
        ticking = false;
      };
      const onScroll = () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
        if (header) {
          const y = window.scrollY;
          if (y > 140 && y - lastY > 8) header.classList.add('rk-hidden');
          else if (y < 80 || lastY - y > 6) header.classList.remove('rk-hidden');
          lastY = y;
        }
      };
      window.addEventListener('scroll', onScroll, {passive:true});
      update();
    }

    // Safe, one-time reveal observer. Content remains visible if JS is unavailable or delayed.
    const reveal = [...document.querySelectorAll('.section-head,.origin-grid,.arena-card,.leadership-feature,.team-card,.core-card,.operations-grid article,.journey>div,.contact-card,.final-cta,.mentor-message,.rule-card,.side-card')];
    if (reduce || !('IntersectionObserver' in window)) {
      reveal.forEach(el => el.classList.add('rk-reveal','rk-visible'));
    } else {
      reveal.forEach((el, i) => {
        el.classList.add('rk-reveal');
        el.style.setProperty('--rk-delay', `${Math.min(i % 6, 5) * 55}ms`);
      });
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('rk-visible');
          observer.unobserve(entry.target);
        });
      }, {rootMargin:'0px 0px -8% 0px', threshold:.03});
      reveal.forEach(el => observer.observe(el));
    }

    // Scrollspy only for actual section links.
    const navLinks = [...document.querySelectorAll('#mainNav a[href^="#"]')];
    const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
      const byId = new Map(sections.map(s => [s.id, navLinks.find(a => a.getAttribute('href') === `#${s.id}`)]));
      const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navLinks.forEach(a => a.classList.remove('active'));
            byId.get(entry.target.id)?.classList.add('active');
          }
        });
      }, {rootMargin:'-40% 0px -52% 0px', threshold:0});
      sections.forEach(s => spy.observe(s));
    }

    // Escape closes the mobile menu.
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

    // Lightweight image resilience.
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('decoding')) img.decoding = 'async';
      if (!img.hasAttribute('loading') && !img.closest('.hero')) img.loading = 'lazy';
    });
    document.querySelectorAll('a[target="_blank"]').forEach(a => {
      const rel = new Set((a.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener'); rel.add('noreferrer'); a.setAttribute('rel', [...rel].join(' '));
    });
  });
})();
