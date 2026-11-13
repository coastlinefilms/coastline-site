'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '@/app/admin/actions'
import { IconChevronRight, IconExternal, IconLogout, IconPlus, IconSearch } from './icons'

const COLLECTIONS = [
  { href: '/admin/journal', name: 'Blog Posts', key: 'posts' as const },
  { href: '/admin/projects', name: 'Projects', key: 'projects' as const },
]

const INSIGHTS = [
  { href: '/admin/insights', name: 'Site overview' },
  { href: '/admin/insights/pages', name: 'Pages' },
  { href: '/admin/insights/events', name: 'Events' },
  { href: '/admin/insights/sources', name: 'Traffic sources' },
  { href: '/admin/insights/audience', name: 'Audience' },
]

export default function Sidebar({ counts, email }: { counts: { posts: number; projects: number }; email: string }) {
  const path = usePathname()
  const [q, setQ] = useState('')
  const shown = COLLECTIONS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
  const insights = path.startsWith('/admin/insights')
  return (
    <aside className="wf-side">
      <div className="wf-tabs">
        <Link href="/admin/journal" className={!insights ? 'on' : ''}>CMS</Link>
        <Link href="/admin/insights" className={insights ? 'on' : ''}>Insights</Link>
      </div>
      {insights ? (
        <>
          <div className="wf-side-head"><h2>Insights</h2></div>
          <div className="wf-side-label">Analyze</div>
          {INSIGHTS.map((v) => (
            <Link key={v.href} href={v.href} className={`wf-coll ${path === v.href ? 'on' : ''}`}>
              <span className="count" style={{ color: 'inherit' }}>{v.name}</span>
              <span className="chev"><IconChevronRight size={14} /></span>
            </Link>
          ))}
        </>
      ) : (
      <>
      <div className="wf-side-head">
        <h2>CMS Collections</h2>
        <Link className="wf-iconbtn" href={path.startsWith('/admin/projects') ? '/admin/projects/new' : '/admin/journal/new'} title="New item">
          <IconPlus />
        </Link>
      </div>
      <label className="wf-search">
        <IconSearch />
        <input placeholder="Search Collections..." value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      {shown.map((c) => (
        <Link key={c.href} href={c.href} className={`wf-coll ${path.startsWith(c.href) ? 'on' : ''}`}>
          {c.name} <span className="count">{counts[c.key]} items</span>
          <span className="chev"><IconChevronRight size={14} /></span>
        </Link>
      ))}
      </>
      )}
      <div className="wf-side-foot">
        <a href="/" target="_blank" rel="noopener"><IconExternal /> View live site</a>
        <form action={signOut}>
          <button type="submit"><IconLogout /> Sign out</button>
        </form>
        <span className="email">{email}</span>
      </div>
    </aside>
  )
}
