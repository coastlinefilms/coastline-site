import { timingSafeEqual } from 'node:crypto'

/** Guards the one-time setup endpoints with SETUP_SECRET (header x-setup-secret). */
export function setupAllowed(req: Request) {
  const want = process.env.SETUP_SECRET
  const got = req.headers.get('x-setup-secret') ?? new URL(req.url).searchParams.get('secret')
  if (!want || !got) return false
  const a = Buffer.from(want), b = Buffer.from(got)
  return a.length === b.length && timingSafeEqual(a, b)
}
