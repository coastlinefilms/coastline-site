// Admin navigation, shared by the top bar and the sidebar.

export const TABS = [
  { key: 'dashboard', name: 'Dashboard', href: '/admin/dashboard' },
  { key: 'analytics', name: 'Analytics', href: '/admin/analytics' },
  { key: 'cms', name: 'CMS', href: '/admin/journal' },
] as const

export type TabKey = (typeof TABS)[number]['key']

export function tabFor(path: string): TabKey {
  if (path.startsWith('/admin/dashboard')) return 'dashboard'
  if (path.startsWith('/admin/analytics')) return 'analytics'
  return 'cms'
}

export const DASHBOARD_SECTIONS = [
  { slug: 'general', name: 'General' },
  { slug: 'site-access', name: 'Site access' },
  { slug: 'publishing', name: 'Publishing' },
  { slug: 'seo', name: 'SEO' },
  { slug: 'forms', name: 'Forms' },
  { slug: 'fonts', name: 'Fonts' },
  { slug: 'backups', name: 'Backups' },
  { slug: 'integrations', name: 'Apps & Integrations' },
  { slug: 'custom-code', name: 'Custom code' },
] as const

export type SectionSlug = (typeof DASHBOARD_SECTIONS)[number]['slug']

// Analytics views. Kept here (not in the 'use client' Insights component) so server pages can read it:
// a plain object imported from a client module arrives on the server as a placeholder, which made every view 404.
export const VIEWS = {
  overview: 'Site overview',
  pages: 'Pages',
  events: 'Events',
  sources: 'Traffic sources',
  audience: 'Audience',
} as const

export const ANALYTICS_VIEWS = [
  { href: '/admin/analytics', name: 'Site overview' },
  { href: '/admin/analytics/pages', name: 'Pages' },
  { href: '/admin/analytics/events', name: 'Events' },
  { href: '/admin/analytics/sources', name: 'Traffic sources' },
  { href: '/admin/analytics/audience', name: 'Audience' },
]

export const COLLECTIONS = [
  { href: '/admin/journal', name: 'Blog Posts', key: 'posts' as const },
  { href: '/admin/projects', name: 'Projects', key: 'projects' as const },
]
