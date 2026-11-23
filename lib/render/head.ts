/**
 * Site-wide <head> fixes, applied to every rendered page (Nov 2026 audit):
 *  - Neue Montreal (WOFF2, one set of files) served under every family name the pages use
 *    ("Neuemontreal", "Neue Montreal", "neue-montreal"), so no text falls back
 *  - only the Google fonts a page actually uses (Space Mono, Poppins, Inter/Fraunces)
 *  - a default share image where a page has none
 *  - drops Webflow leftovers: the WebFont loader, the CDN preconnect, loader preloads
 */

/** Share card (public/og-share.jpg, 1200x630): logo kept inside the centre square, because Facebook crops comment previews to a square */
const DEFAULT_OG = 'https://www.coastlinefilms.ca/og-share.jpg'

const FACES: [string, number, 'normal' | 'italic'][] = [
  ['Light', 300, 'normal'],
  ['LightItalic', 300, 'italic'],
  ['Regular', 400, 'normal'],
  ['Italic', 400, 'italic'],
  ['Medium', 500, 'normal'],
  ['MediumItalic', 500, 'italic'],
  ['Bold', 700, 'normal'],
  ['BoldItalic', 700, 'italic'],
]
const FAMILIES = ['Neuemontreal', 'Neue Montreal', 'neue-montreal']

// The licensed .otf originals stay on our Blob store; app/fonts/[file]/route.ts serves them as WOFF2.

const FONT_CSS = FAMILIES.flatMap((fam) =>
  FACES.map(
    ([file, w, s]) =>
      // WOFF2 from app/fonts (converted from the .otf originals): one set of files behind all three family names
      `@font-face{font-family:'${fam}';src:url(/fonts/NeueMontreal-${file}.woff2) format('woff2');font-weight:${w};font-style:${s};font-display:swap}`,
  ),
).join('\n')

