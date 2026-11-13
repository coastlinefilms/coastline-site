'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState, useEffect } from 'react'
import { fmtDateTime } from '@/lib/admin-format'
import { IconExport, IconFilter, IconPlus, IconSearch, IconSortDown, IconSortUp } from './icons'

export type Row = {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
  thumb?: string | null
  extra: Record<string, string>
}

type Col = { key: string; label: string }

/** Webflow-style collection table: search, status filter, CSV export, sortable columns. */
export default function CollectionTable({ title, base, rows, extraCols }: {
  title: string
  base: string
  rows: Row[]
  extraCols: Col[]
}) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: 'created_at', dir: -1 })
  const menu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!menu.current?.contains(e.target as Node)) setFilterOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const val = (r: Row, k: string) =>
    k in r.extra ? r.extra[k] : String((r as unknown as Record<string, unknown>)[k] ?? '')

  const shown = useMemo(() => {
    const words = q.toLowerCase().trim()
    return rows
      .filter((r) => status === 'all' || r.status === status)
      .filter((r) => !words || `${r.name} ${r.slug} ${Object.values(r.extra).join(' ')}`.toLowerCase().includes(words))
      .sort((a, b) => val(a, sort.key).localeCompare(val(b, sort.key)) * sort.dir)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, status, sort])

  function exportCsv() {
    const cols = ['name', 'slug', 'status', 'published_at', 'created_at', 'updated_at', ...extraCols.map((c) => c.key)]
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`
    const csv = [cols.join(','), ...shown.map((r) => cols.map((c) => esc(val(r, c))).join(','))].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`
    a.click()
  }

  const Th = ({ k, label }: { k: string; label: string }) => (
    <th onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? ((-s.dir) as 1 | -1) : 1 }))}>
      {label}
      {sort.key === k && <span className="sort">{sort.dir === -1 ? <IconSortDown /> : <IconSortUp />}</span>}
    </th>
  )

  return (
    <div className="wf-main">
      <div className="wf-toolbar">
        <h1>{title}</h1>
        <label className="wf-search">
          <IconSearch />
          <input placeholder={`Search ${title.toLowerCase()}...`} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="wf-menu-wrap" ref={menu}>
          <button className={`wf-btn ${status !== 'all' ? 'on' : ''}`} onClick={() => setFilterOpen((o) => !o)}>
            <IconFilter size={14} /> {status === 'all' ? 'Filter' : status === 'published' ? 'Published' : 'Drafts'}
          </button>
          {filterOpen && (
            <div className="wf-menu">
              {(['all', 'published', 'draft'] as const).map((s) => (
                <button key={s} onClick={() => { setStatus(s); setFilterOpen(false) }}>
                  {s === 'all' ? 'All items' : s === 'published' ? 'Published' : 'Drafts'}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="wf-btn" onClick={exportCsv}><IconExport size={14} /> Export</button>
        <Link className="wf-btn blue" href={`${base}/new`}><IconPlus size={14} /> New item</Link>
      </div>
      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead>
            <tr>
              <Th k="name" label="Name" />
              <Th k="published_at" label="Published" />
              <Th k="status" label="Status" />
              {extraCols.map((c) => <Th key={c.key} k={c.key} label={c.label} />)}
              <Th k="created_at" label="Created" />
              <Th k="updated_at" label="Modified" />
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} onClick={() => router.push(`${base}/${r.id}`)}>
                <td>{r.name}</td>
                <td>
                  {r.status === 'published'
                    ? <><span className="dot" />{fmtDateTime(r.published_at)}</>
                    : <><span className="dot draft" />Not Published</>}
                </td>
                <td className={r.status === 'published' ? 'st-pub' : 'st-draft'}>{r.status === 'published' ? 'Published' : 'Draft'}</td>
                {extraCols.map((c) => <td key={c.key} className="dim">{r.extra[c.key] || '-'}</td>)}
                <td>{fmtDateTime(r.created_at)}</td>
                <td>{fmtDateTime(r.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && <div className="wf-empty">No items match.</div>}
      </div>
      <div className="wf-foot">Showing {shown.length ? `1-${shown.length}` : '0'} of {rows.length}</div>
    </div>
  )
}
