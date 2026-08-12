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
