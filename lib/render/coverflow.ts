/**
 * Home work carousel (Nov 2026). Shows the projects marked Featured in the CMS, by
 * Sort Order. Styled after the Client Reviews carousel: the middle card is sharp,
 * the cards either side sit back smaller, darkened and blurred. The active card plays
 * its hover clip on hover; side cards bring themselves forward when clicked.
 */
import type { Project } from '@/lib/types'

const esc = (s: string | null | undefined) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const ARROW =
  '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const SIDE = (d: string) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`

/** The home carousel shows the projects marked Featured in the CMS, by Sort Order. */
export function coverflowOrder(projects: Project[]) {
  const featured = projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.sort_order ?? 1e9) - (b.sort_order ?? 1e9) || a.created_at.localeCompare(b.created_at))
  return featured.length ? featured : [...projects].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

const STYLE = `<style>
.cf-flow{padding:112px 0;background:#121413;color:#E4DDCB;font-family:Neuemontreal,"Neue Montreal",-apple-system,sans-serif;overflow:hidden}
.cf-flow *{box-sizing:border-box}
.cf-flow__stage{--cw:720px;--off:480px;position:relative;height:calc(var(--cw) * .625);max-width:1600px;margin:0 auto;touch-action:pan-y;outline:none}
.cf-flow__card{position:absolute;left:50%;top:50%;width:var(--cw);height:calc(var(--cw) * .625);border-radius:4px;overflow:hidden;background:#1c1e1d;display:block;text-decoration:none;color:#FFFFFF;
  transform:translate(-50%,-50%) scale(.6);opacity:0;filter:blur(8px);pointer-events:none;z-index:1;
  transition:transform .7s cubic-bezier(.22,.61,.36,1),opacity .7s cubic-bezier(.22,.61,.36,1),filter .7s cubic-bezier(.22,.61,.36,1);
  -webkit-tap-highlight-color:transparent;-webkit-user-drag:none;user-select:none}
.cf-flow__card.is-active{transform:translate(-50%,-50%) scale(1);opacity:1;filter:blur(0);pointer-events:auto;z-index:3}
.cf-flow__card.is-prev{transform:translate(calc(-50% - var(--off)),-50%) scale(.8);opacity:.4;filter:blur(6px);pointer-events:auto;z-index:2;cursor:pointer}
.cf-flow__card.is-next{transform:translate(calc(-50% + var(--off)),-50%) scale(.8);opacity:.4;filter:blur(6px);pointer-events:auto;z-index:2;cursor:pointer}
.cf-flow__media,.cf-flow__card video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.cf-flow__card video{opacity:0;transition:opacity .5s ease}
.cf-flow__card.is-playing video{opacity:1}
.cf-flow__shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,20,19,0) 50%,rgba(18,20,19,.82) 100%);pointer-events:none}
.cf-flow__meta{position:absolute;left:28px;right:28px;bottom:26px;display:flex;align-items:center;gap:16px;opacity:0;transform:translateY(8px);transition:opacity .45s ease,transform .45s cubic-bezier(.22,.61,.36,1)}
.cf-flow__card.is-active .cf-flow__meta{opacity:1;transform:none;transition-delay:.15s}
.cf-flow__logo{display:block;height:24px;width:auto;max-width:130px;object-fit:contain;filter:brightness(0) invert(1);flex:none;opacity:0;transition:opacity .3s ease}
.cf-flow__logo.is-ready{opacity:1}
.cf-flow__name{font-size:15px;line-height:1.3;font-weight:500;color:#FFFFFF;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cf-flow__card:focus-visible{outline:2px solid #E4DDCB;outline-offset:4px}
.cf-flow__arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:5;width:56px;height:56px;border-radius:50%;background:rgba(18,20,19,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:.5px solid rgba(228,221,203,.25);color:#E4DDCB;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .3s ease,border-color .3s ease,transform .3s ease;-webkit-tap-highlight-color:transparent}
.cf-flow__arrow:hover{background:rgba(228,221,203,.16);border-color:rgba(228,221,203,.5)}
.cf-flow__arrow:active{transform:translateY(-50%) scale(.96)}
.cf-flow__arrow:focus-visible{outline:2px solid #E4DDCB;outline-offset:3px}
.cf-flow__arrow svg{width:20px;height:20px;display:block}
.cf-flow__arrow[data-prev]{left:4%}
.cf-flow__arrow[data-next]{right:4%}
.cf-flow__dots{display:flex;justify-content:center;align-items:center;gap:10px;margin-top:40px;padding:0 20px}
.cf-flow__dot{width:8px;height:8px;padding:0;border:0;border-radius:999px;background:rgba(228,221,203,.25);cursor:pointer;transition:width .3s ease,background-color .3s ease;-webkit-tap-highlight-color:transparent}
.cf-flow__dot.is-on{width:24px;background:#E4DDCB}
.cf-flow__foot{display:flex;justify-content:center;margin-top:32px}
.cf-flow__all{display:inline-flex;align-items:center;gap:10px;padding:14px 24px;border-radius:999px;border:1.5px solid #E4DDCB;color:#E4DDCB;font-size:15px;font-weight:500;text-decoration:none;white-space:nowrap;transition:background-color .3s ease,color .3s ease}
.cf-flow__all:hover{background:#E4DDCB;color:#121413}
@media(max-width:1200px){.cf-flow__stage{--cw:600px;--off:400px}}
@media(max-width:991px){.cf-flow{padding:88px 0}.cf-flow__stage{--cw:62vw;--off:44vw}.cf-flow__arrow[data-prev]{left:2%}.cf-flow__arrow[data-next]{right:2%}}
@media(max-width:767px){
  .cf-flow{padding:72px 0}
  .cf-flow__stage{--cw:84vw;--off:70vw}
  .cf-flow__card.is-prev,.cf-flow__card.is-next{opacity:.25;filter:blur(8px)}
  .cf-flow__arrow{width:44px;height:44px;top:auto;bottom:-68px;transform:none}
  .cf-flow__arrow:active{transform:scale(.96)}
  .cf-flow__arrow[data-prev]{left:24px}.cf-flow__arrow[data-next]{right:24px}
  .cf-flow__dots{margin-top:36px}
  .cf-flow__meta{left:18px;right:18px;bottom:16px;gap:12px}
  .cf-flow__logo{height:20px;max-width:100px}
  .cf-flow__name{font-size:14px}
}
@media(max-width:479px){.cf-flow__stage{--cw:86vw;--off:88vw}}
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
    cards.forEach(function(c,k){
      var o=((k-i)%n+n)%n; if(o>n/2) o-=n;
      c.classList.toggle('is-active',o===0);
      c.classList.toggle('is-prev',o===-1);
      c.classList.toggle('is-next',o===1);
      c.setAttribute('aria-hidden',o===0?'false':'true');
      c.tabIndex=o===0?0:-1;
      if(o!==0) stop(c);
    });
    dots.forEach(function(d,k){ d.classList.toggle('is-on',k===i); if(k===i) d.setAttribute('aria-current','true'); else d.removeAttribute('aria-current'); });
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
  /* logos arrive trimmed of padding; size each to the same visual weight whatever its shape */
  [].slice.call(root.querySelectorAll('.cf-flow__logo')).forEach(function(img){
    function fit(){ var w=img.naturalWidth,h=img.naturalHeight; if(!w||!h) return;
      var small=matchMedia('(max-width:767px)').matches, A=small?1100:1500, maxW=small?100:130;
      var H=Math.sqrt(A*h/w); H=Math.max(16,Math.min(H,small?34:42)); if(H*w/h>maxW) H=maxW*h/w;
      img.style.height=H.toFixed(1)+'px'; img.classList.add('is-ready'); }
    if(img.complete) fit(); else img.addEventListener('load',fit);
  });
  root.querySelector('[data-prev]').addEventListener('click',function(){ go(i-1); });
  root.querySelector('[data-next]').addEventListener('click',function(){ go(i+1); });
  dots.forEach(function(d,k){ d.addEventListener('click',function(){ go(k); }); });
  stage.addEventListener('keydown',function(e){ if(e.key==='ArrowLeft'){ e.preventDefault(); go(i-1); } if(e.key==='ArrowRight'){ e.preventDefault(); go(i+1); } });
  var sx=null, moved=false;
  stage.addEventListener('pointerdown',function(e){ sx=e.clientX; moved=false; });
  stage.addEventListener('pointerup',function(e){ if(sx===null) return; var dx=e.clientX-sx; sx=null; if(Math.abs(dx)>50){ moved=true; go(i+(dx<0?1:-1)); } });
  stage.addEventListener('click',function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); moved=false; } },true);
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
      const logo = p.logo?.url
        ? `<img class="cf-flow__logo" src="/api/logo?u=${encodeURIComponent(p.logo.url)}" alt="${esc(p.client)}" draggable="false">`
        : ''
      return `<a href="/projects/${esc(p.slug)}" class="cf-flow__card" draggable="false" aria-label="${esc(p.client || p.name)}: ${esc(p.name)}">
  <img class="cf-flow__media" src="${esc(p.thumbnail?.url)}" alt="${esc(p.thumbnail?.alt ?? p.name)}" loading="lazy" decoding="async" draggable="false">${video}
  <span class="cf-flow__shade"></span>
  <span class="cf-flow__meta">${logo}<span class="cf-flow__name">${esc(p.name)}</span></span>
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
    <button type="button" class="cf-flow__arrow" data-prev aria-label="Previous project">${SIDE('M19 12H5M11 18l-6-6 6-6')}</button>
    <button type="button" class="cf-flow__arrow" data-next aria-label="Next project">${SIDE('M5 12h14M13 6l6 6-6 6')}</button>
  </div>
  <div class="cf-flow__dots">${dots}</div>
  <div class="cf-flow__foot"><a href="/work" class="cf-flow__all">View all work ${ARROW}</a></div>
</section>
${SCRIPT}`
}
