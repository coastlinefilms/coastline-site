import { requireEditor } from '@/lib/admin'
import CollectionTable, { type Row } from '@/components/admin/CollectionTable'
import type { Project } from '@/lib/types'

export default async function ProjectsTable() {
  const { sb } = await requireEditor()
  const { data } = await sb
    .from('site_projects')
    .select('id, slug, name, client, project_type, status, featured, sort_order, thumbnail, published_at, created_at, updated_at')
  const rows: Row[] = ((data ?? []) as Project[]).map((p) => ({
    id: p.id, name: p.name, slug: p.slug, status: p.status, published_at: p.published_at,
    created_at: p.created_at, updated_at: p.updated_at, thumb: p.thumbnail?.url,
    extra: { client: p.client ?? '', project_type: p.project_type ?? '', home: p.featured ? `Featured #${p.sort_order ?? '-'}` : '' },
  }))
  return (
    <CollectionTable
      title="Projects"
      base="/admin/projects"
      rows={rows}
      extraCols={[{ key: 'client', label: 'Client' }, { key: 'project_type', label: 'Project Type' }, { key: 'home', label: 'Home Page' }]}
    />
  )
}
