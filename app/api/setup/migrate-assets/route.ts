import { put } from '@vercel/blob'
import urls from '@/content/asset-urls.json'
import { setupAllowed } from '@/lib/setup-auth'

export const runtime = 'nodejs'
export const maxDuration = 800

const TYPES: Record<string, string> = {
  webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  svg: 'image/svg+xml', avif: 'image/avif', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf', ico: 'image/x-icon', css: 'text/css',
}

/** Blob pathname for a legacy URL: keeps Webflow's unique file names so nothing collides. */
function target(u: string) {
  const url = new URL(u)
  const file = decodeURIComponent(url.pathname.split('/').pop() || 'file')
  const host = url.hostname.startsWith('website-delta') ? 'videos' : url.hostname.split('.')[0]
  return `site/${host}/${file}`
}

// Copies every image, font and video the Webflow site used into Vercel Blob and
// returns { oldUrl: newUrl }. Runs in batches: ?offset=0&limit=60
export async function POST(req: Request) {
  if (!setupAllowed(req)) return new Response('forbidden', { status: 403 })
  const sp = new URL(req.url).searchParams
  const offset = Number(sp.get('offset') ?? 0)
  const limit = Number(sp.get('limit') ?? 60)
  const batch = (urls as string[]).slice(offset, offset + limit)
  const map: Record<string, string> = {}
  const failed: { url: string; error: string }[] = []

  await Promise.all(
    batch.map(async (u, i) => {
      await new Promise((r) => setTimeout(r, (i % 8) * 150))
      try {
        const res = await fetch(u)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const ext = (new URL(u).pathname.split('.').pop() || '').toLowerCase()
        const blob = await put(target(u), res.body!, {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: res.headers.get('content-type') || TYPES[ext] || 'application/octet-stream',
          cacheControlMaxAge: 31536000,
        })
        map[u] = blob.url
      } catch (e) {
        failed.push({ url: u, error: e instanceof Error ? e.message : String(e) })
      }
    }),
  )
  return Response.json({ offset, count: batch.length, total: (urls as string[]).length, map, failed })
}
export const GET = POST
