document.addEventListener("DOMContentLoaded",()=>{
 const preloader=document.getElementById("preloader"),header=document.getElementById("siteHeader"),menu=document.getElementById("menuBtn"),nav=document.getElementById("mainNav");
 const hide=()=>{if(!preloader)return;preloader.classList.add("done");setTimeout(()=>preloader.remove(),350)};
 window.addEventListener("load",hide,{once:true});setTimeout(hide,2200);
 const close=()=>{nav?.classList.remove("open");menu?.classList.remove("open");menu?.setAttribute("aria-expanded","false")};
 menu?.addEventListener("click",()=>{const open=!nav?.classList.contains("open");nav?.classList.toggle("open",open);menu.classList.toggle("open",open);menu.setAttribute("aria-expanded",String(open))});
 document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",close));
 window.addEventListener("scroll",()=>{header?.classList.toggle("scrolled",scrollY>30)}, {passive:true});
 const footer=document.getElementById("secretFooterTrigger"),secret=document.getElementById("secretAccess"),closeSecret=document.getElementById("closeSecret");let taps=0,last=0;
 const tap=()=>{const now=Date.now();if(now-last>2200)taps=0;last=now;taps++;if(taps>=5){secret?.classList.add("show");secret?.setAttribute("aria-hidden","false");taps=0}};
 footer?.addEventListener("click",tap);footer?.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tap()}});closeSecret?.addEventListener("click",()=>{secret.classList.remove("show");secret.setAttribute("aria-hidden","true")});
});

/* SHAURYATECH // FUTURE-TECH MOTION ENGINE */
document.addEventListener('DOMContentLoaded',()=>{const layer=document.querySelector('.lux-particles');if(layer){const n=innerWidth<600?16:30;for(let i=0;i<n;i++){const d=document.createElement('i');d.style.left=Math.random()*100+'%';d.style.top=Math.random()*100+'%';d.style.animationDelay=Math.random()*7+'s';d.style.animationDuration=5+Math.random()*8+'s';layer.appendChild(d)}}const items=document.querySelectorAll('.section-head,.origin-grid,.arena-card,.leadership-feature,.core-card,.operations-grid article,.journey>div,.contact-card,.final-cta');if('IntersectionObserver' in window){const io=new IntersectionObserver((entries,obs)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('lux-visible');obs.unobserve(e.target)}}),{threshold:.08});items.forEach((el,i)=>{el.style.setProperty('--reveal-delay',Math.min(i%6,5)*70+'ms');io.observe(el)})}else items.forEach(el=>el.classList.add('lux-visible'));const hero=document.querySelector('.tech-hero');
if(hero&&matchMedia('(pointer:fine)').matches){
 let raf=0,px=0,py=0;
 hero.addEventListener('pointermove',e=>{
  const r=hero.getBoundingClientRect();
  px=((e.clientX-r.left)/r.width-.5)*18;
  py=((e.clientY-r.top)/r.height-.5)*12;
  if(raf)return;
  raf=requestAnimationFrame(()=>{
   hero.style.setProperty('--mx',px+'px');
   hero.style.setProperty('--my',py+'px');
   raf=0;
  });
 },{passive:true});
 hero.addEventListener('pointerleave',()=>{
  if(raf)cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{
   hero.style.setProperty('--mx','0px');
   hero.style.setProperty('--my','0px');
   raf=0;
  });
 },{passive:true});
}});
