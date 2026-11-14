'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBackup, deleteBackup, restoreBackup, saveSettings, submitAllToIndexNow } from '@/app/admin/dashboard/actions'
import { matchRedirect, type Redirect, type SettingsKey, type SiteSettings } from '@/lib/settings'
import { DASHBOARD_SECTIONS, type SectionSlug } from './nav'
import { ImageField, Toast, useLeaveGuard } from './fields'
import { IconChevronDown, IconDownload, IconExternal, IconPlus, IconTrash } from './icons'
import type { DomainStatus } from '@/app/admin/dashboard/data'

export type DashboardExtra = {
  updatedAt: string | null
  loadError: string | null
  me: string
  editors?: { email: string | null; full_name: string | null; studio_role: string | null; created_at: string }[]
  domains?: DomainStatus[]
  build?: { message: string; sha: string; branch: string; builtAt: string; env: string; url: string }
  sitemapCount?: number
  backups?: { id: string; created_at: string; label: string | null; counts: { posts?: number; projects?: number } }[]
}

type Notify = (msg: string, err?: boolean) => void

/* ---------------- helpers ---------------- */

function fmt(iso: string | null | undefined, tz: string) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return new Date(iso).toLocaleString()
  }
}

/** One Webflow-style settings card: its own fields, its own Save button. */
function useGroup<K extends SettingsKey>(key: K, initial: SiteSettings[K], fields: (keyof SiteSettings[K])[], notify: Notify) {
  const pick = (src: SiteSettings[K]) => Object.fromEntries(fields.map((f) => [f, src[f]])) as Partial<SiteSettings[K]>
  const [base, setBase] = useState(() => pick(initial))
  const [v, setV] = useState(base)
  const [pending, start] = useTransition()
  const dirty = JSON.stringify(v) !== JSON.stringify(base)
  const save = () =>
    start(async () => {
      const r = await saveSettings(key, v)
      if (r.ok) {
        setBase(v)
        notify('Saved. Live on the site within about a minute.')
      } else notify(r.error, true)
    })
  return { v: v as SiteSettings[K], set: (p: Partial<SiteSettings[K]>) => setV((cur) => ({ ...cur, ...p })), dirty, save, pending, reset: () => setV(base) }
}

