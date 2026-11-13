import { load } from 'cheerio'
import templates from '@/content/templates.json'
import type { Post } from '@/lib/types'
import { SITE, bindImg, bindText, formatDate, setHead } from './util'

const LOGO =
  'https://cdn.prod.website-files.com/69ecc5fb6fc18880aa9fc6c6/69fe6c7428307ab091c9a49f_Coastline%20Films%20copy.png'

function blogPostingJson(p: Post, canonical: string, image: string) {
  // Byte-compatible with the Webflow head embed (same keys, order and layout)
  const j = (v: unknown) => JSON.stringify(v ?? '').replace(/</g, '\\u003c')
  return `
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": ${j(p.name)},
  "description": ${j(p.excerpt)},
  "image": ${j(image)},
  "author": {"@type": "Organization", "name": "Coastline Films", "url": "${SITE}"},
  "publisher": {"@type": "Organization", "name": "Coastline Films", "logo": {"@type": "ImageObject", "url": "${LOGO}"}},
  "datePublished": ${j(p.publish_date)},
  "dateModified": ${j(p.published_at ?? p.publish_date)},
  "mainEntityOfPage": {"@type": "WebPage", "@id": ${j(canonical)}},
  "articleSection": ${j(p.category)},
  "keywords": ${j(p.target_keyword)},
  "inLanguage": "en-CA",
  "isPartOf": {"@id": "${SITE}/#website"}
}
`
}

/** Blog Posts Template (/blog/:slug). */
export function renderPost(p: Post): string {
  const $ = load((templates as { blog: string }).blog)
  const canonical = `${SITE}/blog/${p.slug}`
  // Webflow binds the share image to the Hero Image (OG Image is the fallback)
  const image = p.hero_image?.url || p.og_image?.url || ''

  setHead($, {
    title: p.seo_title || `${p.name} | Coastline Films`,
    description: p.meta_description ?? p.excerpt ?? '',
    ogTitle: `${p.name} | Coastline Films`,
    ogDescription: p.excerpt ?? '',
    ogImage: image,
    ogImageAlt: p.name,
    canonical,
  })
  $('html').attr('data-wf-item-slug', p.slug)
  $('head script[type="application/ld+json"]').each((_, el) => {
    if ($(el).text().includes('"BlogPosting"')) $(el).text(blogPostingJson(p, canonical, image))
  })

  // Hero
  const hero = $('.post-hero img.post-hero-img').first()
  bindImg(hero, p.hero_image, { alt: p.name })
  if (p.hero_image?.url) hero.attr('style', `background-image:url("${p.hero_image.url}")`)
  else hero.removeAttr('style')

  // Header
  bindText($('.post-eyebrow').first(), p.category)
  $('h1.post-title').first().text(p.name)
  bindText($('p.post-dek').first(), p.excerpt)
  bindText($('.post-byline-author').first(), p.author || 'Coastline Films')
  bindText($('.post-byline-meta').first(), formatDate(p.publish_date))

  // Body: part 1, image 1, part 2, image 2, part 3
  const parts = [p.body_part_1, p.body_part_2, p.body_part_3]
  $('.post-body-inner > .post-rich-text.w-richtext').each((i, el) => {
    $(el).html(parts[i] ?? '')
  })
  const figs = $('.post-body-inner > .post-section-figure').toArray()
  const sections = [
    { img: p.section_image_1, caption: p.section_image_1_caption, alt: p.target_keyword },
    { img: p.section_image_2, caption: p.section_image_2_caption, alt: p.name },
  ]
  figs.forEach((fig, i) => {
    const s = sections[i]
    if (!s) return
    bindImg($(fig).find('img').first(), s.img, { alt: s.img?.alt || s.alt || '', keepEmpty: true })
    bindText($(fig).find('.post-section-caption').first(), s.caption)
  })

  return $.html()
}
