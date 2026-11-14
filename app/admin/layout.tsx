import './admin.css'
import type { Metadata } from 'next'
import { getEditor } from '@/lib/supabase/server'
import { normalizeSettings } from '@/lib/settings'
import Sidebar from '@/components/admin/Sidebar'
import TopNav from '@/components/admin/TopNav'

// Never index the admin (the X-Robots-Tag header in next.config.ts covers non-HTML responses too)
export const metadata: Metadata = {
  title: 'Coastline Films admin',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

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

  const [posts, projects, settings] = await Promise.all([
    ed.sb.from('site_blog_posts').select('id', { count: 'exact', head: true }),
    ed.sb.from('site_projects').select('id', { count: 'exact', head: true }),
    ed.sb.from('site_settings').select('data').eq('id', 1).maybeSingle(),
  ])
  const siteName = normalizeSettings(settings.data?.data).general.siteName
  return (
    <>
      {fonts}
      <div className="wf-app">
        <TopNav email={ed.user.email ?? ''} siteName={siteName} />
        <div className="wf-shell">
          <Sidebar counts={{ posts: posts.count ?? 0, projects: projects.count ?? 0 }} />
          {children}
        </div>
      </div>
    </>
  )
}
