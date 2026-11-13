import { load } from 'cheerio'
import templates from '@/content/templates.json'
import type { Project } from '@/lib/types'
import { SITE, bindImg, setHead, vimeoEmbed } from './util'

/**
 * Projects Template (/projects/:slug). The template is the live Webflow page for
 * one project, captured verbatim; every CMS-bound node is re-bound here.
 */
export function renderProject(p: Project): string {
  const $ = load((templates as { project: string }).project)
  const canonical = `${SITE}/projects/${p.slug}`
  const seoTitle = p.seo_title || `${p.name} | Coastline Films`
  const seoDesc = p.meta_description ?? p.brief ?? ''

  setHead($, { title: seoTitle, description: seoDesc, ogTitle: seoTitle, ogDescription: seoDesc, canonical })
  $('html').attr('data-wf-item-slug', p.slug)

  // Hero: logo, client eyebrow, title, header image
  bindImg($('.section-13 .image-10').first(), p.logo)
  $('.section-13 .cf-hero__eyebrow').first().text(p.client ?? '')
  $('.section-13 h1.cf-title').first().text(p.name)
  bindImg($('.section-13 .image-9').first(), p.header)

  // Brief
  $('.section-14 > div').eq(1).text(p.brief ?? '')

  // Videos: hero, then an optional row with video 2 and video 3
  const hero = $('section.herovideo').first()
  const extra = [p.video_2, p.video_3].filter((v): v is string => !!v)
  hero.html(
    (p.hero_video ? vimeoEmbed(p.hero_video) : '') +
      (extra.length ? `<div class="div-block-5">${extra.map(vimeoEmbed).join('')}</div>` : ''),
  )
  if (!p.hero_video && !extra.length) hero.remove()

  // Gallery: 6 fixed slots (1 big, 2 small, 3 thirds)
  const imgs = $('.cf-gallery-grid img').toArray()
  imgs.forEach((el, i) => bindImg($(el), p.gallery?.[i] ?? null))
  if (!(p.gallery ?? []).some((g) => g?.url)) $('section.section-15').remove()

  // Credits (empty ones are hidden client-side by the embed's own script)
  const credits = [p.director, p.dop, p.producer, p.edit, p.colour, p.sound]
  $('.cf-credits .cf-credit .value').each((i, el) => {
    $(el).text(credits[i] ?? '')
  })

  return $.html()
}
