import { listPosts, listProjects } from '@/lib/cms'
import { STATIC_PAGES } from '@/lib/site-pages'
import { SITE } from '@/lib/render/util'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Same shape as Webflow's generated sitemap: static pages, then Projects, then Blog Posts (A-Z by slug).
export async function GET() {
  const [projects, posts] = await Promise.all([listProjects(), listPosts()])
  const urls: { loc: string; lastmod: string }[] = [
    ...STATIC_PAGES.filter((p) => p.sitemap).map((p) => ({
      loc: p.path === '/' ? SITE : SITE + p.path,
      lastmod: p.lastmod,
    })),
    ...[...projects].sort((a, b) => a.slug.localeCompare(b.slug)).map((p) => ({
      loc: `${SITE}/projects/${p.slug}`,
      lastmod: p.published_at ?? p.updated_at,
    })),
    ...[...posts].sort((a, b) => a.slug.localeCompare(b.slug)).map((p) => ({
      loc: `${SITE}/blog/${p.slug}`,
      lastmod: p.published_at ?? p.updated_at,
    })),
  ]
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\r\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\r\n' +
    urls
      .map(
        (u) =>
          `    <url>\r\n        <loc>${esc(u.loc)}</loc>\r\n        <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>\r\n    </url>\r\n`,
      )
      .join('') +
    '</urlset>'
  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}
