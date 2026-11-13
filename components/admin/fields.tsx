'use client'

import { useEffect, useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'
import type { Img } from '@/lib/types'

export function Text({ label, value, onChange, hint, multiline, placeholder, max }: {
  label: string
  value: string | null | undefined
  onChange: (v: string) => void
  hint?: string
  multiline?: boolean
  placeholder?: string
  max?: number
}) {
  const v = value ?? ''
  return (
    <label>
      <span>
        {label}
        {max ? <em style={{ float: 'right', fontStyle: 'normal', color: v.length > max ? '#e0b46a' : undefined }}>{v.length}/{max}</em> : null}
      </span>
      {multiline ? (
        <textarea value={v} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" value={v} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <small>{hint}</small>}
    </label>
  )
}

/** Image picker: uploads to Vercel Blob, keeps alt text with the image. */
export function ImageField({ label, value, onChange, hint }: {
  label: string
  value: Img
  onChange: (v: Img) => void
  hint?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function pick(file: File) {
    setBusy(true)
    setErr('')
    try {
      const clean = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, '-')
      const blob = await upload(`site/uploads/${clean}`, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload',
      })
      onChange({ url: blob.url, alt: value?.alt ?? '' })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <span style={{ display: 'block', fontSize: 12, color: 'var(--dim)', marginBottom: 6 }}>{label}</span>
      <div className="img-field">
        {value?.url ? <img className="prev" src={value.url} alt="" /> : <div className="prev" />}
        <div className="meta">
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button type="button" className="btn" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? 'Uploading…' : value?.url ? 'Replace' : 'Upload'}
            </button>
            {value?.url && <button type="button" className="btn danger" onClick={() => onChange(null)}>Remove</button>}
          </div>
          {value?.url && (
            <input
              type="text"
              style={{ marginTop: 10 }}
              placeholder="Alt text (describe the image for Google and screen readers)"
              value={value.alt ?? ''}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
            />
          )}
          {hint && <small className="note" style={{ display: 'block', marginTop: 6 }}>{hint}</small>}
          {err && <p className="warn">{err}</p>}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) pick(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}

const KEEP_SELECTOR = '[data-rt-embed-type], figure, iframe, script, style'

/** Rich text: visual editor with a raw HTML view. Embeds (iframes, code embeds) are kept intact. */
export function RichText({ label, value, onChange, hint }: {
  label: string
  value: string | null | undefined
  onChange: (v: string) => void
  hint?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'visual' | 'html'>('visual')
  const [src, setSrc] = useState(value ?? '')

  // Load content into the editable area when switching to visual mode
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
    // External links open in a new tab, like the rest of the site
    ref.current?.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || ''
      if (/^https?:\/\//.test(href) && !href.includes('coastlinefilms.ca')) {
        a.setAttribute('target', '_blank')
        a.setAttribute('rel', 'noopener')
      }
    })
    sync()
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <span style={{ display: 'block', fontSize: 12, color: 'var(--dim)', marginBottom: 6 }}>{label}</span>
      <div className="rte">
        <div className="rte-bar">
          {mode === 'visual' && (
            <>
              <button type="button" onClick={() => cmd('formatBlock', 'P')}>¶</button>
              <button type="button" onClick={() => cmd('formatBlock', 'H2')}>H2</button>
              <button type="button" onClick={() => cmd('formatBlock', 'H3')}>H3</button>
              <button type="button" onClick={() => cmd('bold')}><b>B</b></button>
              <button type="button" onClick={() => cmd('italic')}><i>I</i></button>
              <button type="button" onClick={() => cmd('insertUnorderedList')}>• List</button>
              <button type="button" onClick={() => cmd('insertOrderedList')}>1. List</button>
              <button type="button" onClick={() => cmd('formatBlock', 'BLOCKQUOTE')}>Quote</button>
              <button type="button" onClick={link}>Link</button>
              <button type="button" onClick={() => cmd('unlink')}>Unlink</button>
              <button type="button" onClick={() => cmd('removeFormat')}>Clear</button>
            </>
          )}
          <span className="sp" />
          <button type="button" className={mode === 'visual' ? 'on' : ''} onClick={() => { if (mode === 'html') setMode('visual') }}>Visual</button>
          <button type="button" className={mode === 'html' ? 'on' : ''} onClick={() => { if (mode === 'visual') { sync(); setMode('html') } }}>HTML</button>
        </div>
        {mode === 'visual' ? (
          <div ref={ref} className="rte-body" contentEditable suppressContentEditableWarning onInput={sync} onBlur={sync} />
        ) : (
          <textarea className="rte-src" value={src} onChange={(e) => { setSrc(e.target.value); onChange(e.target.value) }} />
        )}
      </div>
      {hint && <small className="note">{hint}</small>}
    </div>
  )
}

export function Toast({ msg, err }: { msg: string; err?: boolean }) {
  if (!msg) return null
  return <div className={`toast ${err ? 'err' : ''}`}>{msg}</div>
}

/** Convert an ISO timestamp to the value a datetime-local input expects (Toronto time). */
export function toLocalInput(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d)
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  return `${g('year')}-${g('month')}-${g('day')}T${g('hour') === '24' ? '00' : g('hour')}:${g('minute')}`
}

/** datetime-local value (Toronto time) back to ISO. */
export function fromLocalInput(v: string) {
  if (!v) return null
  // Find Toronto's UTC offset at that moment
  const guess = new Date(v + ':00Z')
  const tz = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Toronto', timeZoneName: 'shortOffset' })
    .formatToParts(guess).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-5'
  const m = tz.match(/GMT([+-]\d+)(?::(\d+))?/)
  const offMin = m ? Number(m[1]) * 60 + (Number(m[1]) < 0 ? -1 : 1) * Number(m[2] ?? 0) : -300
  return new Date(guess.getTime() - offMin * 60000).toISOString()
}
