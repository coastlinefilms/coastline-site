import sharp from 'sharp'

/**
 * Serves a CMS logo with its transparent padding trimmed off, so small logo slots
 * (e.g. the home carousel cards) show the mark itself rather than a padded square.
 * Only our own Blob store and /logos/ files are accepted.
 */
const BLOB_HOST = 'six9ethpn7gbia9t.public.blob.vercel-storage.com'

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get('u') ?? ''
  let src: URL
  try {
    src = new URL(u, req.url)
  } catch {
    return new Response('Bad url', { status: 400 })
  }
  const own = src.origin === new URL(req.url).origin && src.pathname.startsWith('/logos/')
  if (!(src.protocol === 'https:' && src.hostname === BLOB_HOST) && !own) return new Response('Not allowed', { status: 400 })

  const res = await fetch(src, { cache: 'force-cache' })
  if (!res.ok) return new Response('Not found', { status: 404 })
  const input = Buffer.from(await res.arrayBuffer())
  let out: Buffer
  try {
    // trim the padding, then add a small transparent margin back so anti-aliased edges never clip
    const trimmed = await sharp(input).trim({ threshold: 1 }).png().toBuffer()
    const meta = await sharp(trimmed).metadata()
    const pad = Math.max(2, Math.round(Math.max(meta.width ?? 0, meta.height ?? 0) * 0.04))
    out = await sharp(trimmed)
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ lossless: true })
      .toBuffer()
  } catch {
    out = input
  }
  return new Response(new Uint8Array(out), {
    headers: {
      'content-type': 'image/webp',
      'cache-control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    },
  })
}
