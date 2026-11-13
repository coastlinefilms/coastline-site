'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { IconChevronDown } from './icons'

/* ---------------- types ---------------- */

type KV = { k: string; n: number; booked?: number }
type PageRow = { path: string; views: number; visitors: number; avg_sec: number | null; avg_scroll: number | null; entries: number; exits: number; not_found: number; spark: number[] | null }
type EventRow = { label: string; element: string | null; path: string; href: string | null; n: number; spark: number[] | null }
type Totals = { visitors: number; sessions: number; pageviews: number; bounce_rate: number | null; avg_session_sec: number | null; pages_per_session: number | null; booked: number; contact_sessions: number; clicks: number }
type Data = {
  bucket: 'hour' | 'day'
  totals: Totals
  prev: { visitors: number; sessions: number; pageviews: number; bounce_rate: number | null; booked: number }
  series: { t: string; pageviews: number; sessions: number; visitors: number }[]
  pages: PageRow[]
  events: EventRow[]
  countries: KV[]; cities: KV[]; languages: KV[]; devices: KV[]; browsers: KV[]; os: KV[]
  sources: KV[]; campaigns: KV[]; landing: KV[]; scroll: KV[]; not_found: KV[]
  first_event: string | null
}

export const VIEWS = {
  overview: 'Site overview',
  pages: 'Pages',
  events: 'Events',
  sources: 'Traffic sources',
  audience: 'Audience',
} as const

const RANGE_LABELS: Record<string, string> = {
  '24h': 'Last 24 hours', '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', '365d': 'Last 12 months',
}

/* ---------------- helpers ---------------- */

const nf = new Intl.NumberFormat('en-CA')
const num = (n: number | null | undefined) => (n == null ? '-' : nf.format(n))
const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0)
const dur = (s: number | null | undefined) => (s == null ? '-' : s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, '0')}s`)
const regionNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null
const langNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['en'], { type: 'language' }) : null
const flag = (cc: string) => (/^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map((c) => 127397 + c.charCodeAt(0))) : '🌐')
const country = (cc: string) => { try { return regionNames?.of(cc) ?? cc } catch { return cc } }
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function mergeLanguages(rows: KV[]): KV[] {
  const m = new Map<string, number>()
  for (const r of rows) {
    const base = (r.k || 'Unknown').split('-')[0]
    let name = base
    try { name = langNames?.of(base) ?? base } catch {}
    m.set(name, (m.get(name) ?? 0) + r.n)
  }
  return [...m].map(([k, n]) => ({ k, n })).sort((a, b) => b.n - a.n)
}

function delta(cur: number | null | undefined, prev: number | null | undefined, invert = false) {
  if (cur == null || prev == null || !prev) return null
  const d = Math.round(((cur - prev) / prev) * 100)
  const good = invert ? d <= 0 : d >= 0
  return <span className={`in-delta ${good ? 'up' : 'down'}`}>{d >= 0 ? '↑' : '↓'} {Math.abs(d)}%</span>
}

/* ---------------- charts ---------------- */

function Spark({ data, w = 150, h = 44 }: { data: number[] | null; w?: number; h?: number }) {
  if (!data?.length) return null
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => [(i / Math.max(data.length - 1, 1)) * w, h - 4 - (v / max) * (h - 8)])
  const half = Math.floor(data.length / 2)
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / Math.max(a.length, 1)
  const rising = avg(data.slice(half)) >= avg(data.slice(0, half))
  // smooth curve
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]
    const cx = (x0 + x1) / 2
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`
  }
  return (
    <svg className="in-spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={rising ? '#6fdc95' : '#f08b8b'} strokeWidth="1.6" />
    </svg>
  )
}

