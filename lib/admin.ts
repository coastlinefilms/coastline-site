import { redirect } from 'next/navigation'
import { getEditor } from '@/lib/supabase/server'

/** Use at the top of every admin page/action. Redirects to login when needed. */
export async function requireEditor() {
  const ed = await getEditor()
  if (!ed) redirect('/admin/login')
  if (!ed.canEdit) redirect('/admin/login?denied=1')
  return ed
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
