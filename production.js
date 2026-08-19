/* RoboKriti 2026 — consolidated production interaction engine. */
(() => {
  'use strict';
  const ready = fn => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, {once:true}) : fn();

  ready(() => {
    const root = document.documentElement;
    const body = document.body;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer:fine)').matches;
    root.classList.add('rk-production-ready');

    // Preloader: never trap the user behind a network-dependent event.
    const preloader = document.getElementById('preloader');
    const hideLoader = () => {
      if (!preloader || preloader.dataset.closed) return;
      preloader.dataset.closed = '1';
      preloader.classList.add('done');
      window.setTimeout(() => preloader.remove(), 500);
    };
    window.addEventListener('load', hideLoader, {once:true});
    window.setTimeout(hideLoader, 1800);

    const header = document.getElementById('siteHeader') || document.querySelector('.event-header');
    const nav = document.getElementById('mainNav');
    const menu = document.getElementById('menuBtn');
    const closeMenu = () => {
      nav?.classList.remove('open');
      menu?.classList.remove('open');
      menu?.setAttribute('aria-expanded','false');
      menu?.setAttribute('aria-label','Open menu');
    };
    menu?.addEventListener('click', () => {
      const open = !nav?.classList.contains('open');
      nav?.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    // One scroll pipeline for header state + progress. No competing scroll listeners.
    const progress = document.createElement('div');
    progress.className = 'rk-progress';
    progress.setAttribute('aria-hidden','true');
    body.appendChild(progress);
    let ticking = false, lastY = window.scrollY;
    const updateScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.width = `${Math.min(100, Math.max(0, window.scrollY / max * 100))}%`;
      const y = window.scrollY;
      header?.classList.toggle('scrolled', y > 30);
      header?.classList.toggle('rk-compact', y > 24);
      if (!reduce && header) {
        if (y > 140 && y - lastY > 8) header.classList.add('rk-hidden');
        else if (lastY - y > 5 || y < 45) header.classList.remove('rk-hidden');
      }
      lastY = y;
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); } };
    window.addEventListener('scroll', onScroll, {passive:true});
    updateScroll();

    // Native smooth anchors, with the fixed header accounted for by scroll-margin.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        if (reduce) return;
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
        history.replaceState(null, '', id);
      });
    });

    // One reveal observer. Elements remain visible if JS/IO is unavailable.
    const revealSelector = '.section-head,.origin-grid,.arena-card,.leadership-feature,.team-card,.core-card,.operations-grid article,.journey>div,.contact-card,.final-cta,.mentor-message,.rule-card,.side-card';
    const items = [...document.querySelectorAll(revealSelector)];
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('rk-reveal','rk-visible','silk-in'));
    } else {
      items.forEach((el,i) => {
        el.classList.add('rk-reveal');
        el.style.setProperty('--rk-delay', `${Math.min(i % 6,5) * 55}ms`);
      });
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('rk-visible','silk-reveal');
          requestAnimationFrame(() => entry.target.classList.add('silk-in'));
          io.unobserve(entry.target);
        });
      }, {rootMargin:'0px 0px -9% 0px', threshold:.035});
      items.forEach(el => io.observe(el));
    }

    // Scrollspy only where a main navigation exists.
    const links = [...document.querySelectorAll('#mainNav a[href^="#"]')];
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && links.length && sections.length) {
      const map = new Map(sections.map(s => [s.id, links.find(a => a.getAttribute('href') === `#${s.id}`)]));
      const spy = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => a.classList.remove('active'));
        map.get(entry.target.id)?.classList.add('active');
      }), {rootMargin:'-42% 0px -48% 0px', threshold:0});
      sections.forEach(s => spy.observe(s));
    }

    // Generate the existing hero particle field once.
    const particleLayer = document.querySelector('.lux-particles');
    if (particleLayer && !reduce && !particleLayer.children.length) {
      const count = window.innerWidth < 600 ? 10 : 22;
      const fragment = document.createDocumentFragment();
      for (let i=0;i<count;i++) {
        const dot = document.createElement('i');
        dot.style.left = `${Math.random()*100}%`;
        dot.style.top = `${Math.random()*100}%`;
        dot.style.animationDelay = `${Math.random()*7}s`;
        dot.style.animationDuration = `${6 + Math.random()*6}s`;
        fragment.appendChild(dot);
      }
      particleLayer.appendChild(fragment);
    }

    // Desktop-only pointer treatment. No permanent RAF loop: motion is event-driven.
    if (fine && !reduce) {
      const cursor = document.createElement('div');
      cursor.className = 'silk-cursor';
      body.appendChild(cursor);
      let cx = innerWidth/2, cy = innerHeight/2, tx = cx, ty = cy, raf = 0;
      const moveCursor = () => {
        raf = 0;
        cx += (tx-cx)*.18; cy += (ty-cy)*.18;
        cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
        if (Math.abs(tx-cx)+Math.abs(ty-cy) > .2) raf = requestAnimationFrame(moveCursor);
      };
      window.addEventListener('pointermove', e => {
        tx=e.clientX; ty=e.clientY; cursor.classList.add('visible');
        if (!raf) raf=requestAnimationFrame(moveCursor);
      }, {passive:true});
      window.addEventListener('blur', () => cursor.classList.remove('visible'));

      // Small card-local spotlight; no 3D tilt to keep touch/scroll performance stable.
      document.querySelectorAll('.arena-card,.leadership-feature,.core-card,.operations-grid article,.contact-card').forEach(card => {
        card.addEventListener('pointermove', e => {
          const r=card.getBoundingClientRect();
          card.style.setProperty('--px', `${((e.clientX-r.left)/r.width*100).toFixed(1)}%`);
          card.style.setProperty('--py', `${((e.clientY-r.top)/r.height*100).toFixed(1)}%`);
        }, {passive:true});
      });

      document.querySelectorAll('.btn.primary,.nav-register').forEach(btn => {
        btn.addEventListener('pointermove', e => {
          const r=btn.getBoundingClientRect();
          const dx=(e.clientX-(r.left+r.width/2))/r.width;
          const dy=(e.clientY-(r.top+r.height/2))/r.height;
          btn.style.transform=`translate3d(${dx*4}px,${dy*3}px,0)`;
        }, {passive:true});
        btn.addEventListener('pointerleave', () => btn.style.transform='');
      });

      // Tiny hero parallax, capped and event-driven.
      const hero=document.querySelector('.hero'), visual=document.querySelector('.hero-visual');
      let hx=0,hy=0,hraf=0;
      if(hero && visual){
        hero.addEventListener('pointermove', e => {
          const r=hero.getBoundingClientRect(); hx=((e.clientX-r.left)/r.width-.5); hy=((e.clientY-r.top)/r.height-.5);
          if(!hraf) hraf=requestAnimationFrame(()=>{visual.style.transform=`translate3d(${hx*10}px,${hy*8}px,0)`;hraf=0;});
        }, {passive:true});
        hero.addEventListener('pointerleave',()=>visual.style.transform='');
      }
    }

    // Image and external-link resilience.
    document.querySelectorAll('img').forEach((img,i) => {
      if (!img.hasAttribute('decoding')) img.decoding='async';
      if (!img.hasAttribute('loading') && i>0 && !img.closest('.hero,.site-header')) img.loading='lazy';
    });
    document.querySelectorAll('a[target="_blank"]').forEach(a => {
      const rel=new Set((a.getAttribute('rel')||'').split(/\s+/).filter(Boolean));
      rel.add('noopener'); rel.add('noreferrer'); a.setAttribute('rel',[...rel].join(' '));
    });

    // Preserve the existing five-tap secret footer flow when present.
    const secretTrigger=document.getElementById('secretFooterTrigger');
    const secret=document.getElementById('secretAccess');
    const closeSecret=document.getElementById('closeSecret');
    let taps=0,lastTap=0;
    const tap=()=>{const now=Date.now(); if(now-lastTap>2200)taps=0; lastTap=now; if(++taps>=5){secret?.classList.add('show');secret?.setAttribute('aria-hidden','false');taps=0;}};
    secretTrigger?.addEventListener('click',tap);
    secretTrigger?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tap();}});
    closeSecret?.addEventListener('click',()=>{secret?.classList.remove('show');secret?.setAttribute('aria-hidden','true');});
  });
})();
