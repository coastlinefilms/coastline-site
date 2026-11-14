import { load } from 'cheerio'
import templates from '@/content/templates.json'
import type { Project } from '@/lib/types'
import { SITE, bindImg, setHead, vimeoEmbed } from './util'
import { sortWork } from './lists'

/**
 * Projects Template (/projects/:slug). The template is the live Webflow page for
 * one project, captured verbatim; every CMS-bound node is re-bound here.
 */
export function renderProject(p: Project, all: Project[] = []): string {
  const $ = load((templates as { project: string }).project)
  const canonical = `${SITE}/projects/${p.slug}`
  const seoTitle = p.seo_title || `${p.name} | Coastline Films`
  const seoDesc = p.meta_description ?? p.brief ?? ''

  const share = p.header?.url ? p.header : p.thumbnail
  setHead($, {
    title: seoTitle,
    description: seoDesc,
    ogTitle: seoTitle,
    ogDescription: seoDesc,
    ogImage: share?.url ?? null,
    ogImageAlt: share?.alt ?? p.name,
    canonical,
  })
  // Webflow saved this embed with its quotes HTML-escaped, so it threw a syntax error and never ran
  $('.cf-vimeo-fix').remove()
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
  // No credits at all: drop the block (it left an empty gap with a divider)
  if (!credits.some((c) => c && c.trim())) $('.cf-credits').closest('section').remove()

  // Keep people moving: next project (same order as /work) + a booking prompt
  const order = sortWork(all.length ? all : [p])
  const at = order.findIndex((x) => x.slug === p.slug)
  const next = order.length > 1 ? order[(at + 1) % order.length] : null
  const footer = $('footer.footer').first()
  const block = nextAndCta(next)
  if (footer.length) footer.before(block)
  else $('body').append(block)

  return $.html()
}

const esc = (v: string | null | undefined) =>
  (v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function nextAndCta(next: Project | null): string {
  const img = next?.thumbnail?.url ?? next?.header?.url
  const card = next
    ? `<a class="cf-next__card" href="/projects/${esc(next.slug)}" aria-label="Next project: ${esc(next.client || next.name)}, ${esc(next.name)}">
      ${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : ''}
      <span class="cf-next__shade"></span>
      <span class="cf-next__text"><span class="cf-next__h">Next <strong>project</strong></span><span class="cf-next__name">${esc(next.client ? `${next.client}: ${next.name}` : next.name)}</span></span>
      <span class="cf-next__go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    </a>`
    : ''
  return `<style>
.cf-next{padding:24px 64px 0;font-family:Neuemontreal,'Neue Montreal',sans-serif}
.cf-next__card{position:relative;display:block;max-width:1312px;margin:0 auto;height:360px;border-radius:6px;overflow:hidden;background:#1c1e1d;color:#fff;text-decoration:none}
.cf-next__card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.22,.61,.36,1)}
.cf-next__card:hover img{transform:scale(1.03)}
.cf-next__shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(18,20,19,.82) 0%,rgba(18,20,19,.35) 55%,rgba(18,20,19,.1) 100%)}
.cf-next__text{position:absolute;left:48px;bottom:44px;right:140px;display:flex;flex-direction:column;gap:10px}
.cf-next__h{font-size:clamp(34px,4vw,56px);line-height:1.02;font-weight:400;letter-spacing:-.02em;color:#E4DDCB}
.cf-next__h strong{font-weight:700;color:#fff}
.cf-next__name{font-size:16px;line-height:1.4;color:rgba(228,221,203,.78)}
.cf-next__go{position:absolute;right:44px;bottom:44px;width:60px;height:60px;border-radius:50%;background:#E4DDCB;color:#121413;display:flex;align-items:center;justify-content:center;transition:transform .35s cubic-bezier(.22,.61,.36,1)}
.cf-next__go svg{width:22px;height:22px}
.cf-next__card:hover .cf-next__go{transform:translateX(4px)}
.cf-next__card:focus-visible{outline:2px solid #E4DDCB;outline-offset:4px}
.cf-cta{padding:112px 64px;text-align:center;font-family:Neuemontreal,'Neue Montreal',sans-serif}
.cf-cta__h{margin:0;font-size:clamp(38px,5vw,72px);line-height:1.02;font-weight:400;letter-spacing:-.02em;color:#E4DDCB}
.cf-cta__h strong{font-weight:700;color:#fff}
.cf-cta__p{margin:20px auto 0;max-width:480px;font-size:17px;line-height:1.55;color:rgba(228,221,203,.7)}
.cf-cta__btns{display:flex;justify-content:center;gap:12px;margin-top:36px;flex-wrap:wrap}
.cf-cta__btn{display:inline-flex;align-items:center;gap:10px;padding:16px 28px;border-radius:999px;font-size:16px;font-weight:500;text-decoration:none;transition:background-color .3s ease,color .3s ease,border-color .3s ease}
.cf-cta__btn.is-solid{background:#E4DDCB;color:#121413}
.cf-cta__btn.is-solid:hover{background:#fff}
.cf-cta__btn.is-line{border:1.5px solid rgba(228,221,203,.5);color:#E4DDCB}
.cf-cta__btn.is-line:hover{border-color:#E4DDCB;background:#E4DDCB;color:#121413}
@media(max-width:767px){
  .cf-next{padding:8px 20px 0}.cf-next__card{height:260px}
  .cf-next__text{left:24px;right:96px;bottom:26px}.cf-next__go{right:22px;bottom:26px;width:48px;height:48px}
  .cf-cta{padding:80px 24px}.cf-cta__btn{width:100%;justify-content:center}
}
</style>
${card ? `<section class="cf-next">${card}</section>` : ''}
<section class="cf-cta">
  <h2 class="cf-cta__h">Have a project in <strong>mind?</strong></h2>
  <p class="cf-cta__p">Free 30-minute discovery call. No deck, no pitch. We reply within one business day.</p>
  <div class="cf-cta__btns"><a class="cf-cta__btn is-solid" href="/contact">Book a call <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a><a class="cf-cta__btn is-line" href="/work">See all work</a></div>
</section>`
}
