import pages from '@/content/pages.json'
import { listPosts, listProjects, getPost, getProject } from '@/lib/cms'
import { rewriteAssets } from './assets'
import { applyFooter } from './footer'
import { fillLists } from './lists'
import { renderProject } from './project'
import { renderPost } from './blog'

const PAGES = pages as Record<string, string>

export type Rendered = { status: number; html: string }

/** First-party analytics beacon (see public/cf-a.js). */
function track(html: string, status = 200) {
  const tag = `<script defer src="/cf-a.js" data-status="${status}"></script>`
  const i = html.lastIndexOf('</body>')
  return i === -1 ? html + tag : html.slice(0, i) + tag + html.slice(i)
}

/** Mosaic-style trailing cursor, home page only (see public/cf-cursor.js). */
function homeCursor(html: string) {
  const tag = '<script defer src="/cf-cursor.js"></script>'
  const i = html.lastIndexOf('</body>')
  return i === -1 ? html + tag : html.slice(0, i) + tag + html.slice(i)
}

function notFound(): Rendered {
  return { status: 404, html: track(rewriteAssets(applyFooter(PAGES.__404)), 404) }
}

/** Render any public path exactly as Webflow served it. */
export async function renderPath(path: string): Promise<Rendered> {
  const p = path === '' ? '/' : path

  const staticHtml = PAGES[p]
  if (staticHtml && p !== '__404') {
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
      const proj = await getProject(slug)
      return proj ? { status: 200, html: track(rewriteAssets(applyFooter(renderProject(proj)))) } : notFound()
    }
    const post = await getPost(slug)
    return post ? { status: 200, html: track(rewriteAssets(applyFooter(renderPost(post)))) } : notFound()
  }

  return notFound()
}