function TrafficChart({ series, bucket }: { series: Data['series']; bucket: Data['bucket'] }) {
  const [metric, setMetric] = useState<'sessions' | 'pageviews' | 'visitors'>('sessions')
  const [hover, setHover] = useState<number | null>(null)
  const W = 1000, H = 220, P = 28
  const vals = series.map((s) => s[metric])
  const max = Math.max(...vals, 1)
  const x = (i: number) => P + (i / Math.max(series.length - 1, 1)) * (W - P * 2)
  const y = (v: number) => H - P - (v / max) * (H - P * 2)
  const line = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')
  const area = `${line} L${x(vals.length - 1)},${H - P} L${x(0)},${H - P} Z`
  const fmt = (t: string) => {
    const d = new Date(t + (t.endsWith('Z') ? '' : 'Z'))
    return bucket === 'hour'
      ? d.toLocaleTimeString('en-US', { hour: 'numeric', timeZone: 'UTC' })
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  }
  const ticks = series.length <= 8 ? series.map((_, i) => i) : [0, Math.floor(series.length / 4), Math.floor(series.length / 2), Math.floor((3 * series.length) / 4), series.length - 1]
  return (
    <div className="in-card in-chart">
      <div className="in-chart-head">
        {(['sessions', 'pageviews', 'visitors'] as const).map((m) => (
          <button key={m} className={metric === m ? 'on' : ''} onClick={() => setMetric(m)}>{titleCase(m)}</button>
        ))}
        <span className="sp" />
        {hover != null && series[hover] && <span className="in-hover">{fmt(series[hover].t)}: <b>{num(series[hover][metric])}</b> {metric}</span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="inFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#146ef5" stopOpacity=".35" />
            <stop offset="100%" stopColor="#146ef5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, .5, 1].map((f) => <line key={f} x1={P} x2={W - P} y1={y(max * f)} y2={y(max * f)} stroke="#3a3a3a" strokeDasharray={f ? '3 4' : ''} />)}
        <path d={area} fill="url(#inFill)" />
        <path d={line} fill="none" stroke="#3b8bff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {series.map((_, i) => (
          <rect key={i} x={x(i) - (W / series.length) / 2} y={0} width={W / series.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover != null && <circle cx={x(hover)} cy={y(vals[hover])} r="4" fill="#3b8bff" />}
      </svg>
      <div className="in-ticks">
        {ticks.map((i) => <span key={i} style={{ left: `${(x(i) / W) * 100}%` }}>{series[i] ? fmt(series[i].t) : ''}</span>)}
      </div>
    </div>
  )
}

function BarList({ title, rows, unit = 'Sessions', limit = 5, render, extra, keepOrder }: {
  title: string
  rows: KV[]
  unit?: string
  limit?: number
  render?: (r: KV) => React.ReactNode
  extra?: { label: string; value: (r: KV) => React.ReactNode }
  keepOrder?: boolean
}) {
  const [all, setAll] = useState(false)
  const sorted = keepOrder ? rows : [...rows].sort((a, b) => b.n - a.n)
  const max = Math.max(...sorted.map((r) => r.n), 1)
  const shown = all ? sorted : sorted.slice(0, limit)
  return (
    <div className="in-card in-bars">
      <div className="in-bars-head">
        <h3>{title}</h3>
        {extra && <span>{extra.label}</span>}
        <span>{unit}</span>
      </div>
      {shown.length ? shown.map((r) => (
        <div className="in-bar" key={r.k}>
          <span className="name">{render ? render(r) : r.k}</span>
          <span className="track"><i style={{ width: `${Math.max(1.5, (100 * r.n) / max)}%` }} /></span>
          {extra && <span className="val dim">{extra.value(r)}</span>}
          <span className="val">{num(r.n)}</span>
        </div>
      )) : <div className="in-none">No data yet</div>}
      {sorted.length > limit && (
        <div className="in-showall"><button className="wf-btn" onClick={() => setAll((a) => !a)}>{all ? 'Show less' : 'Show all'}</button></div>
      )}
    </div>
  )
}

function PageIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 1.5h5.5L12.5 4.5v10h-8.5z" /><path d="M9.5 1.5v3h3" /></svg>
}
function TapIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M6.5 8V3.2a1.2 1.2 0 0 1 2.4 0V7.5l3.2.7c.7.2 1.1.8 1 1.5l-.6 3.8H6.8L4.3 10.3a1.1 1.1 0 0 1 1.5-1.6L6.5 9.4" /></svg>
}

/* ---------------- main ---------------- */

