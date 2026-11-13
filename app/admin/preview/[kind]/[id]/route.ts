import { getEditor } from '@/lib/supabase/server'
import { renderProject } from '@/lib/render/project'
import { renderPost } from '@/lib/render/blog'
import { rewriteAssets } from '@/lib/render/assets'
import type { Post, Project } from '@/lib/types'

export const runtime = 'nodejs'

// Renders a draft exactly as it will look live. Editors only, never cached or indexed.
export async function GET(_req: Request, ctx: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await ctx.params
  const ed = await getEditor()
  if (!ed?.canEdit) return Response.redirect(new URL('/admin/login', _req.url))
  const table = kind === 'project' ? 'site_projects' : 'site_blog_posts'
  const { data } = await ed.sb.from(table).select('*').eq('id', id).maybeSingle()
  if (!data) return new Response('Not found', { status: 404 })
  let html = kind === 'project' ? renderProject(data as Project) : renderPost(data as Post)
  html = rewriteAssets(html).replace('<head>', '<head><meta name="robots" content="noindex, nofollow">')
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' },
  })
}
