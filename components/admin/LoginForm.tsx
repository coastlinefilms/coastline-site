'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { error } = await sb.auth.signInWithPassword({ email, password })
    if (error) {
      setErr(error.message)
      setBusy(false)
      return
    }
    window.location.href = '/admin/journal'
  }

  return (
    <form onSubmit={submit}>
      <div className="wf-field"><span className="lbl">Email</span><input className="wf-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
      <div className="wf-field"><span className="lbl">Password</span><input className="wf-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></div>
      {err && <div className="wf-warn">{err}</div>}
      <button className="wf-btn blue" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}
