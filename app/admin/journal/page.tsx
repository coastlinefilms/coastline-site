import Link from 'next/link'
import { requireEditor } from '@/lib/admin'
import { formatDate } from '@/lib/render/util'
import type { Post } from '@/lib/types'

export default async function JournalList() {
  const { sb } = await requireEditor()
  const { data } = await sb
    .from('site_blog_posts')
    .select('id, slug, name, status, category, publish_date, hero_image, journal_featured, updated_at')
    .order('publish_date', { ascending: false, nullsFirst: true })
  const posts = (data ?? []) as Pick<Post, 'id' | 'slug' | 'name' | 'status' | 'category' | 'publish_date' | 'hero_image' | 'journal_featured' | 'updated_at'>[]
  return (
    <main className="adm-wrap">
      <div className="row" style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Journal</h1>
        <span className="sp" />
        <Link className="btn primary" href="/admin/journal/new">New post</Link>
      </div>
      <table>
        <thead><tr><th /><th>Title</th><th>Category</th><th>Publish date</th><th>Status</th><th /></tr></thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <td>{p.hero_image?.url ? <img className="thumb" src={p.hero_image.url} alt="" /> : <span className="thumb" />}</td>
              <td>
                <Link href={`/admin/journal/${p.id}`}>{p.name}</Link>
                {p.journal_featured && <span className="pill" style={{ marginLeft: 8 }}>Featured</span>}
                <div className="note">/blog/{p.slug}</div>
              </td>
              <td className="note">{p.category}</td>
              <td className="note">{formatDate(p.publish_date)}</td>
              <td><span className={`pill ${p.status === 'published' ? 'pub' : ''}`}>{p.status}</span></td>
              <td>{p.status === 'published' && <a className="note" href={`/blog/${p.slug}`} target="_blank" rel="noopener">View ↗</a>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
