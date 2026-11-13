import { notFound } from 'next/navigation'
import { requireEditor } from '@/lib/admin'
import PostForm from '@/components/admin/PostForm'
import type { Post } from '@/lib/types'

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { sb } = await requireEditor()
  let post: Partial<Post> = { status: 'draft', author: 'Coastline Films', publish_date: new Date().toISOString() }
  if (id !== 'new') {
    const { data } = await sb.from('site_blog_posts').select('*').eq('id', id).maybeSingle()
    if (!data) notFound()
    post = data as Post
  }
  const [{ data: projects }, { data: others }] = await Promise.all([
    sb.from('site_projects').select('id, name').order('name'),
    sb.from('site_blog_posts').select('id, name').order('name'),
  ])
  return (
    <main className="adm-wrap">
      <PostForm
        post={post}
        projects={(projects ?? []) as { id: string; name: string }[]}
        posts={((others ?? []) as { id: string; name: string }[]).filter((o) => o.id !== post.id)}
      />
    </main>
  )
}
