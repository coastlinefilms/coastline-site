'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteItem, savePost } from '@/app/admin/actions'
import { BLOG_CATEGORIES, type Post } from '@/lib/types'
import { ImageField, RichText, Text, Toast, fromLocalInput, toLocalInput } from './fields'

export default function PostForm({ post, projects, posts }: {
  post: Partial<Post>
  projects: { id: string; name: string }[]
  posts: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [p, setP] = useState<Partial<Post>>(post)
  const [toast, setToast] = useState<{ msg: string; err?: boolean }>({ msg: '' })
  const [pending, start] = useTransition()
  const wasLive = post.status === 'published'
  const set = <K extends keyof Post>(k: K, v: Post[K] | null) => setP((s) => ({ ...s, [k]: v }))

  function flash(msg: string, err = false) {
    setToast({ msg, err })
    setTimeout(() => setToast({ msg: '' }), 3500)
  }

  function save(status?: 'draft' | 'published') {
    start(async () => {
      const res = await savePost(p.id ?? null, { ...p, status: status ?? p.status ?? 'draft' })
      if (!res.ok) return flash(res.error, true)
      setP((s) => ({ ...s, status: status ?? s.status, slug: res.slug }))
      flash(status === 'published' ? 'Published. Live on the site within a minute.' : 'Saved')
      if (!p.id) router.replace(`/admin/journal/${res.id}`)
      else router.refresh()
    })
  }

  return (
    <>
      <div className="row" style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>{p.id ? 'Edit post' : 'New post'}</h1>
        <span className={`pill ${p.status === 'published' ? 'pub' : ''}`}>{p.status}</span>
        <span className="sp" />
        {p.id && <a className="btn" href={`/admin/preview/post/${p.id}`} target="_blank" rel="noopener">Preview ↗</a>}
      </div>

      <div className="grid">
        <div>
          <div className="card">
            <h2>Post</h2>
            <Text label="Title" value={p.name} onChange={(v) => set('name', v)} />
            <Text label="Excerpt" multiline value={p.excerpt} onChange={(v) => set('excerpt', v)} hint="1 to 2 sentences. Shows under the title, on Journal cards and in social shares." />
            <ImageField label="Hero image" value={p.hero_image ?? null} onChange={(v) => set('hero_image', v)} hint="Also used as the social share image." />
          </div>

          <div className="card">
            <h2>Article</h2>
            <RichText label="Part 1: opening (first 2 paragraphs)" value={p.body_part_1} onChange={(v) => set('body_part_1', v)} />
            <ImageField label="Section image 1 (after part 1)" value={p.section_image_1 ?? null} onChange={(v) => set('section_image_1', v)} />
            <Text label="Section image 1 caption" value={p.section_image_1_caption} onChange={(v) => set('section_image_1_caption', v)} />
            <RichText label="Part 2: middle" value={p.body_part_2} onChange={(v) => set('body_part_2', v)} />
            <ImageField label="Section image 2 (after part 2)" value={p.section_image_2 ?? null} onChange={(v) => set('section_image_2', v)} />
            <Text label="Section image 2 caption" value={p.section_image_2_caption} onChange={(v) => set('section_image_2_caption', v)} />
            <RichText label="Part 3: closing (FAQ, CTA)" value={p.body_part_3} onChange={(v) => set('body_part_3', v)} />
          </div>
        </div>

        <div>
          <div className="card">
            <h2>Details</h2>
            <label>
              <span>Category</span>
              <select value={p.category ?? ''} onChange={(e) => set('category', e.target.value || null)}>
                <option value="">None</option>
                {BLOG_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>
              <span>Publish date</span>
              <input type="datetime-local" value={toLocalInput(p.publish_date)} onChange={(e) => set('publish_date', fromLocalInput(e.target.value))} />
            </label>
            <Text label="Author" value={p.author} onChange={(v) => set('author', v)} />
            <label>
              <span>Reading time (minutes)</span>
              <input type="number" min={1} value={p.reading_time_minutes ?? ''} onChange={(e) => set('reading_time_minutes', e.target.value ? Number(e.target.value) : null)} />
            </label>
            <label className="check">
              <input type="checkbox" checked={!!p.journal_featured} onChange={(e) => set('journal_featured', e.target.checked)} />
              Feature at the top of the Journal
            </label>
          </div>

          <div className="card">
            <h2>SEO</h2>
            <Text label="URL slug" value={p.slug} onChange={(v) => set('slug', v)} placeholder="auto from title" hint={`coastlinefilms.ca/blog/${p.slug || '…'}`} />
            {wasLive && p.slug !== post.slug && <p className="warn">Changing the URL of a live post breaks links to it and loses its Google ranking.</p>}
            <Text label="SEO title" value={p.seo_title} onChange={(v) => set('seo_title', v)} max={60} hint="Primary keyword first. Defaults to the title." />
            <Text label="Meta description" multiline value={p.meta_description} onChange={(v) => set('meta_description', v)} max={155} />
            <Text label="Target keyword" value={p.target_keyword} onChange={(v) => set('target_keyword', v)} />
          </div>

          <div className="card">
            <h2>Related</h2>
            <label>
              <span>Related project</span>
              <select value={p.related_project_id ?? ''} onChange={(e) => set('related_project_id', e.target.value || null)}>
                <option value="">None</option>
                {projects.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </label>
            <label>
              <span>Related posts</span>
              <select multiple style={{ minHeight: 120 }} value={p.related_post_ids ?? []} onChange={(e) => set('related_post_ids', Array.from(e.target.selectedOptions).map((o) => o.value))}>
                {posts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </label>
          </div>

          <div className="card">
            <h2>Internal notes</h2>
            <Text label="Review notes (never shown on the site)" multiline value={p.review_notes} onChange={(v) => set('review_notes', v)} />
          </div>
        </div>
      </div>

      <div className="savebar">
        <button className="btn" disabled={pending} onClick={() => save()}>{pending ? 'Saving…' : 'Save'}</button>
        {p.status !== 'published' ? (
          <button className="btn primary" disabled={pending} onClick={() => save('published')}>Publish</button>
        ) : (
          <>
            <button className="btn primary" disabled={pending} onClick={() => save('published')}>Update live post</button>
            <button className="btn" disabled={pending} onClick={() => confirm('Take this post off the site? Its URL will return a 404.') && save('draft')}>Unpublish</button>
          </>
        )}
        <span className="sp" />
        {p.id && (
          <button className="btn danger" disabled={pending} onClick={() => confirm('Delete this post permanently? This cannot be undone.') && start(async () => { await deleteItem('post', p.id!) })}>
            Delete
          </button>
        )}
      </div>
      <Toast msg={toast.msg} err={toast.err} />
    </>
  )
}
