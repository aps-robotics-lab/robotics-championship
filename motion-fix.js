/* ROBOKRITI 2026 — SILKY MOTION ENGINE */
(function(){'use strict';
 const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
 ready(()=>{
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Native smooth scrolling + fixed-header offset, without fighting browser momentum scrolling.
  document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{
   const id=link.getAttribute('href'); if(!id||id==='#') return;
   const target=document.querySelector(id); if(!target) return;
   e.preventDefault();
   const y=target.getBoundingClientRect().top+window.scrollY-(document.getElementById('siteHeader')?.offsetHeight||78)-10;
   window.scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'});
   history.replaceState(null,'',id);
   const nav=document.getElementById('mainNav'), btn=document.getElementById('menuBtn');
   if(nav&&nav.classList.contains('open')){nav.classList.remove('open');btn?.setAttribute('aria-expanded','false');}
  }));
  // Reveal only once, never hide content if JS/observer is delayed.
  const selector='.section-head,.origin-grid,.arena-card,.leadership-feature,.core-card,.operations-grid article,.journey > div,.contact-card,.final-cta,.mentor-message';
  const items=[...document.querySelectorAll(selector)]; items.forEach((el,i)=>el.style.setProperty('--reveal-delay',`${Math.min(i%6,5)*55}ms`));
  const show=el=>el.classList.add('lux-visible');
  if(!reduce&&'IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){show(x.target);io.unobserve(x.target)}}),{rootMargin:'0px 0px -10% 0px',threshold:.02});items.forEach(io.observe.bind(io));setTimeout(()=>items.forEach(el=>{if(el.getBoundingClientRect().top<innerHeight*1.2)show(el)}),1000)}else items.forEach(show);
  // Lightweight ambient particles.
  const layer=document.querySelector('.lux-particles');
  if(layer&&!reduce&&!layer.children.length){const n=innerWidth<600?10:24, f=document.createDocumentFragment();for(let i=0;i<n;i++){const d=document.createElement('i');d.style.left=Math.random()*100+'%';d.style.top=Math.random()*100+'%';d.style.animationDelay=Math.random()*7+'s';d.style.animationDuration=6+Math.random()*7+'s';f.appendChild(d)}layer.appendChild(f)}
  // Scroll state, batched in rAF.
  const header=document.getElementById('siteHeader'); let ticking=false;
  const update=()=>{header?.classList.toggle('scrolled',scrollY>30);ticking=false};
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});update();
 });
})();
