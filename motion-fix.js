/* ROBOKRITI // MOTION ENGINE FIX
   Keeps the existing UI/content intact.
   Fixes scroll-reveal, mobile performance, and pointer animation. */
(function () {
  'use strict';

  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    /* Scroll reveal: one observer, with a fallback so content never stays hidden. */
    const revealSelector = [
      '.section-head', '.origin-grid', '.arena-card',
      '.leadership-feature', '.core-card', '.operations-grid article',
      '.journey > div', '.contact-card', '.final-cta'
    ].join(',');

    const revealItems = Array.from(document.querySelectorAll(revealSelector));

    if (revealItems.length) {
      revealItems.forEach((el, index) => {
        el.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 55}ms`);
      });

      const show = (el) => el.classList.add('lux-visible');

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            show(entry.target);
            obs.unobserve(entry.target);
          });
        }, {
          root: null,
          rootMargin: '0px 0px -8% 0px',
          threshold: 0.02
        });

        revealItems.forEach((el) => observer.observe(el));

        // Never leave an element hidden because of a browser/observer edge case.
        window.setTimeout(() => {
          revealItems.forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 1.15) show(el);
          });
        }, 1200);
      } else {
        revealItems.forEach(show);
      }
    }

    /* Lightweight particles. */
    const particleLayer = document.querySelector('.lux-particles');
    if (particleLayer && !particleLayer.children.length) {
      const count = window.matchMedia('(max-width:600px)').matches ? 10 : 22;
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('i');
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.top = `${Math.random() * 100}%`;
        dot.style.animationDelay = `${Math.random() * 6}s`;
        dot.style.animationDuration = `${6 + Math.random() * 6}s`;
        fragment.appendChild(dot);
      }
      particleLayer.appendChild(fragment);
    }

    /* Smooth hero parallax without fighting the browser's layout engine. */
    const hero = document.querySelector('.tech-hero');
    const finePointer = window.matchMedia('(pointer:fine)').matches;

    if (hero && finePointer) {
      let frame = 0;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;

      const animate = () => {
        currentX += (targetX - currentX) * 0.10;
        currentY += (targetY - currentY) * 0.10;
        hero.style.setProperty('--mx', `${currentX.toFixed(2)}px`);
        hero.style.setProperty('--my', `${currentY.toFixed(2)}px`);

        if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
          frame = requestAnimationFrame(animate);
        } else {
          frame = 0;
        }
      };

      hero.addEventListener('pointermove', (event) => {
        const rect = hero.getBoundingClientRect();
        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
        targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
        if (!frame) frame = requestAnimationFrame(animate);
      }, { passive: true });

      hero.addEventListener('pointerleave', () => {
        targetX = 0;
        targetY = 0;
        if (!frame) frame = requestAnimationFrame(animate);
      }, { passive: true });
    }

    /* Smooth header state without triggering layout work. */
    const header = document.getElementById('siteHeader');
    let ticking = false;
    const updateHeader = () => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 30);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateHeader);
      }
    }, { passive: true });
  });
})();
