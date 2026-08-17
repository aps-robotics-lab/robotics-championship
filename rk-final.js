
/* =========================================================
   ROBOKRITI 2026 — FINAL INTERACTION FINISH
   No content changes. Lightweight, defensive enhancements.
========================================================= */
(() => {
  'use strict';

  const boot = () => {
    document.documentElement.classList.add('rk-final-ready');

    // Mark images for lazy loading only when they are not critical above-fold assets.
    document.querySelectorAll('img:not([loading])').forEach((img, i) => {
      if (i > 0 && !img.closest('.hero,.site-header')) img.loading = 'lazy';
      img.decoding = img.decoding || 'async';
    });

    // Keep keyboard focus visible after mouse/touch interaction.
    document.addEventListener('pointerdown', () => {
      document.documentElement.classList.add('rk-pointer');
    }, {passive:true, once:true});

    // Close an open mobile navigation with Escape.
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const nav = document.getElementById('mainNav');
      const menu = document.getElementById('menuBtn');
      if (nav?.classList.contains('open')) {
        nav.classList.remove('open');
        menu?.classList.remove('open');
        menu?.setAttribute('aria-expanded','false');
      }
    });

    // Prevent stale "active" hover states on touch devices.
    if (matchMedia('(hover: none)').matches) {
      document.documentElement.classList.add('rk-touch');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else boot();
})();
