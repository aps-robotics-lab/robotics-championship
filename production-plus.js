/* APS ShauryaTech 2026 — advanced interaction layer. Content-safe. */
(function(){
  'use strict';
  const init=()=>{
    const body=document.body;
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Scroll progress */
    const progress=document.createElement('div'); progress.id='stProgress'; document.body.appendChild(progress);
    let scrollTick=false;
    const updateProgress=()=>{
      const max=document.documentElement.scrollHeight-window.innerHeight;
      progress.style.transform=`scaleX(${max>0?Math.min(1,window.scrollY/max):0})`;
      scrollTick=false;
    };
    window.addEventListener('scroll',()=>{if(!scrollTick){scrollTick=true;requestAnimationFrame(updateProgress)}},{passive:true});
    updateProgress();

    /* Desktop magnetic cursor */
    if(!reduce && matchMedia('(pointer:fine)').matches){
      const cursor=document.createElement('div'); cursor.id='stCursor'; document.body.appendChild(cursor); body.classList.add('st-pointer');
      let x=-50,y=-50,cx=-50,cy=-50,raf=0;
      const move=(e)=>{x=e.clientX;y=e.clientY;if(!raf)raf=requestAnimationFrame(loop)};
      const loop=()=>{cx+=(x-cx)*.18;cy+=(y-cy)*.18;cursor.style.left=cx+'px';cursor.style.top=cy+'px';raf=requestAnimationFrame(loop)};
      window.addEventListener('pointermove',move,{passive:true});
      document.querySelectorAll('a,button,.arena-card,.core-card,.leadership-feature').forEach(el=>{
        el.addEventListener('mouseenter',()=>body.classList.add('st-hover'));
        el.addEventListener('mouseleave',()=>body.classList.remove('st-hover'));
      });
    }

    /* Direction-aware header: hides while scrolling down, returns on upward movement. */
    const header=document.getElementById('siteHeader');
    let lastY=window.scrollY;
    if(header){
      window.addEventListener('scroll',()=>{
        const y=window.scrollY;
        header.classList.toggle('st-hide', y>140 && y>lastY+8);
        if(y<80 || y<lastY-8) header.classList.remove('st-hide');
        lastY=y;
      },{passive:true});
    }

    /* Image resilience/performance without changing markup. */
    document.querySelectorAll('img').forEach(img=>{
      if(!img.hasAttribute('decoding')) img.decoding='async';
      if(!img.hasAttribute('loading') && !img.closest('.hero')) img.loading='lazy';
    });

    /* Add subtle tilt only to desktop cards, bounded to keep text stable. */
    if(!reduce && matchMedia('(pointer:fine)').matches){
      document.querySelectorAll('.arena-card,.core-card,.leadership-feature').forEach(card=>{
        card.addEventListener('pointermove',e=>{
          const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
          card.style.transform=`perspective(900px) rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*2.2).toFixed(2)}deg) translateY(-4px)`;
        });
        card.addEventListener('pointerleave',()=>{card.style.transform='';});
      });
    }

    /* Make external images safer and slightly faster. */
    document.querySelectorAll('a[target="_blank"]').forEach(a=>{
      const rel=(a.getAttribute('rel')||'').split(/\s+/).filter(Boolean);
      if(!rel.includes('noopener')) rel.push('noopener');
      if(!rel.includes('noreferrer')) rel.push('noreferrer');
      a.setAttribute('rel',rel.join(' '));
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
