'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { signOut } from '@/app/admin/actions'
import { TABS, tabFor } from './nav'
import { IconExternal, IconLogout } from './icons'

/** Admin top bar, like Webflow's: site mark, the three workspaces, then the account menu. */
export default function TopNav({ email, siteName }: { email: string; siteName: string }) {
  const path = usePathname()
  const active = tabFor(path)
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !menu.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close) }
  }, [open])

  return (
    <header className="wf-top">
      <Link href="/admin/dashboard" className="wf-top-mark" aria-label={`${siteName} admin`}>
        <span className="wf-top-logo">CF</span>
        <span className="wf-top-site">{siteName}</span>
      </Link>
      <nav className="wf-top-tabs" aria-label="Admin sections">
        {TABS.map((t) => (
          <Link key={t.key} href={t.href} className={active === t.key ? 'on' : ''} aria-current={active === t.key ? 'page' : undefined}>
            {t.name}
          </Link>
        ))}
      </nav>
      <div className="wf-top-right">
        <a className="wf-btn" href="/" target="_blank" rel="noopener">View site <IconExternal size={13} /></a>
        <div className="wf-menu-wrap" ref={menu}>
          <button className="wf-avatar" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} title={email}>
            {(email[0] ?? '?').toUpperCase()}
          </button>
          {open && (
            <div className="wf-menu" role="menu">
              <div className="wf-menu-email">{email}</div>
              <hr />
              <form action={signOut}>
                <button type="submit" role="menuitem"><IconLogout /> Sign out</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
