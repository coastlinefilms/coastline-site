/**
 * Phone load speed (Nov 2026).
 *
 * PageSpeed on a mid-range phone showed the home page pulling ~27 MB on first load, and the hero
 * frame (the LCP) queuing behind it because every image and video came off the same Blob host.
 * On phones only (desktop renders exactly as before):
 *  1. The hero poster is resized by Vercel's image optimizer, served from coastlinefilms.ca itself
 *     and preloaded, so it no longer waits behind the videos.
 *  2. The Capabilities videos and the full-bleed background bands load only when scrolled near.
 *  3. The background bands and testimonial stills get phone-sized copies (~1200px) instead of the
 *     2-4 MB originals.
 */

const PHONE = '(max-width:767px)'
const Q = 70 // must be listed in next.config images.qualities

/** Vercel image optimizer URL for a remote (Blob) image. `amp` = true inside HTML attributes. */
function opt(url: string, w: number, amp = true): string {
  const sep = amp ? '&amp;' : '&'
  return `/_next/image?url=${encodeURIComponent(url)}${sep}w=${w}${sep}q=${Q}`
}
function srcset(url: string, widths: number[]): string {
  return widths.map((w) => `${opt(url, w)} ${w}w`).join(', ')
}

const BLOB = /^https:\/\/six9ethpn7gbia9t\.public\.blob\.vercel-storage\.com\//

/** Full-bleed background bands (Webflow classes) and their images, from the shared Webflow CSS. */
const BANDS: Record<string, string> = {
  'section-7':
    'https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/6a0dd9a99f77ca9bd44aa00f_Web%20Image%2002.webp',
  'section-8':
    'https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/6a011406fb5027f67becbcd6_webbackground01.webp',
  sectionimage25:
    'https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/6a01161b9dde82a32a2166ad_webbackground02.webp',
}

function before(html: string, marker: string, add: string): string {
  const i = html.lastIndexOf(marker)
  return i === -1 ? html : html.slice(0, i) + add + html.slice(i)
}

