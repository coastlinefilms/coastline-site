import type { CheerioAPI, Cheerio } from 'cheerio'
import type { AnyNode } from 'domhandler'
import type { Img } from '@/lib/types'

export const SITE = 'https://www.coastlinefilms.ca'

const dateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Toronto',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

/** "October 19, 2026" in the site's time zone (matches Webflow's date format). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return dateFmt.format(new Date(iso))
}

type HeadFields = {
  title?: string | null
  description?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  ogImage?: string | null
  ogImageAlt?: string | null
  canonical: string
}

/** Update the Webflow head tags that are bound to CMS fields. */
export function setHead($: CheerioAPI, f: HeadFields) {
  if (f.title != null) $('head > title').text(f.title)
  const set = (sel: string, v: string | null | undefined) => {
    if (v == null) return
    $(sel).attr('content', v)
  }
  set('meta[name="description"]', f.description)
  set('meta[property="og:title"]', f.ogTitle)
  set('meta[name="twitter:title"]', f.ogTitle)
  set('meta[property="og:description"]', f.ogDescription)
  set('meta[name="twitter:description"]', f.ogDescription)
  set('meta[property="og:image"]', f.ogImage)
  set('meta[name="twitter:image"]', f.ogImage)
  set('meta[property="og:image:alt"]', f.ogImageAlt)
  set('meta[property="og:url"]', f.canonical)
  $('link[rel="canonical"]').attr('href', f.canonical)
}

/** Bind an image field to an <img>, Webflow-style. Removes the element when empty unless keepEmpty. */
export function bindImg(el: Cheerio<AnyNode>, img: Img, opts: { alt?: string | null; keepEmpty?: boolean } = {}) {
  if (!img?.url) {
    if (opts.keepEmpty) {
      el.attr('src', '').removeAttr('srcset').removeAttr('sizes')
      el.addClass('w-dyn-bind-empty')
      if (opts.alt != null) el.attr('alt', opts.alt)
    } else {
      el.remove()
    }
    return
  }
  el.removeClass('w-dyn-bind-empty')
  el.attr('src', img.url)
  const alt = opts.alt !== undefined ? opts.alt : img.alt
  if (alt != null && alt !== '') el.attr('alt', alt)
  else el.attr('alt', '')
  if (img.srcset) {
    el.attr('srcset', img.srcset)
    if (!el.attr('sizes')) el.attr('sizes', '100vw')
  } else {
    el.removeAttr('srcset')
    el.removeAttr('sizes')
  }
}

/** Bind plain text; Webflow adds w-dyn-bind-empty to empty bound text elements. */
export function bindText(el: Cheerio<AnyNode>, v: string | null | undefined) {
  if (v == null || v === '') {
    el.text('')
    el.addClass('w-dyn-bind-empty')
  } else {
    el.removeClass('w-dyn-bind-empty')
    el.text(v)
  }
}

export function vimeoEmbed(id: string) {
  const src = `https://player.vimeo.com/video/${encodeURIComponent(id)}?title=0&byline=0&portrait=0`
  return `<div class="w-embed"><div style="position:relative;padding-top:56.25%;background:#000">
<iframe src="${src}"
style="position:absolute;inset:0;width:100%;height:100%;border:0"
allowfullscreen></iframe>
</div></div>`
}
