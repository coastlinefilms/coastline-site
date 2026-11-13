import Link from 'next/link'
import { requireEditor } from '@/lib/admin'
import type { Project } from '@/lib/types'

export default async function ProjectList() {
  const { sb } = await requireEditor()
  const { data } = await sb
    .from('site_projects')
    .select('id, slug, name, client, status, featured, sort_order, thumbnail, created_at')
    .order('created_at', { ascending: false })
  const items = (data ?? []) as Pick<Project, 'id' | 'slug' | 'name' | 'client' | 'status' | 'featured' | 'sort_order' | 'thumbnail' | 'created_at'>[]
  return (
    <main className="adm-wrap">
      <div className="row" style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Projects</h1>
        <span className="sp" />
        <Link className="btn primary" href="/admin/projects/new">New project</Link>
      </div>
      <p className="note">The Work page lists published projects newest first. Featured projects appear on the home page in Sort Order.</p>
      <table>
        <thead><tr><th /><th>Project</th><th>Client</th><th>Home</th><th>Status</th><th /></tr></thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.thumbnail?.url ? <img className="thumb" src={p.thumbnail.url} alt="" /> : <span className="thumb" />}</td>
              <td><Link href={`/admin/projects/${p.id}`}>{p.name}</Link><div className="note">/projects/{p.slug}</div></td>
              <td className="note">{p.client}</td>
              <td className="note">{p.featured ? `Featured #${p.sort_order ?? '–'}` : ''}</td>
              <td><span className={`pill ${p.status === 'published' ? 'pub' : ''}`}>{p.status}</span></td>
              <td>{p.status === 'published' && <a className="note" href={`/projects/${p.slug}`} target="_blank" rel="noopener">View ↗</a>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
