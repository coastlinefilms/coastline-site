import { dangerouslyDeleteByTag } from '@vercel/functions'

/** Every public page, the sitemap and robots.txt carry this CDN cache tag (see the route handlers). */
export const SITE_CACHE_TAG = 'site'

/**
 * Drop the cached copies of the public site from Vercel's CDN so a CMS or Dashboard change
 * shows up on the very next visit (otherwise stale-while-revalidate can serve the old page once).
 * Never throws: a failed purge only means the change shows up within a minute instead.
 */
export async function purgeSite() {
  if (!process.env.VERCEL) return
  try {
    await dangerouslyDeleteByTag(SITE_CACHE_TAG)
  } catch (e) {
    console.error('CDN purge failed', e)
  }
}
