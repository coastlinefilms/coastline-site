/**
 * Home "Now showing" work section (Nov 2026): a cover flow carousel of published
 * projects. Featured projects first (by Sort Order), then the rest newest first.
 * The active card plays its hover clip on hover; side cards bring themselves forward.
 */
import type { Project } from '@/lib/types'

const esc = (s: string | null | undefined) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const ARROW =
  '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const CHEV = (d: string) =>
  `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

/** The home carousel shows the projects marked Featured in the CMS, by Sort Order. */
export function coverflowOrder(projects: Project[]) {
  const featured = projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.sort_order ?? 1e9) - (b.sort_order ?? 1e9) || a.created_at.localeCompare(b.created_at))
  return featured.length ? featured : [...projects].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

const STYLE = `<style>
.cf-flow{padding:112px 64px;background:#121413;color:#E4DDCB;font-family:Neuemontreal,"Neue Montreal",-apple-system,sans-serif;overflow:hidden}
.cf-flow *{box-sizing:border-box}
.cf-flow__head{max-width:1312px;margin:0 auto;display:flex;justify-content:space-between;align-items:flex-end;gap:32px}
.cf-flow__h{margin:0;font-size:64px;line-height:1.05;font-weight:400;letter-spacing:-.02em;color:#E4DDCB}
.cf-flow__h strong{font-weight:700;color:#FFFFFF}
.cf-flow__all{display:inline-flex;align-items:center;gap:10px;padding:14px 24px;border-radius:999px;border:1.5px solid #E4DDCB;color:#E4DDCB;font-size:15px;font-weight:500;text-decoration:none;white-space:nowrap;transition:background-color .3s ease,color .3s ease}
.cf-flow__foot{display:flex;justify-content:center;margin-top:32px}
.cf-flow__all:hover{background:#E4DDCB;color:#121413}
.cf-flow__stage{position:relative;height:420px;margin:0 auto;max-width:1312px;perspective:1400px;touch-action:pan-y;outline:none}
.cf-flow__card{position:absolute;left:50%;top:10px;width:640px;height:400px;margin-left:-320px;border-radius:18px;overflow:hidden;background:#1c1e1d;display:block;text-decoration:none;color:#FFFFFF;box-shadow:0 40px 80px rgba(0,0,0,.5);
  transition:transform .7s cubic-bezier(.22,.61,.36,1),opacity .7s cubic-bezier(.22,.61,.36,1);will-change:transform;-webkit-tap-highlight-color:transparent;-webkit-user-drag:none;user-select:none}
.cf-flow__card img,.cf-flow__card video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.cf-flow__card video{opacity:0;transition:opacity .5s ease}
.cf-flow__card.is-playing video{opacity:1}
.cf-flow__shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,20,19,0) 45%,rgba(18,20,19,.8) 100%);pointer-events:none}
.cf-flow__meta{position:absolute;left:24px;right:24px;bottom:22px;display:flex;align-items:center;gap:14px;opacity:0;transform:translateY(8px);transition:opacity .45s ease,transform .45s cubic-bezier(.22,.61,.36,1)}
.cf-flow__card.is-active .cf-flow__meta{opacity:1;transform:none;transition-delay:.15s}
.cf-flow__client{font-size:14px;line-height:1.4;color:rgba(228,221,203,.75);margin-bottom:6px}
.cf-flow__logo{position:static!important;inset:auto!important;width:auto!important;height:22px!important;max-width:110px;object-fit:contain!important;filter:brightness(0) invert(1);flex:none}
.cf-flow__name{font-size:15px;line-height:1.3;font-weight:500;color:#FFFFFF;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cf-flow__type{font-size:14px;color:rgba(228,221,203,.75);white-space:nowrap}
.cf-flow__card:focus-visible{outline:2px solid #E4DDCB;outline-offset:4px}
.cf-flow__nav{display:flex;justify-content:center;align-items:center;gap:24px;margin-top:40px}
.cf-flow__btn{width:48px;height:48px;border-radius:50%;border:1.5px solid rgba(228,221,203,.5);background:none;color:#E4DDCB;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color .3s ease,background-color .3s ease,color .3s ease}
.cf-flow__btn:hover{background:#E4DDCB;border-color:#E4DDCB;color:#121413}
.cf-flow__btn:focus-visible{outline:2px solid #E4DDCB;outline-offset:3px}
.cf-flow__dots{display:flex;gap:8px;align-items:center}
.cf-flow__dot{width:8px;height:8px;padding:0;border:0;border-radius:999px;background:rgba(228,221,203,.3);cursor:pointer;transition:width .4s cubic-bezier(.22,.61,.36,1),background-color .4s ease}
.cf-flow__dot.is-on{width:28px;background:#E4DDCB}
@media(max-width:991px){
  .cf-flow{padding:88px 32px}
  .cf-flow__h{font-size:48px}
  .cf-flow__stage{height:calc(62vw * .625 + 20px)}
  .cf-flow__card{width:62vw;height:calc(62vw * .625);margin-left:-31vw}
}
@media(max-width:600px){
  .cf-flow{padding:72px 24px}
  .cf-flow__head{flex-direction:column;align-items:flex-start;gap:20px}
  .cf-flow__h{font-size:40px}
  .cf-flow__stage{height:calc(80vw * .625 + 20px)}
  .cf-flow__card{width:80vw;height:calc(80vw * .625);margin-left:-40vw;border-radius:14px}
  .cf-flow__meta{left:18px;right:18px;bottom:16px}
  .cf-flow__name{font-size:14px}
  .cf-flow__logo{height:18px!important}
  .cf-flow__type{display:none}
  .cf-flow__nav{margin-top:28px}
}
@media(prefers-reduced-motion:reduce){.cf-flow__card,.cf-flow__meta,.cf-flow__dot{transition:none}}
</style>`

const SCRIPT = `<script>
(function(){
  var root=document.getElementById('cfFlow'); if(!root) return;
  var stage=root.querySelector('.cf-flow__stage'), cards=[].slice.call(root.querySelectorAll('.cf-flow__card')),
      dots=[].slice.call(root.querySelectorAll('.cf-flow__dot')), n=cards.length, i=0;
  if(!n) return;
  var canHover=matchMedia('(hover:hover) and (pointer:fine)').matches;
  function layout(){
    var w=stage.clientWidth, small=w<700, cw=cards[0].offsetWidth;
    cards.forEach(function(c,k){
      var o=((k-i)%n+n)%n; if(o>n/2) o-=n;
      var a=Math.abs(o), s=o<0?-1:1, t, op, z;
      var max=small?1:2;
      if(o===0){ t='translateX(0) rotateY(0) scale(1)'; op=1; z=10; }
      else if(a<=max){
        var x=small? cw*0.62 : (a===1? cw*0.62 : cw*0.94);
        t='translateX('+(s*x)+'px) rotateY('+(-s*(a===1?38:48))+'deg) scale('+(a===1?0.84:0.72)+')';
        op=a===1?0.7:0.4; z=10-a;
      } else { t='translateX('+(s*cw*1.1)+'px) rotateY('+(-s*52)+'deg) scale(.6)'; op=0; z=1; }
      c.style.transform=t; c.style.opacity=op; c.style.zIndex=z;
      c.classList.toggle('is-active',o===0);
      c.setAttribute('aria-hidden',a>max?'true':'false');
      c.tabIndex=o===0?0:-1;
      if(o!==0) stop(c);
    });
    dots.forEach(function(d,k){ d.classList.toggle('is-on',k===i); d.setAttribute('aria-current',k===i?'true':'false'); });
  }
  function go(k){ i=((k%n)+n)%n; layout(); }
  function play(c){ var v=c.querySelector('video'); if(!v) return; if(!v.src) v.src=v.dataset.src; var p=v.play(); if(p&&p.catch)p.catch(function(){}); c.classList.add('is-playing'); }
  function stop(c){ var v=c.querySelector('video'); if(v&&!v.paused) v.pause(); c.classList.remove('is-playing'); }
  cards.forEach(function(c,k){
    c.addEventListener('click',function(e){ if(!c.classList.contains('is-active')){ e.preventDefault(); go(k); } });
    if(canHover){
      c.addEventListener('mouseenter',function(){ if(c.classList.contains('is-active')) play(c); });
      c.addEventListener('mouseleave',function(){ stop(c); });
    }
  });
  root.querySelector('[data-prev]').addEventListener('click',function(){ go(i-1); });
  root.querySelector('[data-next]').addEventListener('click',function(){ go(i+1); });
  dots.forEach(function(d,k){ d.addEventListener('click',function(){ go(k); }); });
  stage.addEventListener('keydown',function(e){ if(e.key==='ArrowLeft'){ e.preventDefault(); go(i-1); } if(e.key==='ArrowRight'){ e.preventDefault(); go(i+1); } });
  var sx=null, moved=false;
  stage.addEventListener('pointerdown',function(e){ sx=e.clientX; moved=false; });
  stage.addEventListener('pointerup',function(e){ if(sx===null) return; var dx=e.clientX-sx; sx=null; if(Math.abs(dx)>50){ moved=true; go(i+(dx<0?1:-1)); } });
  stage.addEventListener('click',function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); moved=false; } },true);
  window.addEventListener('resize',layout,{passive:true});
  layout();
})();
</script>`

export function renderCoverflow(all: Project[]): string {
  const projects = coverflowOrder(all)
  if (!projects.length) return ''
  const cards = projects
    .map((p) => {
      const video = p.hover_video_url
        ? `<video muted loop playsinline preload="none" data-src="${esc(p.hover_video_url)}"></video>`
        : ''
      return `<a href="/projects/${esc(p.slug)}" class="cf-flow__card" draggable="false" aria-label="${esc(p.client || p.name)}: ${esc(p.name)}">
  <img src="${esc(p.thumbnail?.url)}" alt="${esc(p.thumbnail?.alt ?? p.name)}" loading="lazy" decoding="async" draggable="false">${video}
  <span class="cf-flow__shade"></span>
  <span class="cf-flow__meta">${p.logo?.url ? `<img class="cf-flow__logo" src="${esc(p.logo.url)}" alt="${esc(p.client)}" draggable="false">` : ''}<span class="cf-flow__name">${esc(p.name)}</span></span>
</a>`
    })
    .join('\n')
  const dots = projects
    .map((p, k) => `<button type="button" class="cf-flow__dot" aria-label="Show ${esc(p.client || p.name)}"${k === 0 ? ' aria-current="true"' : ''}></button>`)
    .join('')
  return `${STYLE}
<section class="cf-flow" id="cfFlow" aria-label="Featured work">
  <div class="cf-flow__stage" tabindex="0" aria-roledescription="carousel" aria-label="Projects, use the arrow keys to browse">
${cards}
  </div>
  <div class="cf-flow__nav">
    <button type="button" class="cf-flow__btn" data-prev aria-label="Previous project">${CHEV('M15 18l-6-6 6-6')}</button>
    <div class="cf-flow__dots">${dots}</div>
    <button type="button" class="cf-flow__btn" data-next aria-label="Next project">${CHEV('M9 18l6-6-6-6')}</button>
  </div>
  <div class="cf-flow__foot"><a href="/work" class="cf-flow__all">View all work ${ARROW}</a></div>
</section>
${SCRIPT}`
}
