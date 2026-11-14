import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
      // Self-hosted hero videos
      { source: '/videos/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
    ]
  },
  async redirects() {
    return [
      // The blog index moved from /journal to /blog (Nov 2026); keep old links and rankings
      { source: '/journal', destination: '/blog', statusCode: 301 },
    ]
  },
}

export default nextConfig
