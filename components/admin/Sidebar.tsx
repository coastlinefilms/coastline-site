'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ANALYTICS_VIEWS, COLLECTIONS, DASHBOARD_SECTIONS, tabFor } from './nav'
import {
  IconApps, IconChevronRight, IconCode, IconFont, IconForm, IconHistory, IconHome, IconKey, IconPlus, IconRocket, IconSearch, IconSeo,
} from './icons'

const SECTION_ICON: Record<string, React.ReactNode> = {
  general: <IconHome />, 'site-access': <IconKey />, publishing: <IconRocket />, seo: <IconSeo />, forms: <IconForm />,
  fonts: <IconFont />, backups: <IconHistory />, integrations: <IconApps />, 'custom-code': <IconCode />,
}

export default function Sidebar({ counts }: { counts: { posts: number; projects: number } }) {
  const path = usePathname()
  const tab = tabFor(path)
  const [q, setQ] = useState('')

  if (tab === 'dashboard') {
    return (
      <aside className="wf-side">
        <div className="wf-side-head"><h2>Site settings</h2></div>
        <nav className="wf-side-nav">
          {DASHBOARD_SECTIONS.map((s) => {
            const href = `/admin/dashboard/${s.slug}`
            const on = path === href || (s.slug === 'general' && path === '/admin/dashboard')
            return (
              <Link key={s.slug} href={href} className={`wf-coll wf-setting ${on ? 'on' : ''}`} aria-current={on ? 'page' : undefined}>
                <span className="ic">{SECTION_ICON[s.slug]}</span>
                <span className="count" style={{ color: 'inherit' }}>{s.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    )
  }

  if (tab === 'analytics') {
    return (
      <aside className="wf-side">
        <div className="wf-side-head"><h2>Analytics</h2></div>
        <nav className="wf-side-nav">
          {ANALYTICS_VIEWS.map((v) => (
            <Link key={v.href} href={v.href} className={`wf-coll ${path === v.href ? 'on' : ''}`} aria-current={path === v.href ? 'page' : undefined}>
              <span className="count" style={{ color: 'inherit' }}>{v.name}</span>
              <span className="chev"><IconChevronRight size={14} /></span>
            </Link>
          ))}
        </nav>
      </aside>
    )
  }

  const shown = COLLECTIONS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <aside className="wf-side">
      <div className="wf-side-head">
        <h2>CMS Collections</h2>
        <Link className="wf-iconbtn" href={path.startsWith('/admin/projects') ? '/admin/projects/new' : '/admin/journal/new'} title="New item" aria-label="New item">
          <IconPlus />
        </Link>
      </div>
      <label className="wf-search">
        <IconSearch />
        <input placeholder="Search Collections..." value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <nav className="wf-side-nav">
        {shown.map((c) => (
          <Link key={c.href} href={c.href} className={`wf-coll ${path.startsWith(c.href) ? 'on' : ''}`}>
            {c.name} <span className="count">{counts[c.key]} items</span>
            <span className="chev"><IconChevronRight size={14} /></span>
          </Link>
        ))}
        {!shown.length && <div className="wf-empty" style={{ padding: '8px 16px' }}>No collections match.</div>}
      </nav>
    </aside>
  )
}
