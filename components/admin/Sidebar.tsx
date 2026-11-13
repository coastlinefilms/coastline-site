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

export default function Sidebar({ counts, email }: { counts: { posts: number; projects: number }; email: string }) {
  const path = usePathname()
  const [q, setQ] = useState('')
  const shown = COLLECTIONS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <aside className="wf-side">
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
