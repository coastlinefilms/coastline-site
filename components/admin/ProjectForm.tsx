'use client'

import { useCallback, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteItem, saveProject } from '@/app/admin/actions'
import { PROJECT_TYPES, type Img, type Project } from '@/lib/types'
import {
  EditorHeader, ImageField, NumberField, Section, Select, SlugField, Switch, Text, Toast, useEditorKeys,
} from './fields'

const CREDITS = [
  ['director', 'Director'], ['dop', 'DOP'], ['producer', 'Producer'], ['edit', 'Edit'], ['colour', 'Colour'], ['sound', 'Sound'],
] as const

export default function ProjectForm({ project }: { project: Partial<Project> }) {
  const router = useRouter()
  const [p, setP] = useState<Partial<Project>>(project)
  const [saved, setSaved] = useState(JSON.stringify(project))
  const [toast, setToast] = useState<{ msg: string; err?: boolean }>({ msg: '' })
  const [pending, start] = useTransition()
  const status = (p.status ?? 'draft') as 'draft' | 'published'
  const dirty = JSON.stringify(p) !== saved
  const set = <K extends keyof Project>(k: K, v: Project[K] | null) => setP((s) => ({ ...s, [k]: v }))
  const gallery: Img[] = Array.from({ length: 6 }, (_, i) => p.gallery?.[i] ?? null)

  const flash = (msg: string, err = false) => {
    setToast({ msg, err })
    setTimeout(() => setToast({ msg: '' }), 3200)
  }

  const save = useCallback((next: 'draft' | 'published' = status) => {
    start(async () => {
      const res = await saveProject(p.id ?? null, { ...p, gallery, status: next })
      if (!res.ok) return flash(res.error, true)
      const updated = { ...p, gallery, id: res.id, status: next, slug: res.slug }
      setP(updated)
      setSaved(JSON.stringify(updated))
      flash(next === 'published' ? 'Published. Live on coastlinefilms.ca within a minute.' : status === 'published' ? 'Unpublished' : 'Draft saved')
      if (!p.id) router.replace(`/admin/projects/${res.id}`)
      else router.refresh()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p, status, router])

  useEditorKeys(dirty, () => save())

  return (
    <div className="wf-editor">
      <EditorHeader
        back="/admin/projects"
        title={p.name || 'New Project'}
        status={status}
        dirty={dirty}
        previewHref={p.id ? `/admin/preview/project/${p.id}` : undefined}
        pending={pending}
        primary={{ label: status === 'published' ? 'Publish changes' : 'Publish now', onClick: () => save('published') }}
        menu={[
          { label: 'Save as draft', onClick: () => save('draft'), hidden: status === 'published' },
          { label: 'View live project', onClick: () => window.open(`/projects/${p.slug}`, '_blank'), hidden: status !== 'published' },
          { label: 'Unpublish', onClick: () => confirm('Take this project off the site? Its URL will return a 404.') && save('draft'), hidden: status !== 'published' },
          { label: 'Delete item', danger: true, hidden: !p.id, onClick: () => confirm('Delete this project permanently? This cannot be undone.') && start(async () => { await deleteItem('project', p.id!) }) },
        ]}
      />
      <div className="wf-editor-body">
        <div className="wf-form">
          <Section title="Basic info" collapsible={false}>
            <Text label="Name" required value={p.name} onChange={(v) => set('name', v)} />
            <SlugField value={p.slug} onChange={(v) => set('slug', v)} prefix="projects" wasLive={project.status === 'published'} original={project.slug} />
          </Section>

          <Section title="Project Header" desc="Top of the project page: client, logo and header image">
            <Text label="Client" help="Shows above the project name and on Work cards" value={p.client} onChange={(v) => set('client', v)} />
            <ImageField label="Logo" value={p.logo ?? null} onChange={(v) => set('logo', v)} />
            <ImageField label="Header" value={p.header ?? null} onChange={(v) => set('header', v)} />
          </Section>

          <Section title="Work Card" desc="How the project appears in the Work grid and on the home page">
            <ImageField label="Thumbnail" value={p.thumbnail ?? null} onChange={(v) => set('thumbnail', v)} />
            <Text label="Hover Video Url" help="Short silent MP4 loop that plays when the card is hovered" value={p.hover_video_url} onChange={(v) => set('hover_video_url', v)} />
            <Switch label="Featured" help="Show this project in the home page work section" checked={!!p.featured} onChange={(v) => set('featured', v)} />
            <NumberField label="Sort Order" help="Order on the home page, lowest first" value={p.sort_order} onChange={(v) => set('sort_order', v)} />
          </Section>

          <Section title="Project Details" desc="The brief, project type and outcome">
            <Select label="Project Type" value={p.project_type} onChange={(v) => set('project_type', v)} options={PROJECT_TYPES.map((t) => ({ value: t, label: t }))} />
            <Text label="Brief" multiline value={p.brief} onChange={(v) => set('brief', v)} />
            <Text label="Outcome" multiline value={p.outcome} onChange={(v) => set('outcome', v)} />
          </Section>

          <Section title="Videos" desc="Vimeo IDs: the number at the end of the Vimeo link">
            <Text label="Hero Video" placeholder="e.g. 1191656304" value={p.hero_video} onChange={(v) => set('hero_video', v)} />
            <Text label="Video 2" value={p.video_2} onChange={(v) => set('video_2', v)} />
            <Text label="Video 3" value={p.video_3} onChange={(v) => set('video_3', v)} />
          </Section>

          <Section title="Gallery" desc="Six stills: one large, two small, then a row of three">
            {gallery.map((g, i) => (
              <ImageField key={i} label={`Gallery ${i + 1}`} value={g} onChange={(v) => set('gallery', gallery.map((x, j) => (j === i ? v : x)))} />
            ))}
          </Section>

          <Section title="Credits" desc="Empty credits are hidden on the page">
            {CREDITS.map(([k, l]) => <Text key={k} label={l} value={p[k] as string | null} onChange={(v) => set(k, v)} />)}
          </Section>

          <Section title="SEO" desc="Search title and description for this project page">
            <Text label="SEO Title" help="Page title for Google and Bing. Aim for under 60 characters, end with | Coastline Films." max={60} value={p.seo_title} onChange={(v) => set('seo_title', v)} />
            <Text label="Meta Description" help="Search snippet. Aim for 120 to 155 characters." max={155} multiline value={p.meta_description} onChange={(v) => set('meta_description', v)} />
          </Section>
        </div>
      </div>
      <Toast msg={toast.msg} err={toast.err} />
    </div>
  )
}
