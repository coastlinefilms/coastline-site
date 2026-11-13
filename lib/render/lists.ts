import templates from '@/content/templates.json'
import type { Post, Project } from '@/lib/types'

type T = Record<string, string>
const tpl = templates as unknown as T

// Webflow's escaping, byte-for-byte: attributes escape & < > " ', text leaves " alone,
// and embed (raw) text only escapes & < >.
const escAttr = (s: string | null | undefined) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
const escText = (s: string | null | undefined) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#x27;')
const escRaw = (s: string | null | undefined) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function fill(t: string, values: Record<string, string>) {
  return t.replace(/\{\{(\w+)\}\}/g, (_, k: string) => values[k] ?? '')
}

function projectItem(t: string, p: Project) {
  return fill(t, {
    thumb_url: escAttr(p.thumbnail?.url),
    thumb_alt: escAttr(p.thumbnail?.alt ?? p.name),
    hover_url: escAttr(p.hover_video_url),
    slug_js: JSON.stringify(p.slug).replace(/</g, '\\u003c'),
    client: escRaw(p.client),
    name: escRaw(p.name),
  })
}

function postItem(t: string, p: Post) {
  let out = fill(t, {
    slug: escAttr(p.slug),
    img_srcset: escAttr(p.hero_image?.srcset),
    img_url: escAttr(p.hero_image?.url),
    name_attr: escAttr(p.name),
    category: escText(p.category),
    name: escText(p.name),
    excerpt: escText(p.excerpt),
  })
  if (!p.hero_image?.srcset) out = out.replace(/ sizes="[^"]*" srcset=""/, '').replace(/ srcset=""/, '')
  return out
}

/** Work grid order on Webflow: newest first. */
export function sortWork(projects: Project[]) {
  return [...projects].sort(
    (a, b) => b.created_at.localeCompare(a.created_at) || (b.webflow_id ?? b.id).localeCompare(a.webflow_id ?? a.id),
  )
}

/** Home "featured work": featured projects by Sort Order. */
export function homeFeatured(projects: Project[]) {
  return projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.sort_order ?? 1e9) - (b.sort_order ?? 1e9) || a.created_at.localeCompare(b.created_at))
}

/** Journal order: newest publish date first. */
export function sortPosts(posts: Post[]) {
  return [...posts].sort(
    (a, b) =>
      (b.publish_date ?? '').localeCompare(a.publish_date ?? '') || b.created_at.localeCompare(a.created_at),
  )
}

export function fillLists(html: string, data: { projects: Project[]; posts: Post[] }) {
  return html.replace(/<!--CMS:(\w+)-->/g, (_, name: string) => {
    switch (name) {
      case 'home':
        return homeFeatured(data.projects).map((p) => projectItem(tpl.home, p)).join('')
      case 'work':
        return sortWork(data.projects).map((p) => projectItem(tpl.work, p)).join('')
      case 'journalFeatured': {
        const sorted = sortPosts(data.posts)
        const f = sorted.find((p) => p.journal_featured) ?? sorted[0]
        return f ? postItem(tpl.journalFeatured, f) : ''
      }
      case 'journalGrid':
        return sortPosts(data.posts).map((p) => postItem(tpl.journalGrid, p)).join('')
      default:
        return ''
    }
  })
}
