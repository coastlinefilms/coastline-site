'use client'

import Link from 'next/link'
import { IconChevronRight, IconPlus } from './icons'

/** Narrow item column shown beside the editor, like Webflow's CMS item list. */
export default function ItemList({ title, base, items, activeId }: {
  title: string
  base: string
  items: { id: string; name: string; status: string }[]
  activeId?: string
}) {
  return (
    <div className="wf-items">
      <div className="wf-items-head">
        <h2>{title}</h2>
        <Link className="wf-iconbtn" href={`${base}/new`} title="New item"><IconPlus /></Link>
      </div>
      <div className="wf-items-col">Name</div>
      <div className="wf-items-list">
        {items.map((it) => (
          <Link key={it.id} href={`${base}/${it.id}`} className={`wf-item ${it.id === activeId ? 'on' : ''}`} title={it.name}>
            <span>{it.name}</span>
            {it.status !== 'published' && <i className="mini draft" title="Draft" />}
            <i className="chev"><IconChevronRight size={14} /></i>
          </Link>
        ))}
      </div>
    </div>
  )
}
