import { getEditor } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/** Download a backup as JSON (editors only). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const ed = await getEditor()
  if (!ed?.canEdit) return new Response('Not signed in', { status: 401 })
  const { id } = await ctx.params
  const { data, error } = await ed.sb.from('site_backups').select('created_at, label, snapshot').eq('id', id).maybeSingle()
  if (error || !data) return new Response('Backup not found', { status: 404 })
  const stamp = data.created_at.slice(0, 16).replace(/[:T]/g, '-')
  return new Response(JSON.stringify({ created_at: data.created_at, label: data.label, ...data.snapshot }, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="coastline-backup-${stamp}.json"`,
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
    },
  })
}
