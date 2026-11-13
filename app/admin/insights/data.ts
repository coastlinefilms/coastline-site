import { requireEditor } from '@/lib/admin'
import { staticPageNames } from '@/lib/page-names'

export const RANGES = {
  '24h': { label: 'Last 24 hours', ms: 864e5 },
  '7d': { label: 'Last 7 days', ms: 7 * 864e5 },
  '30d': { label: 'Last 30 days', ms: 30 * 864e5 },
  '90d': { label: 'Last 90 days', ms: 90 * 864e5 },
  '365d': { label: 'Last 12 months', ms: 365 * 864e5 },
} as const
export type RangeKey = keyof typeof RANGES

export async function loadInsights(sp: { range?: string; device?: string }) {
  const { sb } = await requireEditor()
  const range = (sp.range && sp.range in RANGES ? sp.range : '7d') as RangeKey
  const device = ['desktop', 'mobile', 'tablet'].includes(sp.device ?? '') ? sp.device! : 'all'
  const to = new Date()
  const from = new Date(to.getTime() - RANGES[range].ms)
  const [{ data, error }, posts, projects] = await Promise.all([
    sb.rpc('site_insights', { p_from: from.toISOString(), p_to: to.toISOString(), p_device: device }),
    sb.from('site_blog_posts').select('slug, name'),
    sb.from('site_projects').select('slug, name'),
  ])
  const names: Record<string, { name: string; cms: boolean }> = {}
  for (const [p, n] of Object.entries(staticPageNames())) names[p] = { name: n, cms: false }
  for (const p of posts.data ?? []) names[`/blog/${p.slug}`] = { name: p.name, cms: true }
  for (const p of projects.data ?? []) names[`/projects/${p.slug}`] = { name: p.name, cms: true }
  return { data, error: error?.message ?? null, range, device, names }
}
