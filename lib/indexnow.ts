import { SITE } from '@/lib/render/util'

/**
 * IndexNow: tells Bing, Yandex, Seznam, Naver and others (and the AI search tools built on Bing's index)
 * that a URL changed, so they re-crawl it now instead of whenever they next visit.
 * The key is public by design and is served from /public/<key>.txt.
 */
export const INDEXNOW_KEY = '32244418af94a5d75b34988e31f390f2'

const HOST = new URL(SITE).host

export type IndexNowResult = { ok: boolean; status: number; count: number; skipped?: string }

/** Ping IndexNow for up to 10,000 URLs. Only runs on the production deployment. */
export async function pingIndexNow(paths: string[]): Promise<IndexNowResult> {
  const urlList = [...new Set(paths.filter(Boolean).map((p) => (p.startsWith('http') ? p : SITE + (p === '/' ? '' : p))))]
  if (!urlList.length) return { ok: true, status: 0, count: 0, skipped: 'nothing to send' }
  if (process.env.VERCEL_ENV !== 'production') return { ok: true, status: 0, count: urlList.length, skipped: 'not production' }
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList }),
      signal: AbortSignal.timeout(8000),
    })
    // 200 = accepted, 202 = accepted (key check pending)
    return { ok: res.status === 200 || res.status === 202, status: res.status, count: urlList.length }
  } catch (e) {
    console.error('IndexNow ping failed', e)
    return { ok: false, status: 0, count: urlList.length }
  }
}
