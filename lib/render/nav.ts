/**
 * Site header (Nov 2026): logo left, page links centred, cream "Book a call" pill
 * right. On scroll it tightens into the existing frosted pill. Swapped in at render
 * time so content/pages.json keeps the captured Webflow header untouched.
 */

const LOGO = 'https://cdn.prod.website-files.com/69ecc5fb6fc18880aa9fc6c6/69fe6c7428307ab091c9a49f_Coastline%20Films%20copy.png'
const TEXTURE = 'https://cdn.prod.website-files.com/69ecc5fb6fc18880aa9fc6c6/6a12480e77f832e5f99643e1_webtexture1.webp'

const LINKS: [string, string][] = [
  ['Work', '/work'],
  ['Services', '/video-production'],
  ['Studio', '/about'],
  ['Clients', '/#clients'],
  ['Field Notes', '/journal'],
]

const ARROW =
  '<svg class="cf-nav__arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

const EASE = 'cubic-bezier(.22,.61,.36,1)'

const STYLE = `<style>
.cf-nav{position:fixed;top:0;left:0;right:0;z-index:1000;display:flex;justify-content:center;pointer-events:none;font-family:"Neue Montreal","neue-montreal",-apple-system,sans-serif}
.cf-nav__inner{pointer-events:auto;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;width:100%;max-width:100%;padding:24px 48px;background:transparent;border-radius:0;margin-top:0;backdrop-filter:blur(0);-webkit-backdrop-filter:blur(0);
  transition:max-width .55s ${EASE},padding .55s ${EASE},background-color .55s ${EASE},border-radius .55s ${EASE},margin-top .55s ${EASE},backdrop-filter .55s ${EASE},-webkit-backdrop-filter .55s ${EASE}}
.cf-nav.is-scrolled .cf-nav__inner{max-width:1140px;padding:10px 10px 10px 28px;background:rgba(228,221,203,.66);border-radius:56px;margin-top:16px;backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px)}

.cf-nav__logo{grid-column:1;justify-self:start;display:block;height:40px;transition:height .55s ${EASE}}
.cf-nav.is-scrolled .cf-nav__logo{height:32px}
.cf-nav__logo img{height:100%;width:auto;display:block;transition:filter .4s ease}
.cf-nav.is-scrolled .cf-nav__logo img{filter:brightness(0) invert(1)}

.cf-nav__links{grid-column:2;display:flex;align-items:center;gap:44px;transition:gap .55s ${EASE}}
.cf-nav.is-scrolled .cf-nav__links{gap:36px}
.cf-nav__link{position:relative;font-size:18px;font-weight:400;line-height:1.2;letter-spacing:0;text-decoration:none;white-space:nowrap;color:rgba(228,221,203,.82);transition:color .35s ease}
.cf-nav__link::after{content:"";position:absolute;left:0;right:0;bottom:-5px;height:1px;background:currentColor;transform:scaleX(0);transform-origin:left;transition:transform .35s ${EASE}}
.cf-nav__link:hover{color:#FFFFFF}
.cf-nav__link:hover::after{transform:scaleX(1)}
.cf-nav.is-scrolled .cf-nav__link{color:#FFFFFF}
.cf-nav.is-scrolled .cf-nav__link:hover{color:#121413}

.cf-nav__right{grid-column:3;justify-self:end;display:flex;align-items:center;gap:12px}
.cf-nav__cta{display:inline-flex;align-items:center;gap:10px;padding:16px 26px;border-radius:999px;font-size:17px;font-weight:500;line-height:1;letter-spacing:-.005em;text-decoration:none;white-space:nowrap;background:#E4DDCB;color:#121413;transform-style:preserve-3d;will-change:transform;
  transition:background-color .35s ease,color .35s ease,padding .55s ${EASE},transform .18s ease-out}
.cf-nav__cta:hover{background:#FFFFFF}
.cf-nav__arrow{display:block;transition:transform .3s ${EASE}}
.cf-nav__cta:hover .cf-nav__arrow{transform:translate(2px,-2px)}
.cf-nav.is-scrolled .cf-nav__cta{padding:14px 24px;background:#121413;color:#E4DDCB}
.cf-nav.is-scrolled .cf-nav__cta:hover{background:#000000;color:#FFFFFF}
.cf-nav__link:focus-visible,.cf-nav__cta:focus-visible,.cf-nav__logo:focus-visible,.cf-nav__burger:focus-visible{outline:2px solid #E4DDCB;outline-offset:4px;border-radius:4px}
.cf-nav__cta:focus-visible{border-radius:999px}

.cf-nav__burger,.cf-nav__mobile{display:none}
#clients{scroll-margin-top:96px}

@media(max-width:991px){
  .cf-nav__inner{display:flex;justify-content:space-between;padding:16px 24px}
  .cf-nav.is-scrolled .cf-nav__inner{max-width:calc(100% - 24px);padding:8px 8px 8px 20px;margin-top:12px}
  .cf-nav__links{display:none}
  .cf-nav__logo{height:36px}
  .cf-nav.is-scrolled .cf-nav__logo{height:30px}
  .cf-nav__cta{padding:12px 18px;font-size:15px;gap:8px}
  .cf-nav.is-scrolled .cf-nav__cta{padding:11px 16px}
  .cf-nav__burger{display:flex;flex-direction:column;justify-content:center;gap:5px;width:44px;height:44px;padding:10px;background:none;border:0;cursor:pointer}
  .cf-nav__burger span{width:24px;height:2px;background:#E4DDCB;display:block;transition:background-color .4s ease}
  .cf-nav.is-scrolled .cf-nav__burger span{background:#FFFFFF}

  .cf-nav__mobile{position:fixed;inset:0;padding:40px 24px 48px;background-color:#121413;background-image:linear-gradient(rgba(18,20,19,.55),rgba(18,20,19,.55)),url("${TEXTURE}");background-size:cover;background-position:center;display:flex;flex-direction:column;align-items:center;opacity:0;pointer-events:none;visibility:hidden;transition:opacity .4s ease,visibility 0s linear .4s;z-index:1001}
  .cf-nav__mobile.is-open{opacity:1;pointer-events:auto;visibility:visible;transition:opacity .4s ease}
  .cf-nav__mobile-close{position:absolute;top:24px;right:20px;width:44px;height:44px;background:none;border:0;color:#E4DDCB;font-size:34px;line-height:1;cursor:pointer}
  .cf-nav__mobile-logo img{height:44px;width:auto;display:block}
  .cf-nav__mobile-menu{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px}
  .cf-nav__mobile-menu a{color:#E4DDCB;font-size:32px;font-weight:400;line-height:1.2;text-decoration:none;transition:color .3s ease}
  .cf-nav__mobile-menu a:hover{color:#FFFFFF}
  .cf-nav__mobile-menu .cf-nav__mobile-cta{margin-top:16px;display:inline-flex;align-items:center;gap:10px;padding:16px 28px;border-radius:999px;background:#E4DDCB;color:#121413;font-size:17px;font-weight:500}
  .cf-nav__mobile-menu .cf-nav__mobile-cta:hover{background:#FFFFFF;color:#121413}
}
@media(max-width:400px){
  .cf-nav__inner{padding:14px 16px}
  .cf-nav__cta{padding:11px 14px;font-size:14px}
  .cf-nav__cta .cf-nav__arrow{display:none}
}
@media(prefers-reduced-motion:reduce){
  .cf-nav__inner,.cf-nav__logo,.cf-nav__links,.cf-nav__cta,.cf-nav__link::after,.cf-nav__arrow{transition:none}
}
</style>`

