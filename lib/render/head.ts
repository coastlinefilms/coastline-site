/**
 * Site-wide <head> fixes, applied to every rendered page (Nov 2026 audit):
 *  - Neue Montreal served under every family name the pages use
 *    ("Neuemontreal", "Neue Montreal", "neue-montreal"), so no text falls back
 *  - only the Google fonts a page actually uses (Space Mono, Poppins, Inter/Fraunces)
 *  - Google Analytics (GA4) on every page
 *  - a default share image where a page has none
 *  - drops Webflow leftovers: the WebFont loader, the CDN preconnect, loader preloads
 */

const GA_ID = 'G-REZQBCVZTP'
const DEFAULT_OG =
  'https://cdn.prod.website-files.com/69ecc5fb6fc18880aa9fc6c6/6a97104131eb4940181760f8_Graph.jpg'

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

// Same files Webflow served (now on our Blob store). Kept out of the public git repo for licensing.
const FONT_URL: Record<string, string> = {
  "LightItalic": "https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/69fe5eeb1174577a74d3bf8f_NeueMontreal-LightItalic.otf",
  "Medium": "https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/69fe5eeb3135ee46148d663e_NeueMontreal-Medium.otf",
  "MediumItalic": "https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/69fe5eeb5bb8e98d36feff67_NeueMontreal-MediumItalic.otf",
  "Italic": "https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/69fe5eeb5bb8e98d36feff6c_NeueMontreal-Italic.otf",
  "Bold": "https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/69fe5eeb79f82558bae2b9d0_NeueMontreal-Bold.otf",
  "BoldItalic": "https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/69fe5eeb92a57ef02ca9e1de_NeueMontreal-BoldItalic.otf",
  "Light": "https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/69fe5eebc49709e5f2e71d41_NeueMontreal-Light.otf",
  "Regular": "https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/69fe5eebe2ba2ec1a3bac0f3_NeueMontreal-Regular.otf"
}

const FONT_CSS = FAMILIES.flatMap((fam) =>
  FACES.map(
    ([file, w, s]) =>
      `@font-face{font-family:'${fam}';src:url(${FONT_URL[file]}) format('opentype');font-weight:${w};font-style:${s};font-display:swap}`,
  ),
).join('\n')

const FONT_BLOCK = `<link rel="preload" href="${FONT_URL.Regular}" as="font" type="font/otf" crossorigin>
<style id="cf-fonts">
${FONT_CSS}
/* the only Webflow class that asked for Montserrat */
.scroll-down-text{font-family:Neuemontreal,'Neue Montreal',sans-serif}
</style>
<style id="cf-no-eyebrows">
/* No eyebrow labels above headings (Nov 2026). Location/type meta on case cards stays: it carries local SEO. */
html body :is(.cf-eyebrow,.cf-hero__eyebrow,.lp-eyebrow,.sv-eyebrow,.cfw-eyebrow,.cfw-cta__eyebrow,.cfw-cta__label,.ab-tag,.ab-label__name,.ab-mini,.ab-label__num,.cf-faq__label,.smsx-eyebrow,.journal-eyebrow,.journal-section-label,.post-eyebrow,.post-calc-eyebrow,.post-cta-eyebrow,.cc-ty-eyebrow,.lp-svc__num,.work-client){display:none!important}
</style>`

const GA = `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>`

function googleFonts(html: string): string {
  const fams: string[] = []
  if (/font-family:[^;{}"]*Space Mono/.test(html) && !/family=Space\+Mono/.test(html)) fams.push('family=Space+Mono:wght@400;700')
  if (/smsx-page/.test(html) && !/family=Poppins/.test(html)) fams.push('family=Poppins:wght@400;500;600;700')
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
  if (!html.includes(`gtag/js?id=${GA_ID}`)) add += '\n' + GA
  if (!/property="og:image"/.test(head)) {
    add += `\n<meta property="og:image" content="${DEFAULT_OG}">\n<meta name="twitter:image" content="${DEFAULT_OG}">`
    if (!/name="twitter:card"/.test(head)) add += '\n<meta name="twitter:card" content="summary_large_image">'
  }
  return head + add + '\n' + rest
}
