'use server'

import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { pingIndexNow } from '@/lib/indexnow'
import { purgeSite } from '@/lib/purge'
import { requireEditor, slugify } from '@/lib/admin'
import { serverClient } from '@/lib/supabase/server'
import type { Post, Project } from '@/lib/types'

type Result = { ok: true; id: string; slug: string } | { ok: false; error: string }

const POST_FIELDS = [
  'slug', 'name', 'excerpt', 'seo_title', 'meta_description', 'target_keyword', 'category', 'author',
  'reading_time_minutes', 'publish_date', 'hero_image', 'og_image', 'og_image_caption', 'vimeo_id',
  'body_part_1', 'body_part_2', 'body_part_3', 'section_image_1', 'section_image_1_caption',
  'section_image_2', 'section_image_2_caption', 'review_notes', 'related_project_id', 'related_post_ids',
  'journal_featured', 'status',
] as const

const PROJECT_FIELDS = [
  'slug', 'name', 'client', 'project_type', 'brief', 'outcome', 'featured', 'sort_order', 'header', 'logo',
  'thumbnail', 'hover_video_url', 'hero_video', 'video_2', 'video_3', 'gallery', 'director', 'dop', 'producer',
  'edit', 'colour', 'sound', 'seo_title', 'meta_description', 'status',
] as const

function pick<T extends object>(src: Partial<T>, keys: readonly string[]) {
  const out: Record<string, unknown> = {}
  for (const k of keys) if (k in src) out[k] = (src as Record<string, unknown>)[k] === '' ? null : (src as Record<string, unknown>)[k]
  return out
}

async function save(table: 'site_blog_posts' | 'site_projects', id: string | null, input: Record<string, unknown>): Promise<Result> {
  await requireEditor()
  const sb = await serverClient()
  const row = { ...input }
  if (!row.name || typeof row.name !== 'string') return { ok: false, error: 'Name is required.' }
  row.slug = slugify((row.slug as string) || (row.name as string))
  if (!row.slug) return { ok: false, error: 'Add a URL slug.' }
  // "published_at" doubles as the sitemap lastmod, so bump it on every save of a live item
  if (row.status === 'published') row.published_at = new Date().toISOString()

  const before = id ? (await sb.from(table).select('slug, status').eq('id', id).maybeSingle()).data : null

  const q = id ? sb.from(table).update(row).eq('id', id) : sb.from(table).insert(row)
  const { data, error } = await q.select('id, slug').single()
  if (error) {
    if (error.code === '23505') return { ok: false, error: `The URL "${row.slug}" is already used by another item.` }
    return { ok: false, error: error.message }
  }

  // Fresh pages for the next visitor (lists, the item itself, sitemap)
  await purgeSite()

  // Tell search engines (IndexNow) about every public URL this save changed, after the response is sent
  const base = table === 'site_projects' ? '/projects/' : '/blog/'
  const changed: string[] = []
  if (row.status === 'published') changed.push(base + data.slug)
  if (before?.status === 'published' && (row.status !== 'published' || before.slug !== data.slug)) changed.push(base + before.slug)
  if (changed.length) {
    changed.push(...(table === 'site_projects' ? ['/work', '/'] : ['/blog']))
    after(() => pingIndexNow(changed))
  }
  return { ok: true, id: data.id, slug: data.slug }
}

export async function savePost(id: string | null, input: Partial<Post>) {
  const row = pick(input, POST_FIELDS)
  const res = await save('site_blog_posts', id, row)
  if (res.ok && row.journal_featured === true) {
    // Only one post can be featured on /blog: unfeature the others once this save has gone through
    const sb = await serverClient()
    await sb.from('site_blog_posts').update({ journal_featured: false }).neq('id', res.id)
    await purgeSite()
  }
  return res
}

export async function saveProject(id: string | null, input: Partial<Project>) {
  return save('site_projects', id, pick(input, PROJECT_FIELDS))
}

export async function deleteItem(kind: 'post' | 'project', id: string) {
  await requireEditor()
  const sb = await serverClient()
  const table = kind === 'post' ? 'site_blog_posts' : 'site_projects'
  const { data: gone } = await sb.from(table).select('slug, status').eq('id', id).maybeSingle()
  const { error } = await sb.from(table).delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  await purgeSite()
  if (gone?.status === 'published') {
    after(() => pingIndexNow(kind === 'post' ? [`/blog/${gone.slug}`, '/blog'] : [`/projects/${gone.slug}`, '/work', '/']))
  }
  redirect(kind === 'post' ? '/admin/journal' : '/admin/projects')
}

export async function signOut() {
  const sb = await serverClient()
  await sb.auth.signOut()
  redirect('/admin/login')
}
