import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Webflow served URLs without trailing slashes; /work/ -> /work
  trailingSlash: false,
  poweredByHeader: false,
  async redirects() {
    return [
      // Live on Webflow today: /blog redirects to the Journal index
      { source: '/blog', destination: '/journal', statusCode: 301 },
    ]
  },
}

export default nextConfig
