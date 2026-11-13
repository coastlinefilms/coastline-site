import './admin.css'
import { getEditor } from '@/lib/supabase/server'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ed = await getEditor()
  const fonts = (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" />
    </>
  )
  if (!ed?.canEdit) return <>{fonts}{children}</>

  const [posts, projects] = await Promise.all([
    ed.sb.from('site_blog_posts').select('id', { count: 'exact', head: true }),
    ed.sb.from('site_projects').select('id', { count: 'exact', head: true }),
  ])
  return (
    <>
      {fonts}
      <div className="wf-shell">
        <Sidebar counts={{ posts: posts.count ?? 0, projects: projects.count ?? 0 }} email={ed.user.email ?? ''} />
        {children}
      </div>
    </>
  )
}
