import { getSettings, robotsTxt } from '@/lib/settings'
import { SITE } from '@/lib/render/util'
import { SITE_CACHE_TAG } from '@/lib/purge'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Built from Dashboard > SEO. The admin and API are always blocked, whatever the setting says.
export async function GET() {
  const body = robotsTxt(await getSettings(), SITE).replace('\n\nSitemap:', '\nDisallow: /admin\nDisallow: /api\n\nSitemap:')
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=300', 'vercel-cache-tag': SITE_CACHE_TAG },
  })
}