export function phonePerf(html: string): string {
  let out = html
  let head = ''
  let tail = ''

  // 1. Hero poster: phone source -> optimized, same-origin, preloaded
  out = out.replace(
    /<source media="\(max-width:767px\)" srcset="(https:\/\/[^"]+)">/g,
    (tag, url: string) => {
      if (!BLOB.test(url)) return tag
      const set = srcset(url, [640, 828, 1200])
      head += `<link rel="preload" as="image" media="${PHONE}" imagesrcset="${set}" imagesizes="100vw" fetchpriority="high">`
      return `<source media="${PHONE}" srcset="${set}" sizes="100vw">`
    },
  )

  // 2a. Capabilities videos: hold the file back (desktop gets it straight away, phones when scrolled near)
  let capVideos = false
  out = out.replace(
    /(<video class="cap-video[^"]*"[^>]*?)preload="metadata"(\s+)src="([^"]+)"/g,
    (_m, pre: string, ws: string, src: string) => {
      capVideos = true
      return `${pre}preload="none"${ws}data-src="${src}"`
    },
  )
  if (capVideos) {
    tail += `<script>(function(){var s=document.querySelector('.cap-section');if(!s)return;var vs=[].slice.call(s.querySelectorAll('video.cap-video[data-src]'));if(!vs.length)return;
function load(v,pre){if(!v.getAttribute('src')){v.preload=pre;v.src=v.getAttribute('data-src')}}
function playActive(){var a=s.querySelector('.cap-video.is-active');if(a){load(a,'auto');a.play().catch(function(){})}}
if(!matchMedia('${PHONE}').matches){vs.forEach(function(v){load(v,'metadata')});playActive();return}
var seen=false;vs.forEach(function(v){new MutationObserver(function(){if(seen&&v.classList.contains('is-active')){load(v,'auto');v.play().catch(function(){})}}).observe(v,{attributes:true,attributeFilter:['class']})});
if(!('IntersectionObserver' in window)){seen=true;playActive();return}
var io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++){if(es[i].isIntersecting){io.disconnect();seen=true;playActive();return}}},{rootMargin:'300px 0px'});io.observe(s)})();</script>`
  }

  // 2b + 3. Background bands: phone-sized copy, only once the band is close
  const bands = Object.keys(BANDS).filter((c) => out.includes(`class="${c}"`))
  if (bands.length) {
    const sel = (c: string) => `html body .${c}`
    head +=
      `<style id="cf-phone-bands">@media${PHONE}{` +
      bands.map(sel).join(',') +
      '{background-image:none!important}' +
      bands.map((c) => `${sel(c)}.cf-bg-in{background-image:url("${opt(BANDS[c], 2048, false)}")!important}`).join('') +
      '}</style>'
    tail += `<script>(function(){if(!matchMedia('${PHONE}').matches)return;var els=document.querySelectorAll('${bands
      .map((c) => '.' + c)
      .join(',')}');if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('cf-bg-in')});return}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('cf-bg-in');io.unobserve(e.target)}})},{rootMargin:'600px 0px'});els.forEach(function(e){io.observe(e)})})();</script>`
  }

  // 1b. Site texture. Phones ignore background-attachment:fixed, so "cover" sized the texture to the whole
  //     page (7,000px tall on the home page) and blew a 3840px image up roughly 10x: soft and blurry.
  //     On phones the texture sits on a screen-sized fixed layer instead (the cost calculator's approach),
  //     at full resolution: the original is only ~260 KB. Desktop keeps the high-priority preload.
  const TEXTURE = 'https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/6a12480e77f832e5f99643e1_webtexture1.webp'
  if (out.includes(TEXTURE)) {
    out = out.replace(
      new RegExp(`<link rel="preload" as="image" href="${TEXTURE.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"`, 'g'),
      `<link rel="preload" as="image" media="(min-width:768px)" href="${TEXTURE}"`,
    )
    head +=
      `<style id="cf-phone-texture">@media${PHONE}{` +
      `html:root body,html:root body:has(.lp){background-color:#121413!important;background-image:none!important}` +
      `html:root body::before{content:"";position:fixed;top:0;left:0;width:100%;height:100vh;height:100lvh;z-index:-1;pointer-events:none;` +
      `background:#121413 url("${TEXTURE}") center/cover no-repeat}}</style>`
  }

  // 3. Testimonial stills: phone-sized copies (desktop still picks the original), loaded lazily
  out = out.replace(/<img class="cf-test-img" src="(https:\/\/[^"]+)"/g, (tag, url: string) => {
    if (!BLOB.test(url)) return tag
    return `<img class="cf-test-img" loading="lazy" decoding="async" srcset="${srcset(url, [828, 1200])}, ${url} 2400w" sizes="${PHONE} 100vw, 2400px" src="${url}"`
  })

  // 3b. Other images that load early on a phone at far more than they display at.
  //     The `2400px` desktop size makes desktop keep choosing the original file.
  const phoneImg = (pattern: RegExp, widths: number[], phoneSize: string) => {
    out = out.replace(pattern, (tag: string, pre: string, url: string) => {
      if (!BLOB.test(url) || /\ssrcset=/.test(tag)) return tag
      return `${pre}srcset="${srcset(url, widths)}, ${url} 2400w" sizes="${PHONE} ${phoneSize}, 2400px" src="${url}"`
    })
  }
  // site logo (nav, mobile menu, footer): a 6000x1800 PNG (v2 master: 2400x720, E redrawn) shown 120-190px wide on every screen,
  // so desktop gets the small copies too (the old 2400w/2400px pair sent desktops the 6000px original)
  out = out.replace(/(<img\b[^>]*?)src="(https:\/\/[^"]+(?:_Coastline%20Films%20copy|\/coastline-films-logo-v2-[A-Za-z0-9]+)\.png)"/g, (tag: string, pre: string, url: string) => {
    if (!BLOB.test(url) || /\ssrcset=/.test(tag)) return tag
    return `${pre}srcset="${srcset(url, [256, 384, 640])}" sizes="190px" src="${url}"`
  })
  // testimonial avatars: large photos shown as ~56px circles
  phoneImg(/(<div class="cf-test-avatar">\s*<img\b[^>]*?)src="(https:\/\/[^"]+)"/g, [128, 256], '64px')
  // Work cover flow cards
  phoneImg(/(<img class="cf-flow__media"\s+)src="(https:\/\/[^"]+)"/g, [640, 828, 1200], '80vw')

  if (head) out = before(out, '</head>', head)
  if (tail) out = before(out, '</body>', tail)
  return out
}
