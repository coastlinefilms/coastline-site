import type { Metadata } from 'next'

// Only the /admin area renders through React; every public page is served as Webflow HTML by app/[[...path]]/route.ts
export const metadata: Metadata = {
  title: 'Coastline Films Admin',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
