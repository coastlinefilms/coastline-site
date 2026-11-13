'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'
import type { Img } from '@/lib/types'
import {
  IconArrowLeft, IconCalendar, IconChevronDown, IconExternal, IconEye, IconLink, IconReplace, IconTrash, IconUpload, IconX,
} from './icons'

/* ---------------- layout ---------------- */

export function Section({ title, desc, children, collapsible = true, defaultOpen = true }: {
  title: string
  desc?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={`wf-section ${collapsible ? 'collapsible' : ''} ${open ? '' : 'closed'}`}>
      <div className="wf-section-head" onClick={() => collapsible && setOpen((o) => !o)}>
        <div className="titles">
          <h2>{title}</h2>
          {desc && <p>{desc}</p>}
        </div>
        {collapsible && <span className="wf-iconbtn toggle"><IconChevronDown /></span>}
      </div>
      <div className="wf-fields">{children}</div>
    </section>
  )
}

export function Field({ label, help, required, counter, children }: {
  label: string
  help?: string
  required?: boolean
  counter?: { n: number; max: number }
  children: React.ReactNode
}) {
  return (
    <div className="wf-field">
      <span className="lbl">
        {label}
        {required && <span className="req">*</span>}
        {counter && <span className={`counter ${counter.n > counter.max ? 'over' : ''}`}>{counter.n} / {counter.max}</span>}
      </span>
      {help && <div className="help">{help}</div>}
      {children}
    </div>
  )
}

/* ---------------- inputs ---------------- */

export function Text({ label, value, onChange, help, multiline, placeholder, max, required }: {
  label: string
  value: string | null | undefined
  onChange: (v: string) => void
  help?: string
  multiline?: boolean
  placeholder?: string
  max?: number
  required?: boolean
}) {
  const v = value ?? ''
  return (
    <Field label={label} help={help} required={required} counter={max ? { n: v.length, max } : undefined}>
      {multiline ? (
        <textarea value={v} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="wf-input" type="text" value={v} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  )
}

export function NumberField({ label, value, onChange, help }: {
  label: string; value: number | null | undefined; onChange: (v: number | null) => void; help?: string
}) {
  return (
    <Field label={label} help={help}>
      <input className="wf-input" type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />
    </Field>
  )
}

export function Select({ label, value, onChange, options, help, placeholder = 'Select...' }: {
  label: string
  value: string | null | undefined
  onChange: (v: string | null) => void
  options: { value: string; label: string }[]
  help?: string
  placeholder?: string
}) {
  return (
    <Field label={label} help={help}>
      <div className="wf-select">
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <IconChevronDown />
      </div>
    </Field>
  )
}

export function Switch({ label, checked, onChange, help }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; help?: string
}) {
  return (
    <Field label={label} help={help}>
      <label className="wf-switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <i />
        <span>{checked ? 'On' : 'Off'}</span>
      </label>
    </Field>
  )
}

export function DateField({ label, value, onChange, help }: {
  label: string; value: string | null | undefined; onChange: (iso: string | null) => void; help?: string
}) {
  return (
    <Field label={label} help={help}>
      <div className="wf-date">
        <span><IconCalendar /></span>
        <input type="datetime-local" value={toLocalInput(value)} onChange={(e) => onChange(fromLocalInput(e.target.value))} />
      </div>
    </Field>
  )
}

export function SlugField({ value, onChange, prefix, wasLive, original }: {
  value: string | null | undefined
  onChange: (v: string) => void
  prefix: string
  wasLive: boolean
  original?: string | null
}) {
  const v = value ?? ''
  return (
    <Field label="Slug" required>
      <input className="wf-input" type="text" value={v} placeholder="Generated from the name" onChange={(e) => onChange(e.target.value)} />
      <div className="wf-urlrow"><IconLink /><span>www.coastlinefilms.ca/{prefix}/<b>{v || '…'}</b></span></div>
      {wasLive && original && v !== original && (
        <div className="wf-warn">Changing the slug of a published item breaks every link to the old URL and loses its Google ranking.</div>
      )}
    </Field>
  )
}

/** Multi-reference picker shown as removable chips. */
export function MultiRef({ label, help, value, options, onChange }: {
  label: string
  help?: string
  value: string[]
  options: { id: string; name: string }[]
  onChange: (v: string[]) => void
}) {
  const byId = new Map(options.map((o) => [o.id, o.name]))
  return (
    <Field label={label} help={help}>
      <div className="wf-chips">
        {value.map((id) => (
          <span className="wf-chip" key={id}>
            <span>{byId.get(id) ?? 'Removed item'}</span>
            <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((x) => x !== id))}><IconX /></button>
          </span>
        ))}
        <select value="" onChange={(e) => e.target.value && onChange([...value, e.target.value])}>
          <option value="">{value.length ? 'Add another…' : 'Select items…'}</option>
          {options.filter((o) => !value.includes(o.id)).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
    </Field>
  )
}

