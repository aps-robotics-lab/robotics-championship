/* ROBOKRITI 2026 // SILKY MOTION CONTROLLER
   No content changes. Native scrolling remains in control; this layer
   adds lightweight visual motion around it. */
(() => {
  'use strict';
  const ready = fn => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, {once:true}) : fn();

  ready(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(pointer:fine)').matches;
    const header = document.querySelector('.site-header');

    /* Progress bar */
    const progress = document.createElement('div');
    progress.className = 'rk-progress';
    document.body.appendChild(progress);

    let ticking = false;
    const updateScrollUI = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const pct = Math.min(100, Math.max(0, scrollY / max * 100));
      progress.style.width = pct + '%';
      if (header) {
        header.classList.toggle('rk-compact', scrollY > 24);
      }
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateScrollUI); }
    }, {passive:true});
    updateScrollUI();

    /* Hide-on-down / reveal-on-up header, only after meaningful movement. */
    if (header && !reduce) {
      let lastY = scrollY;
      let directionTick = false;
      addEventListener('scroll', () => {
        if (directionTick) return;
        directionTick = true;
        requestAnimationFrame(() => {
          const y = scrollY;
          if (y > 130 && y - lastY > 7) header.classList.add('rk-hidden');
          else if (lastY - y > 5 || y < 40) header.classList.remove('rk-hidden');
          lastY = y;
          directionTick = false;
        });
      }, {passive:true});
    }

    /* Silky reveal: one observer, staggered only within a small batch. */
    const revealItems = document.querySelectorAll(
      '.section-head,.origin-grid,.arena-card,.leadership-feature,.team-card,.core-card,.operations-grid article,.journey>div,.contact-card,.final-cta,.mentor-message'
    );
    if (reduce) revealItems.forEach(el => el.classList.add('rk-reveal','rk-visible'));
    else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const siblings = el.parentElement ? [...el.parentElement.children].filter(x => x.matches && x.matches('.rk-reveal')) : [];
          const index = Math.max(0, siblings.indexOf(el));
          el.style.setProperty('--rk-delay', Math.min(index, 5) * 55 + 'ms');
          el.classList.add('rk-reveal');
          requestAnimationFrame(() => el.classList.add('rk-visible'));
          io.unobserve(el);
        });
      }, {rootMargin:'0px 0px -9% 0px', threshold:.04});
      revealItems.forEach(el => io.observe(el));
    } else revealItems.forEach(el => el.classList.add('rk-reveal','rk-visible'));

    /* Hero parallax: tiny movement only, so it stays elegant and stable. */
    if (fine && !reduce) {
      const hero = document.querySelector('.hero');
      const content = document.querySelector('.hero-content');
      const visual = document.querySelector('.hero-visual');
      let px = 0, py = 0, cx = 0, cy = 0, raf = 0;
      const loop = () => {
        cx += (px - cx) * .045;
        cy += (py - cy) * .045;
        if (content) content.style.transform = `translate3d(${cx * -3}px,${cy * -2}px,0)`;
        if (visual) visual.style.transform = `translate3d(${cx * 5}px,${cy * 4}px,0)`;
        raf = requestAnimationFrame(loop);
      };
      const move = e => {
        if (!hero) return;
        const r = hero.getBoundingClientRect();
        px = ((e.clientX - r.left) / r.width - .5);
        py = ((e.clientY - r.top) / r.height - .5);
      };
      hero?.addEventListener('pointermove', move, {passive:true});
      hero?.addEventListener('pointerleave', () => { px = 0; py = 0; }, {passive:true});
      loop();
    }

    /* Keep anchor navigation fully native and silky. */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'});
        history.pushState(null, '', id);
      });
    });

    /* Scrollspy with a stable center band. */
    const navLinks = [...document.querySelectorAll('#mainNav a[href^="#"]')];
    const targets = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && targets.length) {
      const byId = new Map(targets.map(section => [section.id, navLinks.find(a => a.getAttribute('href') === '#' + section.id)]));
      const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          navLinks.forEach(a => a.classList.remove('active'));
          byId.get(entry.target.id)?.classList.add('active');
        });
      }, {rootMargin:'-42% 0px -48% 0px', threshold:0});
      targets.forEach(t => spy.observe(t));
    }
  });
})();
