import { publicClient } from '@/lib/supabase/public'
import type { Img } from '@/lib/types'

/**
 * Site settings (admin > Dashboard), one row in `site_settings`.
 * The public renderer reads them on every request (memoised for 5s per instance,
 * saving purges the CDN cache), so a saved change is live on the next visit.
 */

export type Redirect = { from: string; to: string; code: 301 | 302 }

export type SiteSettings = {
  general: { siteName: string; timeZone: string; language: string; favicon: Img; webclip: Img }
  seo: { indexing: boolean; robots: string; googleVerification: string; defaultOg: Img }
  publishing: { redirects: Redirect[] }
  forms: { bookingUrl: string }
  integrations: { ga4: string; metaPixel: string; facebookVerification: string }
  code: { head: string; footer: string }
}

export type SettingsKey = keyof SiteSettings

export const DEFAULT_SETTINGS: SiteSettings = {
  general: { siteName: 'Coastline Films', timeZone: 'America/Toronto', language: 'en', favicon: null, webclip: null },
  seo: { indexing: true, robots: 'User-agent: *\nAllow: /', googleVerification: '', defaultOg: null },
  // Fallback copy of the live redirects, used only if settings can't be loaded
  publishing: {
    redirects: [
      { from: '/muskoka', to: '/muskoka-toronto-videographer', code: 301 },
      { from: '/book', to: 'https://api.leadconnectorhq.com/widget/bookings/coastline-strategy-call', code: 302 },
      { from: '/works/*', to: '/work', code: 301 },
      { from: '/blog/post-slug', to: '/blog', code: 301 },
    ],
  },
  forms: { bookingUrl: 'https://api.leadconnectorhq.com/widget/booking/D6upH9exSUPVa6UOgtz7' },
  integrations: { ga4: 'G-REZQBCVZTP', metaPixel: '', facebookVerification: 'cegvhqe399osdj8ckgr86figa0wvt2' },
  code: { head: '', footer: '' },
}

/** Fill any missing keys from the defaults (older rows, partial saves). */
export function normalizeSettings(data: unknown): SiteSettings {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, Record<string, unknown>>
  const out = {} as Record<string, unknown>
  for (const k of Object.keys(DEFAULT_SETTINGS) as SettingsKey[]) {
    const def = DEFAULT_SETTINGS[k] as Record<string, unknown>
    const cur = d[k] ?? {}
    out[k] = Object.fromEntries(Object.keys(def).map((f) => [f, f in cur ? cur[f] : def[f]]))
  }
  return out as SiteSettings
}

let memo: { at: number; v: SiteSettings } | null = null

/** Settings for the public site. Never throws: falls back to the last good copy, then defaults. */
export async function getSettings(): Promise<SiteSettings> {
  if (memo && Date.now() - memo.at < 5_000) return memo.v
  try {
    const { data, error } = await publicClient().from('site_settings').select('data').eq('id', 1).maybeSingle()
    if (error) throw error
    memo = { at: Date.now(), v: normalizeSettings(data?.data) }
  } catch (e) {
    console.error('settings load failed', e)
    if (memo) return memo.v
    return DEFAULT_SETTINGS
  }
  return memo.v
}

/* ---------------- redirects ---------------- */

const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p)

/** Webflow-style 301s. "/old/*" matches everything under /old; a "*" in the target carries the rest over. */
export function matchRedirect(path: string, list: Redirect[]): Redirect | null {
  const p = trim(path).toLowerCase()
  for (const r of list) {
    if (!r.from || !r.to) continue
    const from = trim(r.from.trim()).toLowerCase()
    if (from.endsWith('/*')) {
      const base = from.slice(0, -2)
      if (p === base || p.startsWith(base + '/')) {
        const rest = path.slice(base.length).replace(/^\//, '')
        const to = r.to.endsWith('/*') ? r.to.slice(0, -1) + rest : r.to
        if (trim(to).toLowerCase() === p) continue
        return { ...r, to }
      }
    } else if (from === p && trim(r.to).toLowerCase() !== p) {
      return r
    }
  }
  return null
}

/* ---------------- HTML ---------------- */

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function beforeClose(html: string, tag: '</head>' | '</body>', add: string) {
  if (!add) return html
  const i = tag === '</head>' ? html.indexOf(tag) : html.lastIndexOf(tag)
  return i === -1 ? html + add : html.slice(0, i) + add + '\n' + html.slice(i)
}

/** Apply the Dashboard settings to a rendered page. Runs last, after all other render steps. */
export function applySettings(html: string, s: SiteSettings): string {
  const g = s.general
  if (/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(g.language)) html = html.replace(/(<html\b[^>]*?\slang=")[^"]*"/, `$1${g.language}"`)

  let head = ''

  // Icons: Webflow emitted several sizes; one square upload replaces them all
  if (g.favicon?.url) {
    html = html.replace(/<link\b[^>]*\brel="(?:shortcut )?icon"[^>]*>/g, '')
    head += `<link rel="icon" href="${attr(g.favicon.url)}">`
  }
  if (g.webclip?.url) {
    html = html.replace(/<link\b[^>]*\brel="apple-touch-icon"[^>]*>/g, '')
    head += `<link rel="apple-touch-icon" href="${attr(g.webclip.url)}">`
  }

  // SEO
  if (!s.seo.indexing && !/<meta name="robots"/.test(html)) head += '<meta name="robots" content="noindex">'
  if (s.seo.googleVerification.trim()) head += `<meta name="google-site-verification" content="${attr(s.seo.googleVerification.trim())}">`
  if (s.seo.defaultOg?.url) {
    html = html.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*(" data-cf-default)/g, `$1${attr(s.seo.defaultOg.url)}$2`)
  }

  // Integrations. Strip the Google tag Webflow pasted into some pages, then add the configured one everywhere.
  const i = s.integrations
  html = html.replace(/(?:<!-- Google tag \(gtag\.js\) -->\s*)?<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]*"><\/script>\s*<script>[\s\S]*?gtag\('config',[^)]*\);?\s*<\/script>/g, '')
  if (/^G-[A-Z0-9]{4,}$/.test(i.ga4.trim())) {
    const id = i.ga4.trim()
    head += `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');</script>`
  }
  if (/^\d{6,20}$/.test(i.metaPixel.trim())) {
    const id = i.metaPixel.trim()
    head += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');</script>`
  }
  html = html.replace(/<meta name="facebook-domain-verification"[^>]*>/g, '')
  if (i.facebookVerification.trim()) head += `<meta name="facebook-domain-verification" content="${attr(i.facebookVerification.trim())}">`

  // Forms: the /contact form opens this GoHighLevel calendar
  const cal = s.forms.bookingUrl.trim().replace(/[?#].*$/, '').split('/').filter(Boolean).pop()
  if (cal && /^[A-Za-z0-9_-]+$/.test(cal)) html = html.replace(/var CAL='[^']*'/, `var CAL='${cal}'`)

  head += s.code.head
  html = beforeClose(html, '</head>', head)
  return beforeClose(html, '</body>', s.code.footer)
}

/** robots.txt from the SEO settings, with the sitemap line always added. */
export function robotsTxt(s: SiteSettings, site: string) {
  const body = s.seo.indexing ? (s.seo.robots.trim() || 'User-agent: *\nAllow: /') : 'User-agent: *\nDisallow: /'
  return `${body}\n\nSitemap: ${site}/sitemap.xml\n`
}
