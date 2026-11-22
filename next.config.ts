import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Shown in admin > Dashboard > Publishing
  env: { CF_BUILD_TIME: new Date().toISOString() },
  // Webflow served URLs without trailing slashes; /work/ -> /work
  trailingSlash: false,
  poweredByHeader: false,
  // Phone-sized copies of the big Blob images (lib/render/perf.ts), served from this domain
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'six9ethpn7gbia9t.public.blob.vercel-storage.com', pathname: '/site/**' }],
    qualities: [70, 75],
    formats: ['image/webp'],
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      // Baseline security headers on every response (Nov 2026 audit)
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
        ],
      },
      // The admin can never be framed, even by the site itself
      { source: '/admin/:path*', headers: [{ key: 'X-Frame-Options', value: 'DENY' }, { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" }] },
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
      // Header logo reveal sprite (public/cf-logo-anim.js). Versioned name, so it can be cached for good
      { source: '/logo-reveal-v1.webp', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ]
  },
  async redirects() {
    return [
      // /journal is NOT redirected: it renders the blog index with a canonical to /blog (lib/render/page.ts),
      // because browsers that kept Webflow's old /blog -> /journal 301 would loop
      // Other redirects (mirrored from Webflow) live in admin > Dashboard > Publishing
      { source: '/admin/insights', destination: '/admin/analytics', permanent: false },
      { source: '/admin/insights/:view', destination: '/admin/analytics/:view', permanent: false },
    ]
  },
}

export default nextConfig
