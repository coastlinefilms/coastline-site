import pages from '@/content/pages.json'
import { listPosts, listProjects, getPost, getProject } from '@/lib/cms'
import { rewriteAssets } from './assets'
import { phonePerf } from './perf'
import { applyFooter } from './footer'
import { fillLists } from './lists'
import { renderProject } from './project'
import { renderPost } from './blog'
import { addToHead, projectVideoJsonLd } from './video-schema'
import { applySettings, getSettings, matchRedirect } from '@/lib/settings'

const PAGES = pages as Record<string, string>

export type Rendered = { status: number; html: string; location?: string }

/** First-party analytics beacon (see public/cf-a.js). */
function track(html: string, status = 200) {
  const tag = `<script defer src="/cf-a.js" data-status="${status}"></script>`
  html = phonePerf(html)
  const i = html.lastIndexOf('</body>')
  return i === -1 ? html + tag : html.slice(0, i) + tag + html.slice(i)
}

/** Mosaic-style trailing cursor, home page only (see public/cf-cursor.js). */
function homeCursor(html: string) {
  const tag = '<script defer src="/cf-cursor.js"></script>'
  const i = html.lastIndexOf('</body>')
  return i === -1 ? html + tag : html.slice(0, i) + tag + html.slice(i)
}

/**
 * Branded 404 (Nov 2026): the Privacy page's shell (nav, styles, footer) with the
 * legal copy swapped for a short message and two ways forward.
 */
const NOT_FOUND = (() => {
  // The old Privacy page's site shell (nav, styles, footer), kept for the 404 when /privacy became a plain legal page
  const base = PAGES.__shell404 ?? PAGES['/privacy']
  const a = base.indexOf('<section class="cc-legal">')
  const b = base.indexOf('</section>', a)
  if (a === -1 || b === -1) return PAGES.__404
  const body = `<style>
.cf-404{min-height:78svh;display:flex;align-items:center;justify-content:center;padding:160px 24px 96px;text-align:center;font-family:Neuemontreal,'Neue Montreal',sans-serif}
.cf-404__h{margin:0;font-size:clamp(44px,7vw,104px);line-height:1;font-weight:400;letter-spacing:-.03em;color:#E4DDCB}
.cf-404__h strong{font-weight:700;color:#fff}
.cf-404__p{margin:22px auto 0;max-width:460px;font-size:17px;line-height:1.55;color:rgba(228,221,203,.7)}
.cf-404__btns{display:flex;justify-content:center;gap:12px;margin-top:36px;flex-wrap:wrap}
.cf-404__btn{display:inline-flex;align-items:center;gap:10px;padding:16px 28px;border-radius:999px;font-size:16px;font-weight:500;text-decoration:none;transition:background-color .3s ease,color .3s ease,border-color .3s ease}
.cf-404__btn.is-solid{background:#E4DDCB;color:#121413}.cf-404__btn.is-solid:hover{background:#fff}
.cf-404__btn.is-line{border:1.5px solid rgba(228,221,203,.5);color:#E4DDCB}.cf-404__btn.is-line:hover{background:#E4DDCB;border-color:#E4DDCB;color:#121413}
.cf-404__home{display:inline-block;margin-top:28px;font-size:15px;color:rgba(228,221,203,.62);text-decoration:underline;text-underline-offset:4px;text-decoration-color:rgba(228,221,203,.3)}
.cf-404__home:hover{color:#E4DDCB}
@media(max-width:600px){.cf-404__btn{width:100%;justify-content:center}}
</style>
<section class="cf-404"><div>
  <h1 class="cf-404__h">Page not <strong>found.</strong></h1>
  <p class="cf-404__p">This page has moved or never existed. Here is where to go next.</p>
  <div class="cf-404__btns"><a class="cf-404__btn is-solid" href="/work">See the work <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a><a class="cf-404__btn is-line" href="/contact">Book a call</a></div>
  <a class="cf-404__home" href="/">Back to home</a>
</div></section>`
  return (base.slice(0, a) + body + base.slice(b + '</section>'.length))
    .replace(/<title>[\s\S]*?<\/title>/, '<title>Page not found | Coastline Films</title>')
    .replace(/<link href="[^"]*" rel="canonical"\/?>/, '')
    // the shell carried the Privacy page's description; give the 404 its own
    .replace(/<meta content="[^"]*" name="description"\/?>/, '<meta content="This page has moved or never existed. See the work or book a call with Coastline Films." name="description"/>')
    .replace('<meta charset="utf-8"/>', '<meta charset="utf-8"/><meta name="robots" content="noindex"/>')
})()

function notFound(): Rendered {
  return { status: 404, html: track(rewriteAssets(applyFooter(NOT_FOUND)), 404) }
}

/** Render a public path: Dashboard redirects first (like Webflow's 301s), then the page, then site settings. */
export async function renderPath(path: string): Promise<Rendered> {
  const settings = await getSettings()
  const r = matchRedirect(path || '/', settings.publishing.redirects)
  if (r) return { status: r.code, html: '', location: r.to }
  const out = await renderCore(path)
  return { ...out, html: applySettings(out.html, settings) }
}

/** Render any public path exactly as Webflow served it. */
async function renderCore(path: string): Promise<Rendered> {
  const p = path === '' ? '/' : path

  const staticHtml = PAGES[p]
  if (staticHtml && !p.startsWith('__')) {
    if (staticHtml.includes('<!--CMS:')) {
      const [projects, posts] = await Promise.all([listProjects(), listPosts()])
      const html = track(rewriteAssets(applyFooter(fillLists(staticHtml, { projects, posts }))))
      return { status: 200, html: p === '/' ? homeCursor(html) : html }
    }
    const html = track(rewriteAssets(applyFooter(staticHtml)))
    return { status: 200, html: p === '/' ? homeCursor(html) : html }
  }

  const m = p.match(/^\/(projects|blog)\/([^/]+)$/)
  if (m) {
    const slug = decodeURIComponent(m[2])
    if (m[1] === 'projects') {
      const [proj, all] = await Promise.all([getProject(slug), listProjects()])
      if (!proj) return notFound()
      const videoLd = await projectVideoJsonLd(proj)
      return { status: 200, html: track(rewriteAssets(applyFooter(addToHead(renderProject(proj, all), videoLd)))) }
    }
    const post = await getPost(slug)
    return post ? { status: 200, html: track(rewriteAssets(applyFooter(renderPost(post)))) } : notFound()
  }

  return notFound()
}
