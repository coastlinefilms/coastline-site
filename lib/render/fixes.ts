/**
 * Site-wide readability and touch fixes from the Nov 2026 audit, applied to every public page.
 * Kept in one place because the underlying styles live in many exported page blocks.
 *  - Small labels go from 11px to 12px, and the faintest ones get enough contrast to read on dark.
 *  - Click-to-play Vimeo posters (public/cf-vimeo.js) and their play button.
 *  - Touch targets reach 44px on phones (nav button, share buttons) and the carousel dots get a
 *    bigger invisible hit area without changing how they look.
 */
const CSS = `<style id="cf-audit-fixes">
.why-stat-label,.cf-test-role,.cap-caption-label,.lp-price__label,.lp-proj__meta,.ab-person__role,.lp-logos span,[class^="lp-"] small,.lp-stat small{font-size:12px!important;letter-spacing:.06em}
.why-stat-label,.cf-test-role,.lp-price__label,.ab-person__role,[class^="lp-"] small,.lp-stat small{color:rgba(228,221,203,.72)!important}
.lp-proj__meta,.lp-logos span{color:#A29B90!important}
.cf-land-ack__text{font-size:12px!important;color:#9A948A!important}
.cf-flow__dot{position:relative}
.cf-flow__dot::after{content:"";position:absolute;left:-6px;right:-6px;top:-18px;bottom:-18px}
.cf-vf{overflow:hidden;border-radius:inherit}
.cf-vf__poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .35s ease,transform .6s cubic-bezier(.2,.7,.2,1)}
.cf-vf__play{position:absolute;inset:0;z-index:1;display:flex;align-items:center;justify-content:center;width:100%;height:100%;margin:0;padding:0;border:0;background:linear-gradient(180deg,rgba(18,20,19,0) 55%,rgba(18,20,19,.35));cursor:pointer;-webkit-appearance:none;appearance:none}
.cf-vf__play span{display:block;width:78px;height:78px;border-radius:999px;background:rgba(228,221,203,.92) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M8 5.5v13l11-6.5z' fill='%23121413'/%3E%3C/svg%3E") 54% 50%/32px no-repeat;box-shadow:0 12px 40px rgba(0,0,0,.35);transition:transform .25s ease,background-color .25s ease}
.cf-vf__play:hover span{transform:scale(1.06);background-color:#fff}
.cf-vf__play:active span{transform:scale(.96)}
.cf-vf__play:focus-visible{outline:2px solid #E4DDCB;outline-offset:-6px}
.cf-vf:hover .cf-vf__poster{transform:scale(1.02)}
.why-video.cf-vf .cf-vf__poster{object-fit:contain}
@media (max-width:767px){
  .cf-vf__play span{width:64px;height:64px;background-size:26px}
  .cf-nav__cta{min-height:44px}
  .cf-share-btn{width:44px!important;height:44px!important}
}
</style>`

// Webflow runtime + jQuery: nothing on the site uses them any more (custom nav, no Webflow interactions,
// sliders, tabs or forms), so they are dropped from every page. ~360 KB less script per page.
const WEBFLOW_SCRIPTS = /<script\b[^>]*\bsrc="[^"]*(?:jquery-3\.5\.1\.min[^"]*|webflow\.schunk\.[^"]*|\/webflow\.[0-9a-f]{8}\.[^"]*)"[^>]*><\/script>/g

/**
 * Webflow's IX3 "pre-hide" style: hides headings, lists and cards until the Webflow
 * runtime adds html.w-mod-ix3. That runtime is gone (WEBFLOW_SCRIPTS above), so
 * anything it matched stayed invisible for good, e.g. the footer page directory.
 */
const IX3_PREHIDE = /<style>@media not all and \(prefers-reduced-motion: reduce\)\{html\.w-mod-js:not\(\.w-mod-ix3\)(?:(?!<\/style>)[\s\S])*<\/style>/g

/** Any <img> of the site logo (Webflow CDN, blob copy, or a resized variant) is swapped for the vector logo. */
const LOGO_IMG_SRC = /(<img\b[^>]*?)\ssrc="[^"]*(?:69fe6c7428307ab091c9a49f_Coastline(?:%20|%2520)Films(?:%20|%2520)copy\.png|coastline-films-logo-(?:v2|h\d+)-[A-Za-z0-9]+\.png)[^"]*"([^>]*>)/g
function vectorLogo(html: string): string {
  return html.replace(LOGO_IMG_SRC, (_m, pre: string, post: string) => {
    const strip = (t: string) => t.replace(/\s(?:srcset|sizes)="[^"]*"/g, '')
    return `${strip(pre)} src="/brand/coastline-films-logo.svg"${strip(post)}`
  })
}

export function auditFixes(html: string): string {
  let out = vectorLogo(html.replace(WEBFLOW_SCRIPTS, '').replace(IX3_PREHIDE, ''))
  if (/class="[^"]*\bcf-vf\b/.test(out)) {
    const j = out.lastIndexOf('</body>')
    if (j !== -1) out = out.slice(0, j) + '<script defer src="/cf-vimeo.js"></script>' + out.slice(j)
  }
  const i = out.indexOf('</head>')
  return i === -1 ? out : out.slice(0, i) + CSS + out.slice(i)
}
