'use client'

import { useCallback, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteItem, savePost } from '@/app/admin/actions'
import { BLOG_CATEGORIES, type Post } from '@/lib/types'
import {
  DateField, EditorHeader, ImageField, MultiRef, NumberField, RichText, Section, Select, SlugField, Switch, Text, Toast, useEditorKeys,
} from './fields'

export default function PostForm({ post, projects, posts }: {
  post: Partial<Post>
  projects: { id: string; name: string }[]
  posts: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [p, setP] = useState<Partial<Post>>(post)
  const [saved, setSaved] = useState(JSON.stringify(post))
  const [toast, setToast] = useState<{ msg: string; err?: boolean }>({ msg: '' })
  const [pending, start] = useTransition()
  const status = (p.status ?? 'draft') as 'draft' | 'published'
  const dirty = JSON.stringify(p) !== saved
  const set = <K extends keyof Post>(k: K, v: Post[K] | null) => setP((s) => ({ ...s, [k]: v }))

  const flash = (msg: string, err = false) => {
    setToast({ msg, err })
    setTimeout(() => setToast({ msg: '' }), 3200)
  }

  const save = useCallback((next: 'draft' | 'published' = status) => {
    start(async () => {
      const res = await savePost(p.id ?? null, { ...p, status: next })
      if (!res.ok) return flash(res.error, true)
      const updated = { ...p, id: res.id, status: next, slug: res.slug }
      setP(updated)
      setSaved(JSON.stringify(updated))
      flash(next === 'published' ? 'Published. Live on coastlinefilms.ca within a minute.' : status === 'published' ? 'Unpublished' : 'Draft saved')
      if (!p.id) router.replace(`/admin/journal/${res.id}`)
      else router.refresh()
    })
  }, [p, status, router])

  useEditorKeys(dirty, () => save())

  return (
    <div className="wf-editor">
      <EditorHeader
        back="/admin/journal"
        title={p.name || 'New Blog Post'}
        status={status}
        dirty={dirty}
        previewHref={p.id ? `/admin/preview/post/${p.id}` : undefined}
        pending={pending}
        primary={{ label: status === 'published' ? 'Publish changes' : 'Publish now', onClick: () => save('published') }}
        menu={[
          { label: 'Save as draft', onClick: () => save('draft'), hidden: status === 'published' },
          { label: 'View live post', onClick: () => window.open(`/blog/${p.slug}`, '_blank'), hidden: status !== 'published' },
          { label: 'Unpublish', onClick: () => confirm('Take this post off the site? Its URL will return a 404.') && save('draft'), hidden: status !== 'published' },
          { label: 'Delete item', danger: true, hidden: !p.id, onClick: () => confirm('Delete this post permanently? This cannot be undone.') && start(async () => { await deleteItem('post', p.id!) }) },
        ]}
      />
      <div className="wf-editor-body">
        <div className="wf-form">
          <Section title="Basic info" collapsible={false}>
            <Text label="Name" required value={p.name} onChange={(v) => set('name', v)} />
            <SlugField value={p.slug} onChange={(v) => set('slug', v)} prefix="blog" wasLive={post.status === 'published'} original={post.slug} />
          </Section>

          <Section title="Hero & Metadata" desc="Top-of-post essentials: hero image, category, date, byline, excerpt">
            <ImageField label="Hero Image" value={p.hero_image ?? null} onChange={(v) => set('hero_image', v)} help="Also used as the social share image." alt={false} />
            <Text label="Excerpt" multiline help="1 to 2 sentence summary for cards and previews" value={p.excerpt} onChange={(v) => set('excerpt', v)} />
            <Select
              label="Category"
              help="Topic cluster for SEO - keep posts aligned to one of these verticals"
              value={p.category}
              onChange={(v) => set('category', v)}
              options={BLOG_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <DateField label="Publish Date" value={p.publish_date} onChange={(v) => set('publish_date', v)} />
            <Text label="Author" help="Who wrote the post. Defaults to Coastline Films." value={p.author} onChange={(v) => set('author', v)} />
            <NumberField label="Reading Time Minutes" help="Estimated minutes to read - integer only" value={p.reading_time_minutes} onChange={(v) => set('reading_time_minutes', v)} />
            <Switch label="Featured on the Journal" help="Shows this post in the Featured slot at the top of /journal. Only one post can be featured." checked={!!p.journal_featured} onChange={(v) => set('journal_featured', v)} />
          </Section>

          <Section title="Section 1 (Opening + Image 1)" desc="First 2 paragraphs of the article, followed by the first inline image and optional caption">
            <RichText label="Post Body Part 1" help="First section of the article - the opening 2 paragraphs. Image 1 appears after this." value={p.body_part_1} onChange={(v) => set('body_part_1', v)} />
            <ImageField label="Section Image 1" help="First inline image break - renders after Post Body Part 1." value={p.section_image_1 ?? null} onChange={(v) => set('section_image_1', v)} />
            <Text label="Section Image 1 Caption" help="Optional caption for Section Image 1. Leave blank for no caption." value={p.section_image_1_caption} onChange={(v) => set('section_image_1_caption', v)} />
          </Section>

          <Section title="Section 2 (Middle + Image 2)" desc="Middle section of the article, followed by the second inline image and optional caption">
            <RichText label="Post Body Part 2" help="Middle section of the article. Image 2 appears after this." value={p.body_part_2} onChange={(v) => set('body_part_2', v)} />
            <ImageField label="Section Image 2" help="Second inline image break - renders after Post Body Part 2." value={p.section_image_2 ?? null} onChange={(v) => set('section_image_2', v)} />
            <Text label="Section Image 2 Caption" help="Optional caption for Section Image 2. Leave blank for no caption." value={p.section_image_2_caption} onChange={(v) => set('section_image_2_caption', v)} />
          </Section>

          <Section title="Section 3 (Closing)" desc="Final section of the article - FAQ, CTA, closing paragraph">
            <RichText label="Post Body Part 3" help="Closing section of the article." value={p.body_part_3} onChange={(v) => set('body_part_3', v)} />
          </Section>

          <Section title="SEO" desc="Search engine optimization fields - title, description, keyword, social share image and its caption">
            <Text label="SEO Title" help="Under 60 characters, primary keyword first" max={60} value={p.seo_title} onChange={(v) => set('seo_title', v)} />
            <Text label="Meta Description" help="Under 155 characters" max={155} multiline value={p.meta_description} onChange={(v) => set('meta_description', v)} />
            <Text label="Target Keyword" value={p.target_keyword} onChange={(v) => set('target_keyword', v)} />
            <ImageField label="OG Image" help="Social share image - 1200x630. Only used when there is no Hero Image." value={p.og_image ?? null} onChange={(v) => set('og_image', v)} alt={false} />
            <Text label="OG Image Caption" help="Optional caption for the OG Image. Leave blank for no caption." value={p.og_image_caption} onChange={(v) => set('og_image_caption', v)} />
          </Section>

          <Section title="Related Content" desc="Link this post to a project or to other posts for internal linking">
            <Select label="Related Project" value={p.related_project_id} onChange={(v) => set('related_project_id', v)} options={projects.map((o) => ({ value: o.id, label: o.name }))} />
            <MultiRef label="Related Posts" help="Link 2-3 related posts for internal linking" value={p.related_post_ids ?? []} options={posts} onChange={(v) => set('related_post_ids', v)} />
          </Section>

          <Section title="Legacy / Internal" desc="Vimeo ID and internal review notes - not shown on live page" defaultOpen={false}>
            <Text label="Vimeo ID" help="Optional embedded video" value={p.vimeo_id} onChange={(v) => set('vimeo_id', v)} />
            <Text label="Review Notes" multiline help="Internal: what Jacob needs to add before publishing. Do not show on the page." value={p.review_notes} onChange={(v) => set('review_notes', v)} />
          </Section>
        </div>
      </div>
      <Toast msg={toast.msg} err={toast.err} />
    </div>
  )
}