/* ---------------- image ---------------- */

function displayName(url: string) {
  let f = decodeURIComponent(url.split('/').pop() ?? '')
  while (/^[0-9a-f]{24}_/.test(f)) f = f.slice(25)
  if (f.length <= 36) return f
  return f.slice(0, 20) + '...' + f.slice(-14)
}

function fmtBytes(n: number) {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${(n / 1024).toFixed(1)} kB`
}

/** Webflow-style image field: card with thumbnail, file name, dimensions and size; Replace / Delete. */
export function ImageField({ label, value, onChange, help, alt = true }: {
  label: string
  value: Img
  onChange: (v: Img) => void
  help?: string
  alt?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [over, setOver] = useState(false)
  const [meta, setMeta] = useState<{ w?: number; h?: number; size?: number }>({})

  useEffect(() => {
    setMeta({})
    if (!value?.url) return
    let live = true
    fetch(value.url, { method: 'HEAD' })
      .then((r) => { const n = Number(r.headers.get('content-length')); if (live && n) setMeta((m) => ({ ...m, size: n })) })
      .catch(() => {})
    return () => { live = false }
  }, [value?.url])

  async function pick(file: File) {
    setBusy(true)
    setErr('')
    try {
      const clean = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, '-')
      const blob = await upload(`site/uploads/${clean}`, file, { access: 'public', handleUploadUrl: '/api/admin/upload' })
      onChange({ url: blob.url, alt: value?.alt ?? '' })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  const dropProps = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setOver(true) },
    onDragLeave: () => setOver(false),
    onDrop: (e: React.DragEvent) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) pick(f) },
  }

  return (
    <Field label={label} help={help}>
      {value?.url ? (
        <>
          <div className="wf-img" {...dropProps}>
            <div className="thumb">
              <img src={value.url} alt="" onLoad={(e) => { const i = e.currentTarget; setMeta((m) => ({ ...m, w: i.naturalWidth, h: i.naturalHeight })) }} />
            </div>
            <div className="info">
              <div className="name" title={decodeURIComponent(value.url.split('/').pop() ?? '')}>{busy ? 'Uploading…' : displayName(value.url)}</div>
              <div className="meta">
                {meta.w ? `${meta.w} x ${meta.h}` : ''}{meta.w && meta.size ? ' • ' : ''}{meta.size ? fmtBytes(meta.size) : ''}
              </div>
              <a href={value.url} target="_blank" rel="noopener" title="Open image"><IconExternal /></a>
            </div>
          </div>
          <div className="wf-img-actions">
            <button type="button" className="wf-btn" disabled={busy} onClick={() => input.current?.click()}><IconReplace /> Replace</button>
            <button type="button" className="wf-btn" disabled={busy} onClick={() => onChange(null)}><IconTrash /> Delete</button>
          </div>
          {alt && (
            <div className="wf-alt">
              <input className="wf-input" type="text" placeholder="Alt text: describe the image for Google and screen readers" value={value.alt ?? ''} onChange={(e) => onChange({ ...value, alt: e.target.value })} />
            </div>
          )}
        </>
      ) : (
        <div className={`wf-drop ${over ? 'over' : ''}`} onClick={() => input.current?.click()} {...dropProps}>
          <IconUpload />
          <span>{busy ? 'Uploading…' : 'Drop an image here or click to upload'}</span>
        </div>
      )}
      {err && <div className="wf-warn">{err}</div>}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = '' }} />
    </Field>
  )
}

/* ---------------- rich text ---------------- */

const KEEP_SELECTOR = '[data-rt-embed-type], figure, iframe, script, style'

/** Visual editor with an HTML view. Code embeds, iframes and figures are locked so they survive edits. */
export function RichText({ label, value, onChange, help }: {
  label: string
  value: string | null | undefined
  onChange: (v: string) => void
  help?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'visual' | 'html'>('visual')
  const [src, setSrc] = useState(value ?? '')

  useEffect(() => {
    if (mode !== 'visual' || !ref.current) return
    ref.current.innerHTML = src
    ref.current.querySelectorAll(KEEP_SELECTOR).forEach((el) => el.setAttribute('contenteditable', 'false'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  function read() {
    if (!ref.current) return src
    const clone = ref.current.cloneNode(true) as HTMLElement
    clone.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'))
    return clone.innerHTML
  }
  function sync() {
    const html = read()
    setSrc(html)
    onChange(html)
  }
  function cmd(c: string, arg?: string) {
    ref.current?.focus()
    document.execCommand(c, false, arg)
    sync()
  }
  function link() {
    const url = prompt('Link URL (https://… or /page)')
    if (!url) return
    cmd('createLink', url)
    // Site rule: links open in a new tab
    ref.current?.querySelectorAll('a[href]').forEach((a) => {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener')
    })
    sync()
  }

  return (
    <Field label={label} help={help}>
      <div className="rte">
        <div className="rte-bar">
          {mode === 'visual' && (
            <>
              <button type="button" onClick={() => cmd('formatBlock', 'P')} title="Paragraph">¶</button>
              <button type="button" onClick={() => cmd('formatBlock', 'H2')}>H2</button>
              <button type="button" onClick={() => cmd('formatBlock', 'H3')}>H3</button>
              <i className="sep" />
              <button type="button" onClick={() => cmd('bold')}><b>B</b></button>
              <button type="button" onClick={() => cmd('italic')}><i>I</i></button>
              <button type="button" onClick={link}>Link</button>
              <button type="button" onClick={() => cmd('unlink')}>Unlink</button>
              <i className="sep" />
              <button type="button" onClick={() => cmd('insertUnorderedList')}>• List</button>
              <button type="button" onClick={() => cmd('insertOrderedList')}>1. List</button>
              <button type="button" onClick={() => cmd('formatBlock', 'BLOCKQUOTE')}>Quote</button>
              <button type="button" onClick={() => cmd('removeFormat')}>Clear</button>
            </>
          )}
          <span className="sp" />
          <button type="button" className={mode === 'visual' ? 'on' : ''} onClick={() => mode === 'html' && setMode('visual')}>Visual</button>
          <button type="button" className={mode === 'html' ? 'on' : ''} onClick={() => { if (mode === 'visual') { sync(); setMode('html') } }}>HTML</button>
        </div>
        {mode === 'visual' ? (
          <div ref={ref} className="rte-body" contentEditable suppressContentEditableWarning onInput={sync} onBlur={sync} />
        ) : (
          <textarea className="rte-src" value={src} onChange={(e) => { setSrc(e.target.value); onChange(e.target.value) }} />
        )}
      </div>
    </Field>
  )
}

/* ---------------- editor chrome ---------------- */

export type Action = { label: string; onClick: () => void; danger?: boolean; hidden?: boolean }

/** Top bar of the item editor: back, title, status, preview, "Publish now" split button. */
export function EditorHeader({ back, title, status, dirty, previewHref, primary, menu, pending }: {
  back: string
  title: string
  status: 'draft' | 'published'
  dirty: boolean
  previewHref?: string
  primary: Action
  menu: Action[]
  pending: boolean
}) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const label = dirty ? 'Unsaved changes' : status === 'published' ? 'Published' : 'Draft'
  const dot = dirty ? 'amber' : status === 'published' ? '' : 'draft'
  return (
    <div className="wf-editor-head">
      <Link className="wf-iconbtn" href={back} title="Back to collection"><IconArrowLeft /></Link>
      <h1>{title}</h1>
      <span className={`wf-status ${status === 'published' && !dirty ? 'st-pub' : ''}`}><span className={`dot ${dot}`} />{label}</span>
      {previewHref && <a className="wf-iconbtn" href={previewHref} target="_blank" rel="noopener" title="Preview"><IconEye /></a>}
      <div className="wf-menu-wrap" ref={wrap}>
        <div className="wf-split">
          <button className="wf-btn blue" disabled={pending} onClick={primary.onClick}>{pending ? 'Saving…' : primary.label}</button>
          <button className="wf-btn blue" disabled={pending} onClick={() => setOpen((o) => !o)} aria-label="More actions"><IconChevronDown size={14} /></button>
        </div>
        {open && (
          <div className="wf-menu">
            {menu.filter((m) => !m.hidden).map((m, i) => (
              <button key={i} className={m.danger ? 'danger' : ''} onClick={() => { setOpen(false); m.onClick() }}>{m.label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function Toast({ msg, err }: { msg: string; err?: boolean }) {
  if (!msg) return null
  return <div className={`wf-toast ${err ? 'err' : ''}`}>{msg}</div>
}

/** Warn before leaving with unsaved changes, and save on Cmd/Ctrl+S. */
export function useEditorKeys(dirty: boolean, onSave: () => void) {
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    const keys = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); onSave() } }
    window.addEventListener('beforeunload', before)
    window.addEventListener('keydown', keys)
    return () => { window.removeEventListener('beforeunload', before); window.removeEventListener('keydown', keys) }
  }, [dirty, onSave])
}

/* ---------------- time helpers (Toronto) ---------------- */

export function toLocalInput(iso: string | null | undefined) {
  if (!iso) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(iso))
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  return `${g('year')}-${g('month')}-${g('day')}T${g('hour') === '24' ? '00' : g('hour')}:${g('minute')}`
}

export function fromLocalInput(v: string) {
  if (!v) return null
  const guess = new Date(v + ':00Z')
  const tz = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Toronto', timeZoneName: 'shortOffset' })
    .formatToParts(guess).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-5'
  const m = tz.match(/GMT([+-]\d+)(?::(\d+))?/)
  const offMin = m ? Number(m[1]) * 60 + (Number(m[1]) < 0 ? -1 : 1) * Number(m[2] ?? 0) : -300
  return new Date(guess.getTime() - offMin * 60000).toISOString()
}