export default function Insights({ view, data, error, range, device, names }: {
  view: keyof typeof VIEWS
  data: Data | null
  error: string | null
  range: string
  device: string
  names: Record<string, { name: string; cms: boolean }>
}) {
  const router = useRouter()
  const path = usePathname()
  const sp = useSearchParams()
  const setParam = (k: string, v: string) => {
    const q = new URLSearchParams(sp.toString())
    q.set(k, v)
    router.push(`${path}?${q}`)
  }
  const pageName = (p: string) => names[p]?.name ?? p
  const PageLabel = ({ p, cls = '' }: { p: string; cls?: string }) => (
    <span className={`in-page ${names[p]?.cms ? 'cms' : ''} ${cls}`} title={p}><PageIcon /> <span>{pageName(p)}</span></span>
  )

  const t = data?.totals
  const empty = !t || t.pageviews === 0
  const totalEvents = useMemo(() => (data?.events ?? []).reduce((a, e) => a + e.n, 0), [data])
  const languages = useMemo(() => mergeLanguages(data?.languages ?? []), [data])
  const ctaClicks = useMemo(
    () => (data?.events ?? []).filter((e) => /\/contact|book|call|discovery/i.test(`${e.href} ${e.label}`)).reduce((a, e) => a + e.n, 0),
    [data],
  )

  const header = (
    <div className="wf-toolbar">
      <h1>{VIEWS[view]}</h1>
      <div className="in-select">
        <select value={device} onChange={(e) => setParam('device', e.target.value)}>
          <option value="all">All devices</option>
          <option value="desktop">Desktop</option>
          <option value="mobile">Mobile</option>
          <option value="tablet">Tablet</option>
        </select>
        <IconChevronDown size={14} />
      </div>
      <div className="in-select">
        <select value={range} onChange={(e) => setParam('range', e.target.value)}>
          {Object.entries(RANGE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <IconChevronDown size={14} />
      </div>
    </div>
  )

  if (error || !data) {
    return <div className="wf-main">{header}<div className="in-body"><div className="in-note err">Couldn&apos;t load insights: {error}</div></div></div>
  }

  const emptyNote = empty && (
    <div className="in-note">
      <b>No visits recorded for this range yet.</b> Tracking runs on every page of the new site and starts counting once coastlinefilms.ca points at Vercel.
      History from the Webflow site stays in Google Analytics.
    </div>
  )

  const kpis = (
    <div className="in-kpis">
      <div className="in-card in-kpi"><span className="lbl">Visitors</span><b>{num(t!.visitors)}</b>{delta(t!.visitors, data.prev.visitors)}</div>
      <div className="in-card in-kpi"><span className="lbl">Sessions</span><b>{num(t!.sessions)}</b>{delta(t!.sessions, data.prev.sessions)}</div>
      <div className="in-card in-kpi"><span className="lbl">Page views</span><b>{num(t!.pageviews)}</b>{delta(t!.pageviews, data.prev.pageviews)}</div>
      <div className="in-card in-kpi"><span className="lbl">Bounce rate</span><b>{t!.bounce_rate == null ? '-' : `${t!.bounce_rate}%`}</b>{delta(t!.bounce_rate, data.prev.bounce_rate, true)}</div>
      <div className="in-card in-kpi"><span className="lbl">Avg. engaged time</span><b>{dur(t!.avg_session_sec)}</b><span className="in-sub">{t!.pages_per_session ?? '-'} pages / session</span></div>
    </div>
  )

  const conversions = (
    <div className="in-kpis four">
      <div className="in-card in-kpi accent"><span className="lbl">Booked calls</span><b>{num(t!.booked)}</b>{delta(t!.booked, data.prev.booked)}<span className="in-sub">Sessions that reached a booking confirmation page</span></div>
      <div className="in-card in-kpi"><span className="lbl">Booking rate</span><b>{t!.sessions ? `${((100 * t!.booked) / t!.sessions).toFixed(1)}%` : '-'}</b><span className="in-sub">Booked calls / sessions</span></div>
      <div className="in-card in-kpi"><span className="lbl">Contact page visits</span><b>{num(t!.contact_sessions)}</b><span className="in-sub">{pct(t!.booked, t!.contact_sessions)}% of them booked</span></div>
      <div className="in-card in-kpi"><span className="lbl">Call-to-action clicks</span><b>{num(ctaClicks)}</b><span className="in-sub">Book / contact buttons and links</span></div>
    </div>
  )

  const topPages = (
    <>
      <h2 className="in-h">Top pages</h2>
      <div className="in-grid5">
        {data.pages.slice(0, 5).map((p) => (
          <div className="in-card in-top" key={p.path}>
            <PageLabel p={p.path} cls="head" />
            <div className="in-top-row">
              <div><b>{num(p.views)}</b><span>{pct(p.views, t!.pageviews)}% of views</span></div>
              <Spark data={p.spark} />
            </div>
          </div>
        ))}
        {!data.pages.length && <div className="in-none">No page views yet</div>}
      </div>
    </>
  )

  const topEvents = (
    <>
      <h2 className="in-h">Top events <span className="in-tip" title="Clicks on buttons, links and Work cards, captured automatically">i</span></h2>
      <div className="in-grid5">
        {data.events.slice(0, 5).map((e) => (
          <div className="in-card in-top in-event" key={`${e.label}-${e.element}`}>
            <div className="in-event-head"><b title={e.label}>{e.label}</b><span><TapIcon /> {titleCase(e.element ?? 'click')}</span></div>
            <div className="in-top-row">
              <div><b>{num(e.n)}</b><span>{pct(e.n, totalEvents)}% of events</span></div>
              <Spark data={e.spark} />
            </div>
            <div className="in-event-foot"><PageLabel p={e.path} /></div>
          </div>
        ))}
        {!data.events.length && <div className="in-none">No clicks recorded yet</div>}
      </div>
    </>
  )

  const audience = (all = false) => (
    <>
      <h2 className="in-h">Audience</h2>
      <div className="in-grid2">
        <BarList title="Top countries" limit={all ? 15 : 5} rows={data.countries} render={(r) => <><span className="flag">{flag(r.k)}</span>{country(r.k)}</>} />
        <BarList title="Top languages" limit={all ? 15 : 5} rows={languages} />
        <BarList title="Top devices" rows={data.devices.map((d) => ({ ...d, k: titleCase(d.k) }))} />
        <BarList title="Top browsers" limit={all ? 15 : 5} rows={data.browsers} />
        {all && <BarList title="Top cities" limit={15} rows={data.cities} />}
        {all && <BarList title="Operating systems" limit={15} rows={data.os} />}
      </div>
    </>
  )

  const sources = (all = false) => (
    <>
      <h2 className="in-h">Acquisition</h2>
      <div className="in-grid2">
        <BarList title="Traffic sources" limit={all ? 20 : 5} rows={data.sources} extra={{ label: 'Booked', value: (r) => num(r.booked ?? 0) }} />
        <BarList title="Landing pages" limit={all ? 20 : 5} rows={data.landing} render={(r) => <PageLabel p={r.k} />} extra={{ label: 'Booked', value: (r) => num(r.booked ?? 0) }} />
        {all && <BarList title="UTM campaigns" limit={20} rows={data.campaigns} />}
      </div>
    </>
  )

  const health = (
    <>
      <h2 className="in-h">Engagement &amp; site health</h2>
      <div className="in-grid2">
        <BarList title="Scroll depth" unit="Page views" rows={data.scroll} keepOrder />
        <BarList title="Broken links (404s)" unit="Hits" rows={data.not_found} render={(r) => <code>{r.k}</code>} />
      </div>
    </>
  )

  return (
    <div className="wf-main">
      {header}
      <div className="in-body">
        {emptyNote}
        {view === 'overview' && (
          <>
            {kpis}
            {conversions}
            <TrafficChart series={data.series} bucket={data.bucket} />
            {topPages}
            {topEvents}
            {audience()}
            {sources()}
            {health}
          </>
        )}

        {view === 'pages' && (
          <div className="in-card in-tablecard">
            <table className="wf-table">
              <thead><tr><th>Page</th><th>Views</th><th>Visitors</th><th>Entries</th><th>Exits</th><th>Avg. time</th><th>Avg. scroll</th><th>Trend</th></tr></thead>
              <tbody>
                {data.pages.map((p) => (
                  <tr key={p.path} onClick={() => window.open(p.path, '_blank')}>
                    <td><PageLabel p={p.path} />{p.not_found > 0 && <span className="in-404">404</span>}<div className="in-path">{p.path}</div></td>
                    <td>{num(p.views)}</td><td>{num(p.visitors)}</td><td>{num(p.entries)}</td><td>{num(p.exits)}</td>
                    <td>{dur(p.avg_sec)}</td><td>{p.avg_scroll == null ? '-' : `${p.avg_scroll}%`}</td>
                    <td><Spark data={p.spark} w={110} h={28} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.pages.length && <div className="wf-empty">No page views in this range.</div>}
          </div>
        )}

        {view === 'events' && (
          <div className="in-card in-tablecard">
            <table className="wf-table">
              <thead><tr><th>Event</th><th>Type</th><th>Last seen on</th><th>Target</th><th>Clicks</th><th>Share</th><th>Trend</th></tr></thead>
              <tbody>
                {data.events.map((e) => (
                  <tr key={`${e.label}-${e.element}`}>
                    <td>{e.label}</td><td className="dim">{titleCase(e.element ?? 'click')}</td><td><PageLabel p={e.path} /></td>
                    <td className="dim">{e.href || '-'}</td><td>{num(e.n)}</td><td>{pct(e.n, totalEvents)}%</td>
                    <td><Spark data={e.spark} w={110} h={28} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.events.length && <div className="wf-empty">No clicks in this range.</div>}
          </div>
        )}

        {view === 'sources' && sources(true)}
        {view === 'audience' && audience(true)}
      </div>
    </div>
  )
}
