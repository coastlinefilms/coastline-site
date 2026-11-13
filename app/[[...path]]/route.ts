import { renderPath } from '@/lib/render/page'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Pages are rendered from Supabase on request and cached at Vercel's edge.
// CMS edits made in /admin show up within about a minute.
const CACHE = 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400'

export async function GET(_req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path } = await ctx.params
  const pathname = '/' + (path ?? []).join('/')
  try {
    const { status, html } = await renderPath(pathname)
    return new Response(html, {
      status,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': CACHE },
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
