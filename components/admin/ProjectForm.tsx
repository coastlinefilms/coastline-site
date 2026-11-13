'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteItem, saveProject } from '@/app/admin/actions'
import { PROJECT_TYPES, type Img, type Project } from '@/lib/types'
import { ImageField, Text, Toast } from './fields'

const GALLERY_LABELS = ['Gallery 1 (large)', 'Gallery 2', 'Gallery 3', 'Gallery 4', 'Gallery 5', 'Gallery 6']
const CREDITS = [
  ['director', 'Director'], ['dop', 'DOP'], ['producer', 'Producer'], ['edit', 'Edit'], ['colour', 'Colour'], ['sound', 'Sound'],
] as const

export default function ProjectForm({ project }: { project: Partial<Project> }) {
  const router = useRouter()
  const [p, setP] = useState<Partial<Project>>(project)
  const [toast, setToast] = useState<{ msg: string; err?: boolean }>({ msg: '' })
  const [pending, start] = useTransition()
  const wasLive = project.status === 'published'
  const set = <K extends keyof Project>(k: K, v: Project[K] | null) => setP((s) => ({ ...s, [k]: v }))
  const gallery: Img[] = Array.from({ length: 6 }, (_, i) => p.gallery?.[i] ?? null)

  function flash(msg: string, err = false) {
    setToast({ msg, err })
    setTimeout(() => setToast({ msg: '' }), 3500)
  }

  function save(status?: 'draft' | 'published') {
    start(async () => {
      const res = await saveProject(p.id ?? null, { ...p, gallery, status: status ?? p.status ?? 'draft' })
      if (!res.ok) return flash(res.error, true)
      setP((s) => ({ ...s, status: status ?? s.status, slug: res.slug }))
      flash(status === 'published' ? 'Published. Live on the site within a minute.' : 'Saved')
      if (!p.id) router.replace(`/admin/projects/${res.id}`)
      else router.refresh()
    })
  }

  return (
    <>
      <div className="row" style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>{p.id ? 'Edit project' : 'New project'}</h1>
        <span className={`pill ${p.status === 'published' ? 'pub' : ''}`}>{p.status}</span>
        <span className="sp" />
        {p.id && <a className="btn" href={`/admin/preview/project/${p.id}`} target="_blank" rel="noopener">Preview ↗</a>}
      </div>

      <div className="grid">
        <div>
          <div className="card">
            <h2>Project</h2>
            <Text label="Project name" value={p.name} onChange={(v) => set('name', v)} />
            <Text label="Client" value={p.client} onChange={(v) => set('client', v)} hint="Shows above the title and on Work cards." />
            <Text label="Project brief" multiline value={p.brief} onChange={(v) => set('brief', v)} />
          </div>
          <div className="card">
            <h2>Images</h2>
            <ImageField label="Header (top of the project page)" value={p.header ?? null} onChange={(v) => set('header', v)} />
            <ImageField label="Thumbnail (Work grid and home page cards)" value={p.thumbnail ?? null} onChange={(v) => set('thumbnail', v)} />
            <ImageField label="Client logo" value={p.logo ?? null} onChange={(v) => set('logo', v)} />
            {gallery.map((g, i) => (
              <ImageField key={i} label={GALLERY_LABELS[i]} value={g} onChange={(v) => set('gallery', gallery.map((x, j) => (j === i ? v : x)))} />
            ))}
          </div>
          <div className="card">
            <h2>Video</h2>
            <Text label="Hero video (Vimeo ID)" value={p.hero_video} onChange={(v) => set('hero_video', v)} placeholder="e.g. 1191656304" hint="The number at the end of the Vimeo link." />
            <Text label="Video 2 (Vimeo ID)" value={p.video_2} onChange={(v) => set('video_2', v)} />
            <Text label="Video 3 (Vimeo ID)" value={p.video_3} onChange={(v) => set('video_3', v)} />
            <Text label="Hover video URL (MP4)" value={p.hover_video_url} onChange={(v) => set('hover_video_url', v)} hint="Short silent loop that plays when someone hovers the card." />
          </div>
        </div>

        <div>
          <div className="card">
            <h2>Placement</h2>
            <label>
              <span>Project type</span>
              <select value={p.project_type ?? ''} onChange={(e) => set('project_type', e.target.value || null)}>
                <option value="">None</option>
                {PROJECT_TYPES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="check">
              <input type="checkbox" checked={!!p.featured} onChange={(e) => set('featured', e.target.checked)} />
              Feature on the home page
            </label>
            <label>
              <span>Sort order (home page)</span>
              <input type="number" min={0} value={p.sort_order ?? ''} onChange={(e) => set('sort_order', e.target.value ? Number(e.target.value) : null)} />
            </label>
          </div>
          <div className="card">
            <h2>Credits</h2>
            {CREDITS.map(([k, l]) => <Text key={k} label={l} value={p[k] as string | null} onChange={(v) => set(k, v)} />)}
          </div>
          <div className="card">
            <h2>SEO</h2>
            <Text label="URL slug" value={p.slug} onChange={(v) => set('slug', v)} placeholder="auto from name" hint={`coastlinefilms.ca/projects/${p.slug || '…'}`} />
            {wasLive && p.slug !== project.slug && <p className="warn">Changing the URL of a live project breaks links to it and loses its Google ranking.</p>}
            <Text label="SEO title" value={p.seo_title} onChange={(v) => set('seo_title', v)} max={60} hint="End with | Coastline Films." />
            <Text label="Meta description" multiline value={p.meta_description} onChange={(v) => set('meta_description', v)} max={155} />
          </div>
        </div>
      </div>

      <div className="savebar">
        <button className="btn" disabled={pending} onClick={() => save()}>{pending ? 'Saving…' : 'Save'}</button>
        {p.status !== 'published' ? (
          <button className="btn primary" disabled={pending} onClick={() => save('published')}>Publish</button>
        ) : (
          <>
            <button className="btn primary" disabled={pending} onClick={() => save('published')}>Update live project</button>
            <button className="btn" disabled={pending} onClick={() => confirm('Take this project off the site? Its URL will return a 404.') && save('draft')}>Unpublish</button>
          </>
        )}
        <span className="sp" />
        {p.id && (
          <button className="btn danger" disabled={pending} onClick={() => confirm('Delete this project permanently? This cannot be undone.') && start(async () => { await deleteItem('project', p.id!) })}>
            Delete
          </button>
        )}
      </div>
      <Toast msg={toast.msg} err={toast.err} />
    </>
  )
}
