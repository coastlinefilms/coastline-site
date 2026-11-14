import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Shown in admin > Dashboard > Publishing
  env: { CF_BUILD_TIME: new Date().toISOString() },
  // Webflow served URLs without trailing slashes; /work/ -> /work
  trailingSlash: false,
  poweredByHeader: false,
  async headers() {
    return [
      // Keep the temporary *.vercel.app address out of search results; the real domain is unaffected
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?<sub>.*)\\.vercel\\.app' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      // The admin and API never belong in search results
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] },
      { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      // Self-hosted hero videos
      { source: '/videos/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
    ]
  },
  async redirects() {
    return [
      // The blog index moved from /journal to /blog (Nov 2026); keep old links and rankings
      { source: '/journal', destination: '/blog', statusCode: 301 },
      // Other redirects (mirrored from Webflow) live in admin > Dashboard > Publishing
      { source: '/admin/insights', destination: '/admin/analytics', permanent: false },
      { source: '/admin/insights/:view', destination: '/admin/analytics/:view', permanent: false },
    ]
  },
}

export default nextConfig