function Card({ title, desc, group, actions, children }: {
  title: string
  desc?: React.ReactNode
  group?: { dirty: boolean; save: () => void; pending: boolean; reset: () => void }
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="db-card">
      <div className="db-card-head">
        <div>
          <h2>{title}</h2>
          {desc && <p>{desc}</p>}
        </div>
        <div className="db-card-actions">
          {actions}
          {group && group.dirty && !group.pending && <button className="wf-btn" onClick={group.reset}>Discard</button>}
          {group && (
            <button className={`wf-btn ${group.dirty ? 'blue' : ''}`} disabled={!group.dirty || group.pending} onClick={group.save}>
              {group.pending ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>
      <div className="db-card-body">{children}</div>
    </section>
  )
}

function Row({ label, help, children, htmlFor }: { label?: string; help?: React.ReactNode; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="db-row">
      <div className="db-control">
        {label && <label className="db-label" htmlFor={htmlFor}>{label}</label>}
        {children}
      </div>
      {help ? <div className="db-help">{help}</div> : <div />}
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="wf-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i />
      <span>{label}</span>
    </label>
  )
}

function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ---------------- sections ---------------- */

function General({ s, n }: { s: SiteSettings; n: Notify }) {
  const name = useGroup('general', s.general, ['siteName'], n)
  const icons = useGroup('general', s.general, ['favicon', 'webclip'], n)
  const loc = useGroup('general', s.general, ['timeZone', 'language'], n)
  const zones = useMemo(() => {
    try { return (Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf('timeZone') } catch { return [loc.v.timeZone] }
  }, [loc.v.timeZone])
  return (
    <>
      <Card title="General settings" group={name}>
        <Row label="Name" htmlFor="db-name" help="The site's name inside this admin. What visitors see in search results is set on each page and CMS item.">
          <input id="db-name" className="wf-input" value={name.v.siteName} onChange={(e) => name.set({ siteName: e.target.value })} />
        </Row>
      </Card>
      <Card title="Icons" desc="Upload a square image. Leave empty to keep the icons from the Webflow export." group={icons}>
        <Row label="Favicon" help="Shown in browser tabs and bookmarks. Square PNG, 256 × 256 or larger.">
          <ImageField label="" value={icons.v.favicon} onChange={(v) => icons.set({ favicon: v })} alt={false} />
        </Row>
        <Row label="Webclip" help="The home screen icon on phones. Square PNG, 256 × 256 or larger, no transparency.">
          <ImageField label="" value={icons.v.webclip} onChange={(v) => icons.set({ webclip: v })} alt={false} />
        </Row>
      </Card>
      <Card title="Localize" group={loc}>
        <Row label="Time zone" htmlFor="db-tz" help="Used for times shown in the Dashboard, like backups and when settings were last saved. Blog dates on the live site stay in Eastern time.">
          <div className="wf-select">
            <select id="db-tz" value={loc.v.timeZone} onChange={(e) => loc.set({ timeZone: e.target.value })}>
              {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)}
            </select>
            <IconChevronDown />
          </div>
          <button className="wf-btn db-mt" onClick={() => loc.set({ timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}>Detect my time zone</button>
        </Row>
        <Row label="Language code" htmlFor="db-lang" help={'Sets <html lang> on every page so screen readers and search engines read the site in the right language. "en" or "en-CA".'}>
          <input id="db-lang" className="wf-input" placeholder="e.g. en" value={loc.v.language} onChange={(e) => loc.set({ language: e.target.value.trim() })} />
        </Row>
      </Card>
    </>
  )
}

function SiteAccess({ x }: { x: DashboardExtra }) {
  const list = x.editors ?? []
  return (
    <Card title="Site access" desc="People who can sign in here and edit the site.">
      <div className="db-table-wrap">
        <table className="wf-table db-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Since</th></tr></thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.email ?? e.created_at} style={{ cursor: 'default' }}>
                <td>{e.full_name || '-'}{e.email === x.me && <span className="db-pill">You</span>}</td>
                <td className="dim">{e.email}</td>
                <td className="dim">{e.studio_role === 'super_admin' ? 'Owner' : 'Admin'}</td>
                <td className="dim">{e.created_at.slice(0, 10)}</td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={4} className="dim">No editors found.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="db-note">Editors are the studio admins in the Coastline client portal. Add or remove someone there (portal.coastlinefilms.ca) and they gain or lose access here on their next sign-in.</p>
    </Card>
  )
}

function Redirects({ s, n }: { s: SiteSettings; n: Notify }) {
  const g = useGroup('publishing', s.publishing, ['redirects'], n)
  const rows = g.v.redirects
  const [test, setTest] = useState('')
  const file = useRef<HTMLInputElement>(null)
  const set = (i: number, p: Partial<Redirect>) => g.set({ redirects: rows.map((r, j) => (j === i ? { ...r, ...p } : r)) })
  const hit = test.trim() ? matchRedirect(test.trim().replace(/^https?:\/\/[^/]+/, '') || '/', rows) : null

  function importCsv(f: File) {
    f.text().then((t) => {
      const add: Redirect[] = []
      for (const line of t.split(/\r?\n/)) {
        const [from, to, code] = line.split(',').map((c) => c?.trim().replace(/^"|"$/g, ''))
        if (!from || !to || !from.startsWith('/')) continue
        add.push({ from, to, code: code === '302' ? 302 : 301 })
      }
      if (!add.length) return n('No rows found. Use two columns: old path, new path.', true)
      const known = new Set(rows.map((r) => r.from.toLowerCase()))
      g.set({ redirects: [...rows, ...add.filter((r) => !known.has(r.from.toLowerCase()))] })
      n(`Added ${add.length} redirect${add.length === 1 ? '' : 's'}. Save to make them live.`)
    })
  }

  return (
    <Card
      title="301 redirects"
      desc={<>Send old URLs to new ones and keep their search ranking. End an old path with <code>/*</code> to match everything under it; end the new path with <code>/*</code> to carry the rest over.</>}
      group={g}
      actions={
        <>
          <button className="wf-btn" onClick={() => download('coastline-redirects.csv', 'old path,new path,type\n' + rows.map((r) => `${r.from},${r.to},${r.code}`).join('\n'), 'text/csv')}>Export</button>
          <button className="wf-btn" onClick={() => file.current?.click()}>Import</button>
          <input ref={file} type="file" accept=".csv,text/csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); e.target.value = '' }} />
        </>
      }
    >
      <div className="db-redirects">
        <div className="db-redir head"><span>Old path</span><span>New path</span><span>Type</span><span /></div>
        {rows.map((r, i) => (
          <div className="db-redir" key={i}>
            <input className="wf-input" value={r.from} placeholder="/old-page" aria-label="Old path" onChange={(e) => set(i, { from: e.target.value })} />
            <input className="wf-input" value={r.to} placeholder="/new-page" aria-label="New path" onChange={(e) => set(i, { to: e.target.value })} />
            <div className="wf-select">
              <select value={r.code} aria-label="Redirect type" onChange={(e) => set(i, { code: Number(e.target.value) as 301 | 302 })}>
                <option value={301}>301 permanent</option>
                <option value={302}>302 temporary</option>
              </select>
              <IconChevronDown />
            </div>
            <button className="wf-iconbtn" title="Remove" aria-label={`Remove redirect ${r.from}`} onClick={() => g.set({ redirects: rows.filter((_, j) => j !== i) })}><IconTrash /></button>
          </div>
        ))}
        {!rows.length && <div className="db-note">No redirects yet.</div>}
        <button className="wf-btn db-mt" onClick={() => g.set({ redirects: [...rows, { from: '', to: '', code: 301 }] })}><IconPlus /> Add redirect</button>
      </div>
      <Row label="Test a URL" htmlFor="db-test" help="Type any path to see where it goes with the rules above, saved or not.">
        <input id="db-test" className="wf-input" placeholder="/works/old-project" value={test} onChange={(e) => setTest(e.target.value)} />
        {test.trim() && (
          <div className="db-note">{hit ? <>Goes to <b>{hit.to}</b> ({hit.code})</> : 'No redirect. The page loads normally, or shows the 404 page.'}</div>
        )}
      </Row>
      <p className="db-note">Built in and always on: <code>/journal</code> → <code>/blog</code> (301).</p>
    </Card>
  )
}

const POINTS = { vercel: ['Connected', 'ok'], webflow: ['Still on Webflow', 'warn'], other: ['Points elsewhere', 'warn'], unknown: ['Unknown', 'warn'] } as const

function Publishing({ s, n, x }: { s: SiteSettings; n: Notify; x: DashboardExtra }) {
  const tz = s.general.timeZone
  const b = x.build
  return (
    <>
      <Card title="Production" desc="Your domains and where they point right now, read from public DNS.">
        <div className="db-table-wrap">
          <table className="wf-table db-table">
            <thead><tr><th>Domain</th><th>Status</th><th>Records</th></tr></thead>
            <tbody>
              {(x.domains ?? []).map((d) => (
                <tr key={d.host} style={{ cursor: 'default' }}>
                  <td><a href={`https://${d.host}`} target="_blank" rel="noopener" className="db-link">{d.host} <IconExternal size={12} /></a><div className="in-path">{d.role}</div></td>
                  <td><span className={`db-status ${POINTS[d.points][1]}`}>{POINTS[d.points][0]}</span></td>
                  <td className="dim">{d.detail}</td>
                </tr>
              ))}
              <tr style={{ cursor: 'default' }}>
                <td><a href="https://coastline-site.vercel.app" target="_blank" rel="noopener" className="db-link">coastline-site.vercel.app <IconExternal size={12} /></a><div className="in-path">Staging address, hidden from search</div></td>
                <td><span className="db-status ok">Live</span></td>
                <td className="dim">Vercel</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Current version" desc="Content and settings go live on save. Code changes go live when a new version is deployed.">
        {b ? (
          <dl className="db-dl">
            <dt>Deployed</dt><dd>{fmt(b.builtAt, tz) || '-'}</dd>
            <dt>Change</dt><dd>{b.message}</dd>
            <dt>Version</dt><dd>{b.sha ? <code>{b.sha}</code> : '-'}{b.branch && <span className="dim"> on {b.branch}</span>}</dd>
            <dt>Environment</dt><dd>{b.env}</dd>
          </dl>
        ) : <p className="db-note">Not available.</p>}
      </Card>
      <Redirects s={s} n={n} />
    </>
  )
}

function Seo({ s, n, x }: { s: SiteSettings; n: Notify; x: DashboardExtra }) {
  const idx = useGroup('seo', s.seo, ['indexing'], n)
  const robots = useGroup('seo', s.seo, ['robots'], n)
  const verify = useGroup('seo', s.seo, ['googleVerification'], n)
  const og = useGroup('seo', s.seo, ['defaultOg'], n)
  return (
    <>
      <Card title="Indexing" group={idx}>
        <Row help="Off adds a noindex tag to every page and blocks all crawlers in robots.txt. Only switch this off on purpose: it removes the site from Google.">
          <Toggle checked={idx.v.indexing} onChange={(v) => idx.set({ indexing: v })} label={idx.v.indexing ? 'Search engines can index the site' : 'Hidden from search engines'} />
          {!idx.v.indexing && <div className="wf-warn">Saving this will take coastlinefilms.ca out of Google.</div>}
        </Row>
      </Card>
      <Card title="Sitemap" desc="Generated automatically from your pages, projects and blog posts, and updated whenever you publish.">
        <Row help="Drafts, thank-you pages and the admin are left out.">
          <a className="db-link" href="/sitemap.xml" target="_blank" rel="noopener">/sitemap.xml <IconExternal size={12} /></a>
          <div className="db-note">{x.sitemapCount ?? '-'} URLs</div>
        </Row>
      </Card>
      <IndexNowCard n={n} count={x.sitemapCount} />
      <Card title="robots.txt" group={robots}>
        <Row htmlFor="db-robots" help={<>The sitemap line, and rules blocking <code>/admin</code> and <code>/api</code>, are always added for you.</>}>
          <textarea id="db-robots" className="db-code" rows={5} value={robots.v.robots} onChange={(e) => robots.set({ robots: e.target.value })} />
          <a className="db-link db-mt" href="/robots.txt" target="_blank" rel="noopener">View live robots.txt <IconExternal size={12} /></a>
        </Row>
      </Card>
      <Card title="Google site verification" group={verify}>
        <Row label="Verification ID" htmlFor="db-gsv" help="Search Console already verifies coastlinefilms.ca through a DNS record, so this is only needed for a new property.">
          <input id="db-gsv" className="wf-input" placeholder="Content of the google-site-verification meta tag" value={verify.v.googleVerification} onChange={(e) => verify.set({ googleVerification: e.target.value.trim().replace(/^.*content="([^"]+)".*$/, '$1') })} />
        </Row>
      </Card>
      <Card title="Default share image" desc="Used when a page or CMS item has no image of its own for link previews." group={og}>
        <Row help="1200 × 630 JPG works everywhere. Leave empty to keep the current image.">
          <ImageField label="" value={og.v.defaultOg} onChange={(v) => og.set({ defaultOg: v })} alt={false} />
        </Row>
      </Card>
    </>
  )
}

function IndexNowCard({ n, count }: { n: Notify; count?: number }) {
  const [pending, start] = useTransition()
  return (
    <Card
      title="IndexNow"
      desc="Tells Bing and the search engines that share its index (including the AI search tools built on it) about changes the moment they happen."
      actions={
        <button className="wf-btn" disabled={pending} onClick={() => start(async () => {
          const r = await submitAllToIndexNow()
          if (r.ok) n(`Sent ${r.count} pages to IndexNow.`)
          else n(r.error, true)
        })}>
          {pending ? 'Sending...' : `Submit all ${count ?? ''} pages`.replace('  ', ' ')}
        </button>
      }
    >
      <p className="db-note" style={{ margin: 0 }}>Automatic: publishing, unpublishing, renaming or deleting a project or blog post sends its URL straight away. Use the button after big changes to static pages.</p>
    </Card>
  )
}

function Forms({ s, n }: { s: SiteSettings; n: Notify }) {
  const g = useGroup('forms', s.forms, ['bookingUrl'], n)
  return (
    <>
      <Card title="Discovery call form" desc="The questions on /contact pass the answers straight into this GoHighLevel calendar." group={g}>
        <Row label="Booking calendar link" htmlFor="db-cal" help="From GoHighLevel: Calendars, then Share, then the permanent link. A lead is created when someone books a time.">
          <input id="db-cal" className="wf-input" value={g.v.bookingUrl} onChange={(e) => g.set({ bookingUrl: e.target.value })} />
          <div className="db-inline db-mt">
            <a className="wf-btn" href={g.v.bookingUrl} target="_blank" rel="noopener">Open calendar <IconExternal size={12} /></a>
            <a className="wf-btn" href="/contact" target="_blank" rel="noopener">Open /contact <IconExternal size={12} /></a>
          </div>
        </Row>
      </Card>
      <Card title="Submissions">
        <p className="db-note">Bookings and contact details land in GoHighLevel, not here. The short link <code>/book</code> goes to the strategy call calendar and can be changed under Publishing, 301 redirects.</p>
      </Card>
    </>
  )
}

const FONT_URL = 'https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/69fe5eebe2ba2ec1a3bac0f3_NeueMontreal-Regular.otf'
const FONT_BOLD = 'https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/69fe5eeb79f82558bae2b9d0_NeueMontreal-Bold.otf'

function Fonts() {
  const fonts = [
    { name: 'Neue Montreal', family: 'cf-nm', source: 'Licensed, self-hosted', styles: 'Light, Regular, Medium, Bold + italics (8)', used: 'Every page: headings, body, nav and footer' },
    { name: 'Space Mono', family: '"Space Mono", monospace', source: 'Google Fonts', styles: 'Regular, Bold', used: 'Only pages that use it (calculator details, labels)' },
  ]
  return (
    <Card title="Fonts" desc="Fonts the site loads. Only the families a page needs are downloaded, so pages stay fast.">
      <style>{`@font-face{font-family:'cf-nm';src:url(${FONT_URL}) format('opentype');font-weight:400}@font-face{font-family:'cf-nm';src:url(${FONT_BOLD}) format('opentype');font-weight:700}`}</style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" />
      <div className="db-fonts">
        {fonts.map((f) => (
          <div className="db-font" key={f.name}>
            <div className="db-font-sample" style={{ fontFamily: f.family }}>Coastline <b>Films</b></div>
            <div className="db-font-meta"><b>{f.name}</b><span>{f.source} · {f.styles}</span><span>{f.used}</span></div>
          </div>
        ))}
      </div>
      <p className="db-note">The Neue Montreal files stay out of the public code repository because of the font licence.</p>
    </Card>
  )
}

function Backups({ s, n, x }: { s: SiteSettings; n: Notify; x: DashboardExtra }) {
  const router = useRouter()
  const [label, setLabel] = useState('')
  const [pending, start] = useTransition()
  const [confirm, setConfirm] = useState<{ id: string; kind: 'settings' | 'all' | 'delete' } | null>(null)
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    start(async () => {
      const r = await fn()
      setConfirm(null)
      if (r.ok) { n(ok); router.refresh() } else n(r.error ?? 'Something went wrong.', true)
    })
  const list = x.backups ?? []
  return (
    <>
      <Card title="Create a backup" desc="Saves the site settings plus every project and blog post, drafts included. A backup is also taken automatically before any restore.">
        <div className="db-inline">
          <input className="wf-input" placeholder="Label (optional), e.g. Before homepage rewrite" value={label} onChange={(e) => setLabel(e.target.value)} aria-label="Backup label" />
          <button className="wf-btn blue" disabled={pending} onClick={() => run(async () => { const r = await createBackup(label); if (r.ok) setLabel(''); return r }, 'Backup created.')}>
            {pending && !confirm ? 'Saving...' : 'Create backup'}
          </button>
        </div>
      </Card>
      <Card title="Backups" desc={list.length ? `${list.length} saved` : undefined}>
        {!list.length && <p className="db-note">No backups yet.</p>}
        {list.map((b) => (
          <div className="db-backup" key={b.id}>
            <div className="db-backup-main">
              <b>{fmt(b.created_at, s.general.timeZone)}</b>
              <span>{b.label || 'Manual backup'} · {b.counts.projects ?? 0} projects · {b.counts.posts ?? 0} posts</span>
            </div>
            {confirm?.id === b.id ? (
              <div className="db-inline">
                <span className="wf-warn" style={{ margin: 0 }}>
                  {confirm.kind === 'delete' ? 'Delete this backup?' : confirm.kind === 'settings' ? 'Replace current settings?' : 'Restore settings and CMS items?'}
                </span>
                <button className="wf-btn" onClick={() => setConfirm(null)} disabled={pending}>Cancel</button>
                <button
                  className={`wf-btn ${confirm.kind === 'delete' ? 'danger' : 'blue'}`}
                  disabled={pending}
                  onClick={() =>
                    confirm.kind === 'delete'
                      ? run(() => deleteBackup(b.id), 'Backup deleted.')
                      : run(() => restoreBackup(b.id, confirm.kind as 'settings' | 'all'), 'Restored. Your previous state was backed up first.')
                  }
                >
                  {pending ? 'Working...' : 'Confirm'}
                </button>
              </div>
            ) : (
              <div className="db-inline">
                <a className="wf-btn" href={`/admin/backup/${b.id}`} download><IconDownload /> Download</a>
                <button className="wf-btn" onClick={() => setConfirm({ id: b.id, kind: 'settings' })}>Restore settings</button>
                <button className="wf-btn" onClick={() => setConfirm({ id: b.id, kind: 'all' })}>Restore all</button>
                <button className="wf-iconbtn" title="Delete backup" aria-label="Delete backup" onClick={() => setConfirm({ id: b.id, kind: 'delete' })}><IconTrash /></button>
              </div>
            )}
          </div>
        ))}
        <p className="db-note">Restoring CMS items rewrites the projects and posts that are in the backup. Items created after the backup are kept.</p>
      </Card>
    </>
  )
}

function Integrations({ s, n }: { s: SiteSettings; n: Notify }) {
  const ga = useGroup('integrations', s.integrations, ['ga4'], n)
  const meta = useGroup('integrations', s.integrations, ['metaPixel', 'facebookVerification'], n)
  const services = [
    ['Supabase', 'CMS content, settings, sign-in and first-party analytics'],
    ['Vercel', 'Hosting, image and video storage (Blob)'],
    ['GoHighLevel', 'Discovery call calendar and leads'],
    ['Vimeo', 'Project films'],
  ]
  return (
    <>
      <Card title="Google Analytics" group={ga}>
        <Row label="Measurement ID" htmlFor="db-ga" help="GA4 ID from Admin, Data streams. Added to every page. Leave empty to turn Google Analytics off (the built-in Analytics tab keeps working).">
          <input id="db-ga" className="wf-input" placeholder="G-XXXXXXXXXX" value={ga.v.ga4} onChange={(e) => ga.set({ ga4: e.target.value.trim().toUpperCase() })} />
        </Row>
      </Card>
      <Card title="Meta" group={meta}>
        <Row label="Pixel ID" htmlFor="db-px" help="From Meta Events Manager. Adds the pixel and a PageView event to every page.">
          <input id="db-px" className="wf-input" placeholder="Numbers only" value={meta.v.metaPixel} onChange={(e) => meta.set({ metaPixel: e.target.value.trim() })} />
        </Row>
        <Row label="Domain verification" htmlFor="db-fbv" help="From Meta Business settings, Brand safety, Domains. Paste the content value or the whole meta tag.">
          <input id="db-fbv" className="wf-input" value={meta.v.facebookVerification} onChange={(e) => meta.set({ facebookVerification: e.target.value.trim().replace(/^.*content="([^"]+)".*$/, '$1') })} />
        </Row>
      </Card>
      <Card title="Connected services">
        <div className="db-services">
          {services.map(([name, what]) => (
            <div key={name} className="db-service"><b>{name}</b><span>{what}</span><span className="db-status ok">Connected</span></div>
          ))}
        </div>
      </Card>
    </>
  )
}

function CustomCode({ s, n }: { s: SiteSettings; n: Notify }) {
  const g = useGroup('code', s.code, ['head', 'footer'], n)
  return (
    <Card title="Custom code" desc="Runs on every page of the live site. Broken code here can break the whole site, so test changes on one page first." group={g}>
      <Row label="Head code" htmlFor="db-head" help={<>Added just before <code>&lt;/head&gt;</code>. For meta tags, styles and tracking scripts.</>}>
        <textarea id="db-head" className="db-code" rows={9} spellCheck={false} value={g.v.head} onChange={(e) => g.set({ head: e.target.value })} placeholder="<!-- e.g. a verification tag or script -->" />
        <div className={`db-count ${g.v.head.length > 50000 ? 'over' : ''}`}>{g.v.head.length.toLocaleString()} / 50,000</div>
      </Row>
      <Row label="Footer code" htmlFor="db-foot" help={<>Added just before <code>&lt;/body&gt;</code>. For chat widgets and scripts that should load last.</>}>
        <textarea id="db-foot" className="db-code" rows={9} spellCheck={false} value={g.v.footer} onChange={(e) => g.set({ footer: e.target.value })} />
        <div className={`db-count ${g.v.footer.length > 50000 ? 'over' : ''}`}>{g.v.footer.length.toLocaleString()} / 50,000</div>
      </Row>
    </Card>
  )
}

/* ---------------- shell ---------------- */

const hasUnsaved = () => !!document.querySelector('.db-card .wf-btn.blue:not(:disabled)')

export default function Dashboard({ section, settings, extra }: { section: SectionSlug; settings: SiteSettings; extra: DashboardExtra }) {
  const router = useRouter()
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null)
  const notify: Notify = (msg, err) => setToast({ msg, err })
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), toast.err ? 6000 : 3200)
    return () => clearTimeout(t)
  }, [toast])

  // Warn before leaving with unsaved changes (any card whose Save button is lit)
  useLeaveGuard(hasUnsaved)

  const title = DASHBOARD_SECTIONS.find((x) => x.slug === section)?.name ?? 'Settings'
  return (
    <main className="wf-main">
      <div className="wf-toolbar">
        <h1>{settings.general.siteName} <span className="db-crumb">/ {title}</span></h1>
        <div className="wf-select db-mobile-nav">
          <select value={section} onChange={(e) => router.push(`/admin/dashboard/${e.target.value}`)} aria-label="Settings section">
            {DASHBOARD_SECTIONS.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
          </select>
          <IconChevronDown />
        </div>
        {extra.updatedAt && <span className="db-saved">Last saved {fmt(extra.updatedAt, settings.general.timeZone)}</span>}
      </div>
      <div className="db-body">
        {extra.loadError && <div className="in-note err">Couldn&apos;t load settings: {extra.loadError}. Showing defaults; saving is disabled until this loads.</div>}
        <div className="db-wrap" style={extra.loadError ? { pointerEvents: 'none', opacity: .6 } : undefined}>
          {section === 'general' && <General s={settings} n={notify} />}
          {section === 'site-access' && <SiteAccess x={extra} />}
          {section === 'publishing' && <Publishing s={settings} n={notify} x={extra} />}
          {section === 'seo' && <Seo s={settings} n={notify} x={extra} />}
          {section === 'forms' && <Forms s={settings} n={notify} />}
          {section === 'fonts' && <Fonts />}
          {section === 'backups' && <Backups s={settings} n={notify} x={extra} />}
          {section === 'integrations' && <Integrations s={settings} n={notify} />}
          {section === 'custom-code' && <CustomCode s={settings} n={notify} />}
        </div>
      </div>
      {toast && <Toast msg={toast.msg} err={toast.err} />}
    </main>
  )
}

