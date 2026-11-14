import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Webflow served URLs without trailing slashes; /work/ -> /work
  trailingSlash: false,
  poweredByHeader: false,
  async redirects() {
    return [
      // The blog index moved from /journal to /blog (Nov 2026); keep old links and rankings
      { source: '/journal', destination: '/blog', statusCode: 301 },
    ]
  },
}

export default nextConfig