const FONT_BLOCK = `<link rel="preload" href="/fonts/NeueMontreal-Regular.woff2" as="font" type="font/woff2" crossorigin>
<style id="cf-fonts">
${FONT_CSS}
/* the only Webflow class that asked for Montserrat */
.scroll-down-text{font-family:Neuemontreal,'Neue Montreal',sans-serif}
/* Book list posts (Nov 2026): cover left (sticky while you read), copy right; cover and pill link go to the book */
.post-rich-text .cf-book{display:grid!important;grid-template-columns:176px minmax(0,1fr);column-gap:44px;align-items:start;margin:clamp(64px,8vw,104px) 0 0!important}
.post-rich-text a.cf-book__cover{position:sticky;top:112px;display:block;border-bottom:0!important;padding:0!important;text-decoration:none!important}
.post-rich-text .cf-book__cover img{display:block!important;width:100%!important;height:auto!important;margin:0!important;border-radius:3px;box-shadow:0 26px 48px -20px rgba(0,0,0,.85),0 4px 10px rgba(0,0,0,.4);transition:transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .45s cubic-bezier(.2,.7,.2,1)}
.post-rich-text a.cf-book__cover:hover img,.post-rich-text a.cf-book__cover:focus-visible img{transform:translateY(-4px);box-shadow:0 34px 60px -22px rgba(0,0,0,.9),0 6px 14px rgba(0,0,0,.45)}
.post-rich-text a.cf-book__cover:focus-visible{outline:2px solid #E4DDCB;outline-offset:6px;border-radius:4px}
.post-rich-text .cf-book__body>h2:first-child{margin:0 0 .3em!important}
.post-rich-text .cf-book__body>h2+p{font-family:Neuemontreal,'Neue Montreal',sans-serif!important;font-size:.95rem!important;letter-spacing:.01em;color:rgba(228,221,203,.6)!important;margin:0 0 1.3em!important}
.post-rich-text .cf-book__body>ul{margin:1.3em 0 1.6em!important}
.post-rich-text .cf-book__body>p:last-child{margin:0!important}
.post-rich-text .cf-book__body>p:last-child>a{display:inline-flex;align-items:center;gap:10px;padding:13px 22px!important;border:1.5px solid rgba(228,221,203,.45)!important;border-radius:999px;font-family:Neuemontreal,'Neue Montreal',sans-serif!important;font-size:.95rem!important;font-weight:500;line-height:1;transition:background-color .3s ease,color .3s ease,border-color .3s ease}
.post-rich-text .cf-book__body>p:last-child>a::after{content:"";width:11px;height:11px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 11.5l7-7M5.5 4.5h6v6' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 11.5l7-7M5.5 4.5h6v6' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/contain no-repeat;transition:transform .3s ease}
.post-rich-text .cf-book__body>p:last-child>a:hover{background:#E4DDCB;color:#121413!important;border-color:#E4DDCB!important}
.post-rich-text .cf-book__body>p:last-child>a:hover::after{transform:translate(2px,-2px)}
@media(max-width:767px){.post-rich-text .cf-book{grid-template-columns:1fr;row-gap:24px}.post-rich-text a.cf-book__cover{position:static;width:132px}}
@media(prefers-reduced-motion:reduce){.post-rich-text .cf-book__cover img,.post-rich-text .cf-book__body>p:last-child>a,.post-rich-text .cf-book__body>p:last-child>a::after{transition:none}}
/* Legal pages (Privacy, Terms, SMS opt-in): unclassed text such as list items fell back to Poppins */
.smsx-page{font-family:Neuemontreal,'Neue Montreal',sans-serif}
</style>
<style id="cf-no-eyebrows">
/* No eyebrow labels above headings (Nov 2026). Location/type meta on case cards stays: it carries local SEO. */
html body :is(.cf-eyebrow,.cf-hero__eyebrow,.lp-eyebrow,.sv-eyebrow,.cfw-eyebrow,.cfw-cta__eyebrow,.cfw-cta__label,.ab-tag,.ab-label__name,.ab-mini,.ab-label__num,.cf-faq__label,.smsx-eyebrow,.journal-eyebrow,.journal-section-label,.post-eyebrow,.post-calc-eyebrow,.post-cta-eyebrow,.cc-ty-eyebrow,.lp-svc__num,.work-client){display:none!important}
/* Keyword lines (location / service) stay visible for SEO, shown as a plain tagline under the headline */
html body .lp-hero__inner{display:flex;flex-direction:column}
html body .lp-hero__inner>.lp-h1{order:1}
html body .lp-hero__inner>.lp-eyebrow{display:block!important;order:2;margin:20px 0 0;font-size:18px;line-height:1.4;font-weight:500;letter-spacing:0;text-transform:none;color:#E4DDCB}
html body .lp-hero__inner>:not(.lp-h1):not(.lp-eyebrow){order:3}
html body .journal-container:has(>.cf-kw){display:flex;flex-direction:column}
html body .journal-container>.journal-h1{order:1}
html body .journal-container>.cf-kw{display:block!important;order:2;margin:18px 0 0;font-size:18px;line-height:1.4;font-weight:500;letter-spacing:0;text-transform:none;color:#E4DDCB}
html body .journal-container:has(>.cf-kw)>:not(.journal-h1):not(.cf-kw){order:3}
@media(max-width:767px){html body .lp-hero__inner>.lp-eyebrow,html body .journal-container>.cf-kw{font-size:16px;margin-top:14px}}
</style>
<style id="cf-phone-fit">
/* Home page on phones (Nov 2026): stacked Webflow paddings left 160-210px gaps between sections; one steady 70-100px rhythm instead */
@media(max-width:767px){
html body:has(.why-section) .section-5{padding-bottom:0!important}
html body:has(.why-section) .why-section{padding-bottom:40px!important}
html body:has(.why-section) .cf-flow{padding-top:48px!important;padding-bottom:56px!important}
html body:has(.why-section) .sv{padding-top:64px!important;padding-bottom:80px!important}
html body:has(.why-section) :is(.section-3,.cf-test){padding-bottom:0!important}
html body:has(.why-section) .section-9{padding-top:0!important;padding-bottom:0!important}
html body:has(.why-section) .cfh-inner{padding-top:72px!important;padding-bottom:72px!important}
html body:has(.why-section) footer.footer{padding-top:0!important}
html body:has(.why-section) .footer-006{padding-top:24px!important}
}
/* No tilt or magnetic effects on touch screens: a tap fires a mouse move and left icons and buttons stuck at an angle */
@media(hover:none),(pointer:coarse){
html body :is([data-f-tilt],[data-f-tilt-icon],[data-f-tilt-froth],.cf-btn,.cf-nav__cta,.why-video-wrap,.sv-card,.journal-card,.journal-featured,.cfrl-card,.cfrl-frame){transform:none!important}
}
</style>`


function googleFonts(html: string): string {
  const fams: string[] = []
  if (/font-family:[^;{}"]*Space Mono/.test(html) && !/family=Space\+Mono/.test(html)) fams.push('family=Space+Mono:wght@400;700')
  if (!fams.length) return ''
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fams.join('&')}&display=swap">`
}

export function applyHead(html: string): string {
  const end = html.indexOf('</head>')
  if (end === -1) return html
  let head = html.slice(0, end)
  const rest = html.slice(end)

  // Webflow's WebFont loader pulled Montserrat, Fjalla One, Source Sans 3 and Inter on every page
  head = head
    .replace(/<script[^>]*ajax\.googleapis\.com\/ajax\/libs\/webfont\/[^>]*><\/script>/, '')
    .replace(/<script type="text\/javascript">WebFont\.load\(\{[\s\S]*?\}\);<\/script>/, '')
    .replace(/<link href="https:\/\/cdn\.prod\.website-files\.com" rel="preconnect"[^>]*\/?>/, '')
    // the intro loader fetches its own sprites; preloading them on every visit wasted bandwidth
    .replace(/<link rel="preload" as="image" href="[^"]*cf-loader-[^"]*"[^>]*>\s*/g, '')

  let add = FONT_BLOCK + '\n' + googleFonts(html)
  // Google Analytics, Meta Pixel and verification tags come from Dashboard > Integrations (lib/settings.ts)
  if (!/property="og:image"/.test(head)) {
    add += `\n<meta property="og:image" content="${DEFAULT_OG}" data-cf-default>\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:image" content="${DEFAULT_OG}" data-cf-default>`
    if (!/name="twitter:card"/.test(head)) add += '\n<meta name="twitter:card" content="summary_large_image">'
  }
  return head + add + '\n' + rest
}
