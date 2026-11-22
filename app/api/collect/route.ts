import { publicClient } from '@/lib/supabase/public'

export const runtime = 'nodejs'

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|axios/i
const clip = (v: unknown, n: number) => (typeof v === 'string' && v ? v.slice(0, n) : null)

function parseUA(ua: string) {
  const device = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua) ? 'tablet' : /Mobi|iPhone|Android/i.test(ua) ? 'mobile' : 'desktop'
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung Internet'
    : /Firefox|FxiOS/.test(ua) ? 'Firefox' : /Instagram/.test(ua) ? 'Instagram' : /FBAN|FBAV/.test(ua) ? 'Facebook'
    : /Chrome|CriOS/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : 'Other'
  const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'macOS'
    : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'Other'
  return { device, browser, os }
}

// Only our own pages may send beacons; a rough per-IP cap stops one client flooding the table
const ALLOWED_HOST = /(^|\.)coastlinefilms\.ca$|\.vercel\.app$/
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 120
const hits = new Map<string, { n: number; t: number }>()
function limited(ip: string) {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.t > WINDOW_MS) {
    hits.set(ip, { n: 1, t: now })
    if (hits.size > 5000) for (const [k, v] of hits) if (now - v.t > WINDOW_MS) hits.delete(k)
    return false
  }
  h.n++
  return h.n > MAX_PER_WINDOW
}

// Receives beacons from /cf-a.js and stores them in Supabase (insert-only for the public key).
export async function POST(req: Request) {
  const origin = req.headers.get('origin')
  if (origin) {
    try {
      if (!ALLOWED_HOST.test(new URL(origin).hostname)) return new Response(null, { status: 403 })
    } catch {
      return new Response(null, { status: 403 })
    }
  }
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
  if (limited(ip)) return new Response(null, { status: 429 })
  const ua = req.headers.get('user-agent') ?? ''
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 })
  const text = await req.text()
  if (text.length > 4000) return new Response(null, { status: 413 })
  let b: Record<string, unknown>
  try { b = JSON.parse(text) } catch { return new Response(null, { status: 400 }) }
  const type = b.t
  if (type !== 'pageview' && type !== 'click' && type !== 'leave') return new Response(null, { status: 400 })
  if (typeof b.sid !== 'string' || typeof b.vid !== 'string' || typeof b.path !== 'string') return new Response(null, { status: 400 })

  const h = req.headers
  const city = h.get('x-vercel-ip-city')
  const row = {
    type,
    host: clip(b.host, 100),
    path: (b.path as string).slice(0, 300),
    status: Number(b.status) === 404 ? 404 : 200,
    pv_id: clip(b.pv, 40),
    session_id: (b.sid as string).slice(0, 40),
    visitor_id: (b.vid as string).slice(0, 40),
    referrer_host: clip(b.ref, 120),
    utm_source: clip(b.us, 100),
    utm_medium: clip(b.um, 100),
    utm_campaign: clip(b.uc, 150),
    country: clip(h.get('x-vercel-ip-country'), 4),
    region: clip(h.get('x-vercel-ip-country-region'), 10),
    city: city ? decodeURIComponent(city).slice(0, 80) : null,
    language: clip(b.lang, 20),
    ...parseUA(ua),
    label: clip(b.label, 80),
    href: clip(b.href, 300),
    element: clip(b.el, 20),
    scroll: typeof b.scroll === 'number' ? Math.max(0, Math.min(100, Math.round(b.scroll))) : null,
    duration_ms: typeof b.dur === 'number' ? Math.max(0, Math.min(6 * 3600 * 1000, Math.round(b.dur))) : null,
  }
  const { error } = await publicClient().from('site_events').insert(row)
  if (error) console.error('collect failed', error.message)
  return new Response(null, { status: 204 })
}