const MARKUP = `<nav class="cf-nav" id="cfNav" aria-label="Main">
  <div class="cf-nav__inner">
    <a href="/" class="cf-nav__logo" aria-label="Coastline Films home"><img src="${LOGO}" alt="Coastline Films"></a>
    <div class="cf-nav__links">
      ${LINKS.map(([t, h]) => `<a href="${h}" class="cf-nav__link">${t}</a>`).join('\n      ')}
    </div>
    <div class="cf-nav__right">
      <a href="/contact" class="cf-nav__cta" id="cfCta">Book a call ${ARROW}</a>
      <button class="cf-nav__burger" id="cfBurger" aria-label="Open menu" aria-expanded="false" aria-controls="cfMobile"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div class="cf-nav__mobile" id="cfMobile">
    <button class="cf-nav__mobile-close" id="cfClose" aria-label="Close menu">&times;</button>
    <a href="/" class="cf-nav__mobile-logo" aria-label="Coastline Films home"><img src="${LOGO}" alt="Coastline Films"></a>
    <div class="cf-nav__mobile-menu">
      ${LINKS.map(([t, h]) => `<a href="${h}">${t}</a>`).join('\n      ')}
      <a href="/contact" class="cf-nav__mobile-cta">Book a call ${ARROW}</a>
    </div>
  </div>
</nav>

<script>
(function(){
  var nav=document.getElementById('cfNav');
  function onScroll(){ nav.classList.toggle('is-scrolled', window.scrollY>40); }
  onScroll();
  window.addEventListener('scroll',onScroll,{passive:true});

  var b=document.getElementById('cfBurger'), m=document.getElementById('cfMobile'), c=document.getElementById('cfClose');
  function setOpen(o){ m.classList.toggle('is-open',o); b.setAttribute('aria-expanded',o?'true':'false'); document.documentElement.style.overflow=o?'hidden':''; if(!o) b.focus({preventScroll:true}); }
  if(b) b.addEventListener('click',function(){ setOpen(true); c.focus({preventScroll:true}); });
  if(c) c.addEventListener('click',function(){ setOpen(false); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape' && m.classList.contains('is-open')) setOpen(false); });
  m.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ m.classList.remove('is-open'); document.documentElement.style.overflow=''; }); });

  var cta=document.getElementById('cfCta');
  var still=window.matchMedia('(max-width:991px)').matches||('ontouchstart' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(cta && !still){
    var MAX=18, RANGE=280;
    document.addEventListener('mousemove',function(e){
      var r=cta.getBoundingClientRect(), dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2), d=Math.sqrt(dx*dx+dy*dy);
      if(d>RANGE){ cta.style.transform=''; return; }
      var s=1-d/RANGE;
      cta.style.transform='perspective(500px) rotateY('+(dx/RANGE*MAX)+'deg) rotateX('+(-dy/RANGE*MAX)+'deg) scale('+(1+0.06*s)+')';
    },{passive:true});
  }
})();
</script>`

const START = '<style>\n.cf-nav{'

export function applyNav(html: string): string {
  const a = html.indexOf(START)
  if (a === -1) return html
  const navEnd = html.indexOf('</nav>', a)
  const scriptEnd = navEnd === -1 ? -1 : html.indexOf('</script>', navEnd)
  if (scriptEnd === -1) return html
  const out = html.slice(0, a) + STYLE + '\n\n' + MARKUP + html.slice(scriptEnd + '</script>'.length)
  return out.replace('<section class="cf-test">', '<section class="cf-test" id="clients">')
}
