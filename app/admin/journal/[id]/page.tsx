import { notFound } from 'next/navigation'
import { requireEditor } from '@/lib/admin'
import ItemList from '@/components/admin/ItemList'
import PostForm from '@/components/admin/PostForm'
import type { Post } from '@/lib/types'

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { sb } = await requireEditor()
  let post: Partial<Post> = { status: 'draft', author: 'Coastline Films', publish_date: new Date().toISOString(), related_post_ids: [] }
  if (id !== 'new') {
    const { data } = await sb.from('site_blog_posts').select('*').eq('id', id).maybeSingle()
    if (!data) notFound()
    post = data as Post
  }
  const [{ data: projects }, { data: list }] = await Promise.all([
    sb.from('site_projects').select('id, name').order('name'),
    sb.from('site_blog_posts').select('id, name, status').order('created_at', { ascending: false }),
  ])
  const items = (list ?? []) as { id: string; name: string; status: string }[]
  return (
    <div className="wf-main">
      <div className="wf-itemview">
        <ItemList title="Blog Posts" base="/admin/journal" items={items} activeId={post.id} />
        <PostForm
          key={post.id ?? 'new'}
          post={post}
          projects={(projects ?? []) as { id: string; name: string }[]}
          posts={items.filter((o) => o.id !== post.id)}
        />
      </div>
    </div>
  )
}
