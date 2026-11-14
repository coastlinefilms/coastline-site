import { notFound } from 'next/navigation'
import { requireEditor } from '@/lib/admin'
import { normalizeSettings } from '@/lib/settings'
import { DASHBOARD_SECTIONS, type SectionSlug } from '@/components/admin/nav'
import Dashboard, { type DashboardExtra } from '@/components/admin/Dashboard'
import { buildInfo, domainStatus, STATIC_SITEMAP_COUNT } from '../data'

export default async function DashboardSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (!DASHBOARD_SECTIONS.some((s) => s.slug === section)) notFound()
  const ed = await requireEditor()
  const { data, error } = await ed.sb.from('site_settings').select('data, updated_at').eq('id', 1).maybeSingle()
  const settings = normalizeSettings(data?.data)

  const extra: DashboardExtra = { updatedAt: data?.updated_at ?? null, loadError: error?.message ?? null, me: ed.user.email ?? '' }
  if (section === 'site-access') {
    const r = await ed.sb.rpc('site_editors')
    extra.editors = r.data ?? []
  }
  if (section === 'publishing') {
    extra.domains = await domainStatus()
    extra.build = buildInfo()
  }
  if (section === 'seo') {
    const [p, b] = await Promise.all([
      ed.sb.from('site_projects').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      ed.sb.from('site_blog_posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    ])
    extra.sitemapCount = STATIC_SITEMAP_COUNT + (p.count ?? 0) + (b.count ?? 0)
  }
  if (section === 'backups') {
    const r = await ed.sb.from('site_backups').select('id, created_at, label, counts').order('created_at', { ascending: false }).limit(50)
    extra.backups = r.data ?? []
  }
  return <Dashboard key={section} section={section as SectionSlug} settings={settings} extra={extra} />
}
