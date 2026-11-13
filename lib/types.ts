export type Img = { url: string; alt?: string | null; srcset?: string | null } | null

export type Project = {
  id: string
  slug: string
  name: string
  client: string | null
  project_type: string | null
  brief: string | null
  outcome: string | null
  featured: boolean
  sort_order: number | null
  header: Img
  logo: Img
  thumbnail: Img
  hover_video_url: string | null
  hero_video: string | null
  video_2: string | null
  video_3: string | null
  gallery: Img[]
  director: string | null
  dop: string | null
  producer: string | null
  edit: string | null
  colour: string | null
  sound: string | null
  seo_title: string | null
  meta_description: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
  webflow_id: string | null
}

export type Post = {
  id: string
  slug: string
  name: string
  excerpt: string | null
  seo_title: string | null
  meta_description: string | null
  target_keyword: string | null
  category: string | null
  author: string | null
  reading_time_minutes: number | null
  publish_date: string | null
  hero_image: Img
  og_image: Img
  og_image_caption: string | null
  vimeo_id: string | null
  body_part_1: string | null
  body_part_2: string | null
  body_part_3: string | null
  section_image_1: Img
  section_image_1_caption: string | null
  section_image_2: Img
  section_image_2_caption: string | null
  legacy_body: string | null
  review_notes: string | null
  related_project_id: string | null
  related_post_ids: string[]
  journal_featured: boolean
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
  webflow_id: string | null
}

export const BLOG_CATEGORIES = ['Project Breakdown', 'Buyer Guide', 'Behind the Scenes'] as const
export const PROJECT_TYPES = ['Commercial', 'Social Campaign', 'Brand Documentary', 'Tourism & Hospitality'] as const
