import { publicClient } from '@/lib/supabase/public'

export const runtime = 'nodejs'

/**
 * Contact quiz lead capture (Nov 2026). The quiz posts here as soon as someone gives a name and email,
 * and again with every answer when they reach the calendar, so a drop-off before booking is not lost.
 * Stored through the site_capture_lead() database function (validates and size-limits the data).
 * If LEAD_WEBHOOK_URL is set (e.g. a LeadConnector inbound webhook), the lead is forwarded there too.
 */
const ALLOWED_HOST = /(^|\.)coastlinefilms\.ca$|\.vercel\.app$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export async function POST(req: Request) {
  const origin = req.headers.get('origin')
  try {
    if (!origin || !ALLOWED_HOST.test(new URL(origin).hostname)) return new Response(null, { status: 403 })
  } catch {
    return new Response(null, { status: 403 })
  }
  const text = await req.text()
  if (text.length > 10000) return new Response(null, { status: 413 })
  let b: Record<string, unknown>
  try { b = JSON.parse(text) } catch { return new Response(null, { status: 400 }) }

  const id = typeof b.id === 'string' && UUID.test(b.id) ? b.id : null
  const email = typeof b.email === 'string' ? b.email.trim().slice(0, 200) : ''
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 120) : ''
  const stage = b.stage === 'completed' ? 'completed' : 'started'
  if (!id || !EMAIL.test(email)) return new Response(null, { status: 400 })

  const answers: Record<string, string> = {}
  if (b.answers && typeof b.answers === 'object') {
    for (const [k, v] of Object.entries(b.answers as Record<string, unknown>).slice(0, 30)) {
      if (typeof v === 'string' && /^[a-z0-9_]{1,40}$/.test(k)) answers[k] = v.slice(0, 1500)
    }
  }
  const source = typeof b.source === 'string' ? b.source.slice(0, 300) : null

  const { error } = await publicClient().rpc('site_capture_lead', {
    p_id: id, p_name: name, p_email: email, p_stage: stage, p_answers: answers, p_source: source,
  })
  if (error) console.error('lead capture failed', error.message)

  const hook = process.env.LEAD_WEBHOOK_URL
  if (hook) {
    try {
      await fetch(hook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, name, email, stage, source, ...answers }),
        signal: AbortSignal.timeout(5000),
      })
    } catch (e) {
      console.error('lead webhook failed', e)
    }
  }
  return new Response(null, { status: 204 })
}
