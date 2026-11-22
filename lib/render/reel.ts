import type { Post } from '@/lib/types'
import { formatDate } from './util'

/**
 * Field Notes index, "The Reel" layout (Nov 2026): a horizontal strip of story frames up top,
 * then every post in a filterable three-column grid. The page shell lives in content/pages.json
 * ('/blog'); these fill its <!--CMS:reel*--> markers.
 */

const esc = (s: string | null | undefined) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

const slugify = (c: string | null | undefined) =>
  (c ?? '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function img(p: Post, sizes: string, eager = false) {
  const url = p.hero_image?.url
  if (!url) return ''
  const srcset = p.hero_image?.srcset ? ` srcset="${esc(p.hero_image.srcset)}" sizes="${sizes}"` : ''
  return `<img src="${esc(url)}"${srcset} alt="${esc(p.hero_image?.alt || p.name)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`
}

const minutes = (p: Post) => (p.reading_time_minutes ? `${p.reading_time_minutes} min` : '')

/** Strip: the featured post first, then the newest stories that aren't buyer guides, six frames at most. */
export function reelStrip(sorted: Post[]) {
  const featured = sorted.find((p) => p.journal_featured)
  const stories = sorted.filter((p) => p !== featured && slugify(p.category) !== 'buyer-guide')
  const pick = [...(featured ? [featured] : []), ...stories].slice(0, 6)
  return pick
    .map(
      (p, i) =>
        `<a class="cfrl-frame" href="/blog/${esc(p.slug)}" data-post-slug="${esc(p.slug)}">${img(p, '(max-width: 900px) 78vw, 400px', i < 3)}<span class="cfrl-frame__shade" aria-hidden="true"></span><span class="cfrl-frame__txt"><span class="cfrl-mono">${esc(minutes(p))}</span><span class="cfrl-frame__t">${esc(p.name)}</span></span></a>`,
    )
    .join('')
}

/** Filter chips: All plus every category that has at least one post. */
export function reelFilters(sorted: Post[]) {
  const cats: { slug: string; label: string }[] = []
  for (const p of sorted) {
    const slug = slugify(p.category)
    if (slug && !cats.some((c) => c.slug === slug)) cats.push({ slug, label: p.category as string })
  }
  const order = ['buyer-guide', 'project-breakdown', 'behind-the-scenes']
  cats.sort((a, b) => (order.indexOf(a.slug) + 1 || 99) - (order.indexOf(b.slug) + 1 || 99))
  const label = (c: { slug: string; label: string }) => (c.slug === 'buyer-guide' ? 'Buyer Guides' : c.label)
  return [
    `<button type="button" class="cfrl-chip" data-cat="all" aria-pressed="true">All</button>`,
    ...cats.map((c) => `<button type="button" class="cfrl-chip" data-cat="${c.slug}" aria-pressed="false">${esc(label(c))}</button>`),
  ].join('')
}

/** Grid: every post, newest first. */
export function reelGrid(sorted: Post[]) {
  return sorted
    .map((p) => {
      const meta = [p.category, minutes(p), formatDate(p.publish_date)].filter(Boolean).map(esc).join('&nbsp; / &nbsp;')
      return `<a class="cfrl-card" href="/blog/${esc(p.slug)}" data-post-slug="${esc(p.slug)}" data-cat="${slugify(p.category)}"><span class="cfrl-card__ph">${img(p, '(max-width: 900px) 100vw, 33vw')}</span><span class="cfrl-card__body"><span class="cfrl-mono">${meta}</span><span class="cfrl-card__t">${esc(p.name)}</span><span class="cfrl-card__ex">${esc(p.excerpt)}</span></span></a>`
    })
    .join('')
}
