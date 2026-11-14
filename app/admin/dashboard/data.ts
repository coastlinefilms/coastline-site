import { STATIC_PAGES } from '@/lib/site-pages'

export type DomainStatus = { host: string; role: string; points: 'vercel' | 'webflow' | 'other' | 'unknown'; detail: string }

const VERCEL = (v: string) => /vercel-dns\.com\.?$/.test(v) || /^76\.76\.21\./.test(v) || /^216\.198\.79\./.test(v) || /^216\.150\./.test(v)
const WEBFLOW = (v: string) => /webflow\.(com|io)\.?$/.test(v) || /^198\.202\.211\./.test(v) || /^75\.2\.70\.75$/.test(v) || /^99\.83\.190\.102$/.test(v)

async function resolve(name: string, type: 'A' | 'CNAME') {
  const r = await fetch(`https://dns.google/resolve?name=${name}&type=${type}`, { next: { revalidate: 120 } })
  const j = (await r.json()) as { Answer?: { type: number; data: string }[] }
  return (j.Answer ?? []).map((a) => a.data)
}

/** Where each domain currently points, from public DNS (refreshes every 2 minutes). */
export async function domainStatus(): Promise<DomainStatus[]> {
  const hosts = [
    { host: 'www.coastlinefilms.ca', role: 'Default domain' },
    { host: 'coastlinefilms.ca', role: 'Redirects to www' },
  ]
  return Promise.all(
    hosts.map(async (h) => {
      try {
        const answers = [...(await resolve(h.host, 'CNAME')), ...(await resolve(h.host, 'A'))]
        const points = answers.some(VERCEL) ? 'vercel' : answers.some(WEBFLOW) ? 'webflow' : answers.length ? 'other' : 'unknown'
        return { ...h, points, detail: [...new Set(answers)].join(', ') || 'No records found' } as DomainStatus
      } catch {
        return { ...h, points: 'unknown', detail: 'DNS lookup failed' } as DomainStatus
      }
    }),
  )
}

export function buildInfo() {
  return {
    message: process.env.VERCEL_GIT_COMMIT_MESSAGE?.split('\n')[0] ?? 'Local build',
    sha: (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7),
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? '',
    builtAt: process.env.CF_BUILD_TIME ?? '',
    env: process.env.VERCEL_ENV ?? 'development',
    url: process.env.VERCEL_URL ?? '',
  }
}

export const STATIC_SITEMAP_COUNT = STATIC_PAGES.filter((p) => p.sitemap).length
