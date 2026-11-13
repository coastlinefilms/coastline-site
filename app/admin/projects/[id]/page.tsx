import { notFound } from 'next/navigation'
import { requireEditor } from '@/lib/admin'
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
  return (
    <main className="adm-wrap">
      <ProjectForm project={project} />
    </main>
  )
}
