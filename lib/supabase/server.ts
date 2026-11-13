import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './public'

/** Cookie-based client for the /admin area (acts as the signed-in user, so RLS applies). */
export async function serverClient() {
  const store = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          // called from a Server Component: cookies are read-only there
        }
      },
    },
  })
}

/** Returns the signed-in editor, or null if not signed in / not allowed to edit the site. */
export async function getEditor() {
  const sb = await serverClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const { data: canEdit } = await sb.rpc('site_can_edit')
  if (!canEdit) return { user, canEdit: false as const, sb }
  return { user, canEdit: true as const, sb }
}
