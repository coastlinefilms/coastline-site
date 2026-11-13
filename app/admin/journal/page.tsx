import { requireEditor } from '@/lib/admin'
import { fmtDate } from '@/lib/admin-format'
import CollectionTable, { type Row } from '@/components/admin/CollectionTable'
import type { Post } from '@/lib/types'

export default async function BlogPostsTable() {
  const { sb } = await requireEditor()
  const { data } = await sb
    .from('site_blog_posts')
    .select('id, slug, name, status, category, publish_date, hero_image, journal_featured, published_at, created_at, updated_at')
  const rows: Row[] = ((data ?? []) as Post[]).map((p) => ({
    id: p.id, name: p.name, slug: p.slug, status: p.status, published_at: p.published_at,
    created_at: p.created_at, updated_at: p.updated_at, thumb: p.hero_image?.url,
    extra: { category: p.category ?? '', publish_date: p.publish_date ? fmtDate(p.publish_date) : '', featured: p.journal_featured ? 'Featured' : '' },
  }))
  return (
    <CollectionTable
      title="Blog Posts"
      base="/admin/journal"
      rows={rows}
      extraCols={[{ key: 'category', label: 'Category' }, { key: 'publish_date', label: 'Publish Date' }]}
    />
  )
}
