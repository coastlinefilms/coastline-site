// Static (non-CMS) pages, in Webflow's sitemap order, with their Webflow "last updated"
// dates. When you change one of these pages in content/pages.json, bump its date.
export const STATIC_PAGES: { path: string; lastmod: string; sitemap: boolean }[] = [
  { path: '/', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/work', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/about', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/contact', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/blog', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/video-production-cost-calculator', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/squamish-videographer', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/muskoka-toronto-videographer', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/monthly-content-retainer', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/video-production', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/privacy', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/sms-opt-in', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/terms', lastmod: '2026-11-15T21:45:00.000Z', sitemap: true },
  { path: '/booked', lastmod: '2026-11-06T16:37:49.968Z', sitemap: false },
  { path: '/discovery-booked', lastmod: '2026-11-12T21:17:33.654Z', sitemap: false },
  // Live but noindex / excluded from the sitemap (booked pages: thank-you pages, Nov 2026)
  { path: '/call-confirmed', lastmod: '2026-11-05T18:12:27.365Z', sitemap: false },
  { path: '/style-guide', lastmod: '2026-10-21T15:24:47.351Z', sitemap: false },
]
