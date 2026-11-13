import { publicClient } from '@/lib/supabase/public'
import type { Post, Project } from '@/lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Public reads go through RLS (published rows only). Pass an authenticated
// client to read drafts for admin previews.
export async function listProjects(sb: SupabaseClient = publicClient()): Promise<Project[]> {
  const { data, error } = await sb.from('site_projects').select('*').eq('status', 'published')
  if (error) throw error
  return (data ?? []) as Project[]
}

export async function listPosts(sb: SupabaseClient = publicClient()): Promise<Post[]> {
  const { data, error } = await sb.from('site_blog_posts').select('*').eq('status', 'published')
  if (error) throw error
  return (data ?? []) as Post[]
}

export async function getProject(slug: string, sb: SupabaseClient = publicClient()) {
  const { data, error } = await sb.from('site_projects').select('*').eq('slug', slug).eq('status', 'published').maybeSingle()
  if (error) throw error
  return data as Project | null
}

export async function getPost(slug: string, sb: SupabaseClient = publicClient()) {
  const { data, error } = await sb.from('site_blog_posts').select('*').eq('slug', slug).eq('status', 'published').maybeSingle()
  if (error) throw error
  return data as Post | null
}
