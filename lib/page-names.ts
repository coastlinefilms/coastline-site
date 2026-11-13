import pages from '@/content/pages.json'

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')

/** Human page names for analytics, like Webflow's page list ("Home", "Contact", blog post titles). */
export function staticPageNames(): Record<string, string> {
  const out: Record<string, string> = { '/': 'Home' }
  for (const [path, html] of Object.entries(pages as Record<string, string>)) {
    if (path === '/' || path.startsWith('__')) continue
    const t = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]
    if (!t) continue
    const first = decode(t).split(' | ')[0].trim()
    out[path] = first === 'Coastline Films' ? path.slice(1) : first
  }
  return out
}
