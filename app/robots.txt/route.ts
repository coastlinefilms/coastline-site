export const dynamic = 'force-static'

// Identical to the robots.txt Webflow served.
export function GET() {
  const body =
    'User-agent: *\nAllow: /\n\nSitemap: https://www.coastlinefilms.ca/sitemap.xml\n\nSitemap: https://www.coastlinefilms.ca/sitemap.xml'
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
