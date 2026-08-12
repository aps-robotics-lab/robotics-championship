
/* SHAURYATECH // SILKY INTERACTION ENGINE */
(() => {
  "use strict";

  const ready = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, {once:true});
    else fn();
  };

  ready(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer:fine)").matches;

    /* Page-ready state: avoids a flash while keeping the existing loader. */
    document.documentElement.classList.add("silk-ready");

    /* Cursor spotlight + card-local spotlight. */
    if (fine && !reduce) {
      const cursor = document.createElement("div");
      cursor.className = "silk-cursor";
      document.body.appendChild(cursor);

      let raf = 0, x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
      const tick = () => {
        x += (tx - x) * .12;
        y += (ty - y) * .12;
        cursor.style.left = x + "px";
        cursor.style.top = y + "px";
        raf = requestAnimationFrame(tick);
      };
      tick();

      addEventListener("pointermove", e => {
        tx = e.clientX; ty = e.clientY;
        cursor.classList.add("visible");
      }, {passive:true});
      addEventListener("pointerleave", () => cursor.classList.remove("visible"));

      document.querySelectorAll(".arena-card,.leadership-feature,.core-card,.operations-grid article,.contact-card").forEach(card => {
        card.addEventListener("pointermove", e => {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--px", ((e.clientX-r.left)/r.width*100).toFixed(1)+"%");
          card.style.setProperty("--py", ((e.clientY-r.top)/r.height*100).toFixed(1)+"%");
        }, {passive:true});
      });
    }

    /* One observer for a calm, staggered entrance. */
    const reveal = document.querySelectorAll(
      ".section-head,.origin-grid,.arena-card,.leadership-feature,.core-card,.operations-grid article,.journey>div,.contact-card,.final-cta"
    );
    if (reduce) {
      reveal.forEach(el => el.classList.add("silk-in"));
    } else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("silk-reveal");
          requestAnimationFrame(() => el.classList.add("silk-in"));
          io.unobserve(el);
        });
      }, {rootMargin:"0px 0px -8% 0px", threshold:.04});
      reveal.forEach((el,i) => {
        el.style.transitionDelay = `${Math.min(i % 6,5)*55}ms`;
        io.observe(el);
      });
    } else reveal.forEach(el => el.classList.add("silk-in"));

    /* Scrollspy for the main navigation. */
    const links = [...document.querySelectorAll('#mainNav a[href^="#"]')];
    const sections = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    if ("IntersectionObserver" in window && sections.length) {
      const map = new Map(sections.map(s => [s.id, links.find(a => a.getAttribute("href")==="#"+s.id)]));
      const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          links.forEach(a => a.classList.remove("active"));
          map.get(entry.target.id)?.classList.add("active");
        });
      }, {rootMargin:"-38% 0px -55% 0px", threshold:0});
      sections.forEach(s => spy.observe(s));
    }

    /* Smooth anchor navigation that respects the compact header. */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener("click", e => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + scrollY - 76;
        scrollTo({top, behavior: reduce ? "auto" : "smooth"});
      });
    });

    /* Tiny magnetic lift for primary actions. */
    if (fine && !reduce) {
      document.querySelectorAll(".btn.primary,.nav-register").forEach(btn => {
        btn.addEventListener("pointermove", e => {
          const r = btn.getBoundingClientRect();
          const dx = (e.clientX - (r.left+r.width/2)) / r.width;
          const dy = (e.clientY - (r.top+r.height/2)) / r.height;
          btn.style.transform = `translate(${dx*5}px,${dy*4}px)`;
        }, {passive:true});
        btn.addEventListener("pointerleave", () => btn.style.transform = "");
      });
    }
  });
})();
