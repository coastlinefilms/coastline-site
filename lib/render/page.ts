import pages from '@/content/pages.json'
import { listPosts, listProjects, getPost, getProject } from '@/lib/cms'
import { rewriteAssets } from './assets'
import { fillLists } from './lists'
import { renderProject } from './project'
import { renderPost } from './blog'

const PAGES = pages as Record<string, string>

export type Rendered = { status: number; html: string }

function notFound(): Rendered {
  return { status: 404, html: rewriteAssets(PAGES.__404) }
}

/** Render any public path exactly as Webflow served it. */
export async function renderPath(path: string): Promise<Rendered> {
  const p = path === '' ? '/' : path

  const staticHtml = PAGES[p]
  if (staticHtml && p !== '__404') {
    if (staticHtml.includes('<!--CMS:')) {
      const [projects, posts] = await Promise.all([listProjects(), listPosts()])
      return { status: 200, html: rewriteAssets(fillLists(staticHtml, { projects, posts })) }
    }
    return { status: 200, html: rewriteAssets(staticHtml) }
  }

  const m = p.match(/^\/(projects|blog)\/([^/]+)$/)
  if (m) {
    const slug = decodeURIComponent(m[2])
    if (m[1] === 'projects') {
      const proj = await getProject(slug)
      return proj ? { status: 200, html: rewriteAssets(renderProject(proj)) } : notFound()
    }
    const post = await getPost(slug)
    return post ? { status: 200, html: rewriteAssets(renderPost(post)) } : notFound()
  }

  return notFound()
}
