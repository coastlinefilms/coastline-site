import { compress } from 'wawoff2'

export const runtime = 'nodejs'

/**
 * Neue Montreal as WOFF2 (Nov 2026). The licensed .otf files live on our Blob store; each one is
 * converted to WOFF2 (about 60% smaller) the first time it is asked for, then cached at the CDN for good.
 * Only the eight known faces are served.
 */
const BLOB = 'https://six9ethpn7gbia9t.public.blob.vercel-storage.com/site/cdn/'
const FILES: Record<string, string> = {
  'NeueMontreal-Light.woff2': '69fe5eebc49709e5f2e71d41_NeueMontreal-Light.otf',
  'NeueMontreal-LightItalic.woff2': '69fe5eeb1174577a74d3bf8f_NeueMontreal-LightItalic.otf',
  'NeueMontreal-Regular.woff2': '69fe5eebe2ba2ec1a3bac0f3_NeueMontreal-Regular.otf',
  'NeueMontreal-Italic.woff2': '69fe5eeb5bb8e98d36feff6c_NeueMontreal-Italic.otf',
  'NeueMontreal-Medium.woff2': '69fe5eeb3135ee46148d663e_NeueMontreal-Medium.otf',
  'NeueMontreal-MediumItalic.woff2': '69fe5eeb5bb8e98d36feff67_NeueMontreal-MediumItalic.otf',
  'NeueMontreal-Bold.woff2': '69fe5eeb79f82558bae2b9d0_NeueMontreal-Bold.otf',
  'NeueMontreal-BoldItalic.woff2': '69fe5eeb92a57ef02ca9e1de_NeueMontreal-BoldItalic.otf',
}

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params
  const src = FILES[file]
  if (!src) return new Response('Not found', { status: 404 })
  const res = await fetch(BLOB + src, { cache: 'force-cache' })
  if (!res.ok) return new Response('Not found', { status: 404 })
  const woff2 = await compress(new Uint8Array(await res.arrayBuffer()))
  return new Response(new Uint8Array(woff2), {
    headers: {
      'content-type': 'font/woff2',
      'cache-control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      'access-control-allow-origin': '*',
    },
  })
}
