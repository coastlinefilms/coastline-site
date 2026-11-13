import seed from '@/content/seed.json'
import { publicClient } from '@/lib/supabase/public'
import { setupAllowed } from '@/lib/setup-auth'

export const runtime = 'nodejs'

// One-time import of the Webflow CMS export (content/seed.json) into Supabase.
// The database function checks its own single-use token, so this can only run once.
export async function POST(req: Request) {
  if (!setupAllowed(req)) return new Response('forbidden', { status: 403 })
  const { data, error } = await publicClient().rpc('site_seed', { payload: seed, token: process.env.SEED_TOKEN })
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })
  return Response.json({ ok: true, inserted: data })
}
export const GET = POST
