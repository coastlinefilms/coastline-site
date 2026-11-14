import { renderPath } from '@/lib/render/page'
import { SITE_CACHE_TAG } from '@/lib/purge'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Pages are rendered from Supabase on request and cached at Vercel's edge.
// Saving in /admin purges the 'site' tag, so CMS and Dashboard changes show up on the next visit.
const CACHE = 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400'

export async function GET(_req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path } = await ctx.params
  const pathname = '/' + (path ?? []).join('/')
  try {
    const { status, html, location } = await renderPath(pathname)
    if (location) {
      return new Response(null, { status, headers: { location, 'cache-control': CACHE, 'vercel-cache-tag': SITE_CACHE_TAG } })
    }
    return new Response(html, {
      status,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': CACHE, 'vercel-cache-tag': SITE_CACHE_TAG },
    })
  } catch (err) {
    console.error('render failed', pathname, err)
    return new Response('Something went wrong. Please refresh the page.', {
      status: 500,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    })
  }
}

export async function HEAD(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const res = await GET(req, ctx)
  return new Response(null, { status: res.status, headers: res.headers })
}
