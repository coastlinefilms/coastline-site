import { notFound } from 'next/navigation'
import { requireEditor } from '@/lib/admin'
import ItemList from '@/components/admin/ItemList'
import ProjectForm from '@/components/admin/ProjectForm'
import type { Project } from '@/lib/types'

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { sb } = await requireEditor()
  let project: Partial<Project> = { status: 'draft', featured: false, gallery: [] }
  if (id !== 'new') {
    const { data } = await sb.from('site_projects').select('*').eq('id', id).maybeSingle()
    if (!data) notFound()
    project = data as Project
  }
  const { data: list } = await sb.from('site_projects').select('id, name, status').order('created_at', { ascending: false })
  return (
    <div className="wf-main">
      <div className="wf-itemview">
        <ItemList title="Projects" base="/admin/projects" items={(list ?? []) as { id: string; name: string; status: string }[]} activeId={project.id} />
        <ProjectForm key={project.id ?? 'new'} project={project} />
      </div>
    </div>
  )
}
