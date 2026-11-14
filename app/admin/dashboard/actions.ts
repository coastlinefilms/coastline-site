'use server'

import { revalidatePath } from 'next/cache'
import { requireEditor } from '@/lib/admin'
import { normalizeSettings, type Redirect, type SettingsKey, type SiteSettings } from '@/lib/settings'

type Result = { ok: true; savedAt: string } | { ok: false; error: string }

const MAX_CODE = 50_000

function validate<K extends SettingsKey>(key: K, v: SiteSettings[K]): string | null {
  if (key === 'general') {
    const g = v as SiteSettings['general']
    if (!g.siteName.trim()) return 'Add a site name.'
    if (g.language && !/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(g.language)) return 'Language code should look like "en" or "en-CA".'
  }
  if (key === 'publishing') {
    const seen = new Set<string>()
    for (const r of (v as SiteSettings['publishing']).redirects) {
      if (!r.from.startsWith('/')) return `Old path "${r.from}" must start with "/".`
      if (/\s/.test(r.from) || /\s/.test(r.to)) return 'Paths cannot contain spaces.'
      if (!r.to || !(r.to.startsWith('/') || /^https?:\/\//.test(r.to))) return `New path for "${r.from}" must start with "/" or "https://".`
      if (r.from.replace(/\/+$/, '') === r.to.replace(/\/+$/, '')) return `"${r.from}" redirects to itself.`
      if (r.code !== 301 && r.code !== 302) return 'Redirect type must be 301 or 302.'
      const k = r.from.toLowerCase().replace(/\/+$/, '') || '/'
      if (k === '/' ) return 'The home page cannot be redirected.'
      if (k.startsWith('/admin') || k.startsWith('/api')) return 'Admin and API paths cannot be redirected.'
      if (seen.has(k)) return `"${r.from}" is listed twice.`
      seen.add(k)
    }
  }
  if (key === 'forms') {
    const u = (v as SiteSettings['forms']).bookingUrl.trim()
    if (!/^https:\/\/[^\s]+\/[A-Za-z0-9_-]+\/?$/.test(u)) return 'Paste the full GoHighLevel calendar link, e.g. https://api.leadconnectorhq.com/widget/booking/…'
  }
  if (key === 'integrations') {
    const i = v as SiteSettings['integrations']
    if (i.ga4 && !/^G-[A-Z0-9]{4,}$/.test(i.ga4.trim())) return 'Google Analytics ID should look like G-XXXXXXXXXX.'
    if (i.metaPixel && !/^\d{6,20}$/.test(i.metaPixel.trim())) return 'Meta Pixel ID is the number only.'
  }
  if (key === 'code') {
    const c = v as SiteSettings['code']
    if (c.head.length > MAX_CODE || c.footer.length > MAX_CODE) return `Custom code is limited to ${MAX_CODE.toLocaleString()} characters per box.`
  }
  return null
}

/** Merge one settings group into the row. Only the fields sent are changed. */
export async function saveSettings<K extends SettingsKey>(key: K, patch: Partial<SiteSettings[K]>): Promise<Result> {
  const ed = await requireEditor()
  const { data, error } = await ed.sb.from('site_settings').select('data').eq('id', 1).maybeSingle()
  if (error) return { ok: false, error: error.message }
  const all = normalizeSettings(data?.data)
  const next = { ...all[key], ...patch } as SiteSettings[K]
  if (key === 'publishing') {
    ;(next as SiteSettings['publishing']).redirects = (next as SiteSettings['publishing']).redirects
      .map((r: Redirect) => ({ from: r.from.trim(), to: r.to.trim(), code: Number(r.code) === 302 ? 302 : 301 }) as Redirect)
      .filter((r) => r.from || r.to)
  }
  const problem = validate(key, next)
  if (problem) return { ok: false, error: problem }
  const savedAt = new Date().toISOString()
  const { error: e2 } = await ed.sb
    .from('site_settings')
    .upsert({ id: 1, data: { ...all, [key]: next }, updated_at: savedAt, updated_by: ed.user.id })
  if (e2) return { ok: false, error: e2.message }
  revalidatePath('/admin/dashboard', 'layout')
  return { ok: true, savedAt }
}

/* ---------------- backups ---------------- */

export async function createBackup(label: string) {
  const ed = await requireEditor()
  const [s, posts, projects] = await Promise.all([
    ed.sb.from('site_settings').select('data').eq('id', 1).maybeSingle(),
    ed.sb.from('site_blog_posts').select('*'),
    ed.sb.from('site_projects').select('*'),
  ])
  const err = s.error || posts.error || projects.error
  if (err) return { ok: false as const, error: err.message }
  const snapshot = { version: 1, settings: s.data?.data ?? {}, posts: posts.data ?? [], projects: projects.data ?? [] }
  const { error } = await ed.sb.from('site_backups').insert({
    label: label.trim() || null,
    created_by: ed.user.id,
    counts: { posts: snapshot.posts.length, projects: snapshot.projects.length },
    snapshot,
  })
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/dashboard/backups')
  return { ok: true as const }
}

export async function deleteBackup(id: string) {
  const ed = await requireEditor()
  const { error } = await ed.sb.from('site_backups').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/dashboard/backups')
  return { ok: true as const }
}

/**
 * Restore a backup. Settings are replaced; CMS items in the backup are written back
 * over the current versions (items created after the backup are left alone).
 * A fresh backup of the current state is taken first so a restore can be undone.
 */
export async function restoreBackup(id: string, what: 'settings' | 'all') {
  const ed = await requireEditor()
  const { data, error } = await ed.sb.from('site_backups').select('snapshot, created_at').eq('id', id).maybeSingle()
  if (error || !data) return { ok: false as const, error: error?.message ?? 'Backup not found.' }
  const safety = await createBackup(`Before restoring ${new Date(data.created_at).toISOString().slice(0, 16).replace('T', ' ')} UTC`)
  if (!safety.ok) return safety
  const snap = data.snapshot as { settings: unknown; posts: Record<string, unknown>[]; projects: Record<string, unknown>[] }
  const r1 = await ed.sb.from('site_settings').upsert({ id: 1, data: normalizeSettings(snap.settings), updated_at: new Date().toISOString(), updated_by: ed.user.id })
  if (r1.error) return { ok: false as const, error: r1.error.message }
  if (what === 'all') {
    if (snap.projects?.length) {
      const r = await ed.sb.from('site_projects').upsert(snap.projects)
      if (r.error) return { ok: false as const, error: 'Projects: ' + r.error.message }
    }
    if (snap.posts?.length) {
      const r = await ed.sb.from('site_blog_posts').upsert(snap.posts)
      if (r.error) return { ok: false as const, error: 'Blog posts: ' + r.error.message }
    }
  }
  revalidatePath('/admin', 'layout')
  return { ok: true as const }
}
