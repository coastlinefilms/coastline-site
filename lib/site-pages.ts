// Static (non-CMS) pages, in Webflow's sitemap order, with their Webflow "last updated"
// dates. When you change one of these pages in content/pages.json, bump its date.
export const STATIC_PAGES: { path: string; lastmod: string; sitemap: boolean }[] = [
  { path: '/', lastmod: '2026-11-14T05:20:00.000Z', sitemap: true },
  { path: '/work', lastmod: '2026-10-30T23:59:33.716Z', sitemap: true },
  { path: '/about', lastmod: '2026-10-25T17:02:52.459Z', sitemap: true },
  { path: '/contact', lastmod: '2026-11-12T21:58:56.774Z', sitemap: true },
  { path: '/blog', lastmod: '2026-11-14T05:55:00.000Z', sitemap: true },
  { path: '/video-production-cost-calculator', lastmod: '2026-11-01T15:23:59.741Z', sitemap: true },
  { path: '/squamish-videographer', lastmod: '2026-11-01T15:25:15.668Z', sitemap: true },
  { path: '/muskoka-toronto-videographer', lastmod: '2026-11-01T15:25:15.607Z', sitemap: true },
  { path: '/monthly-content-retainer', lastmod: '2026-10-31T00:20:12.311Z', sitemap: true },
  { path: '/video-production', lastmod: '2026-10-31T00:21:52.554Z', sitemap: true },
  { path: '/privacy', lastmod: '2026-11-10T00:34:33.393Z', sitemap: true },
  { path: '/sms-opt-in', lastmod: '2026-11-10T00:56:04.729Z', sitemap: true },
  { path: '/terms', lastmod: '2026-11-05T21:38:41.687Z', sitemap: true },
  { path: '/booked', lastmod: '2026-11-06T16:37:49.968Z', sitemap: true },
  { path: '/discovery-booked', lastmod: '2026-11-12T21:17:33.654Z', sitemap: true },
  // Live but noindex / excluded from the sitemap on Webflow
  { path: '/call-confirmed', lastmod: '2026-11-05T18:12:27.365Z', sitemap: false },
  { path: '/style-guide', lastmod: '2026-10-21T15:24:47.351Z', sitemap: false },
]
