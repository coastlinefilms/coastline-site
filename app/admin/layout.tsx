import './admin.css'
import Link from 'next/link'
import { getEditor } from '@/lib/supabase/server'
import { signOut } from './actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ed = await getEditor()
  return (
    <>
      {ed?.canEdit && (
        <header className="adm-top">
          <b>Coastline Films</b>
          <nav>
            <Link href="/admin/journal">Journal</Link>
            <Link href="/admin/projects">Projects</Link>
            <a href="/" target="_blank" rel="noopener">View site ↗</a>
          </nav>
          <span className="note">{ed.user.email}</span>
          <form action={signOut}>
            <button className="btn">Sign out</button>
          </form>
        </header>
      )}
      {children}
    </>
  )
}
