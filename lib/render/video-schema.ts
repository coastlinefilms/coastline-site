import type { Project } from '@/lib/types'
import { SITE } from './util'

/**
 * VideoObject JSON-LD for project pages (Nov 2026 AI visibility audit).
 *
 * Project pages embed Vimeo players, which crawlers and AI assistants cannot read.
 * This describes each embedded film in schema.org terms: what it is, who made it,
 * when it was published, how long it runs and where it plays.
 *
 * Upload date, duration and thumbnail come from Vimeo's public oEmbed endpoint.
 * The name and description come from the project itself, because several Vimeo
 * titles are internal file names. If Vimeo is slow or a video is private, that
 * video is skipped and the page renders as before.
 */

type VimeoMeta = { upload_date?: string; duration?: number; thumbnail_url?: string; description?: string }

const cache = new Map<string, { at: number; meta: VimeoMeta | null }>()
const TTL = 12 * 60 * 60 * 1000

async function vimeoMeta(id: string): Promise<VimeoMeta | null> {
  const hit = cache.get(id)
  if (hit && Date.now() - hit.at < TTL) return hit.meta
  let meta: VimeoMeta | null = null
  try {
    const url = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) })
    if (res.ok) meta = (await res.json()) as VimeoMeta
  } catch {
    meta = null
  }
  cache.set(id, { at: Date.now(), meta })
  return meta
}

/** "2023-04-06 18:15:22" -> "2023-04-06" */
function isoDate(v: string | undefined): string | null {
  const m = v?.match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : null
}

/** 91 -> "PT1M31S" */
function isoDuration(sec: number | undefined): string | null {
  if (!sec || sec <= 0) return null
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.round(sec % 60)
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s || (!h && !m) ? `${s}S` : ''}`
}

const clean = (v: string | null | undefined) => (v ?? '').replace(/\s+/g, ' ').trim()

export async function projectVideoJsonLd(p: Project): Promise<string> {
  const ids = [...new Set([p.hero_video, p.video_2, p.video_3].filter((v): v is string => !!v && /^\d+$/.test(v)))]
  if (!ids.length) return ''
  const metas = await Promise.all(ids.map(vimeoMeta))

  const canonical = `${SITE}/projects/${p.slug}`
  const who = clean(p.client) || clean(p.name)
  const client = clean(p.client)
  const name = clean(p.name)
  const overlaps = client && (name.toLowerCase().includes(client.toLowerCase()) || client.toLowerCase().includes(name.toLowerCase()))
  const title = client && !overlaps ? `${client}: ${name}` : name
  const fallbackDesc = clean(p.meta_description) || clean(p.brief) || `${title}, a film by Coastline Films.`

  const videos = ids
    .map((id, i) => {
      const m = metas[i]
      const uploadDate = isoDate(m?.upload_date)
      if (!m || !m.thumbnail_url || !uploadDate) return null
      const n = ids.length > 1 ? ` (film ${i + 1} of ${ids.length})` : ''
      const v: Record<string, unknown> = {
        '@type': 'VideoObject',
        '@id': `${canonical}#video-${id}`,
        name: `${title}${n}`,
        description: clean(m.description) || fallbackDesc,
        thumbnailUrl: m.thumbnail_url,
        uploadDate,
        embedUrl: `https://player.vimeo.com/video/${id}`,
        url: canonical,
        inLanguage: 'en-CA',
        creator: { '@id': `${SITE}/#organization` },
        publisher: { '@id': `${SITE}/#organization` },
      }
      const duration = isoDuration(m.duration)
      if (duration) v.duration = duration
      if (who) v.about = { '@type': 'Organization', name: who }
      return v
    })
    .filter(Boolean)
  if (!videos.length) return ''

  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': videos }, null, 2).replace(/</g, '\\u003c')
  return `<script type="application/ld+json">\n${json}\n</script>`
}

/** Insert a block just before </head>. */
export function addToHead(html: string, block: string): string {
  if (!block) return html
  const i = html.indexOf('</head>')
  return i === -1 ? html : html.slice(0, i) + block + '\n' + html.slice(i)
}
