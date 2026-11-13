import LoginForm from '@/components/admin/LoginForm'

export default async function Login({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams
  return (
    <div className="wf-login">
      <div className="wf-login-card">
        <h1>Coastline Films CMS</h1>
        <p>Sign in with your Coastline portal account.</p>
        {denied && <div className="wf-warn" style={{ marginBottom: 14 }}>That account can&apos;t edit the website. Only Super Admins and Admins can.</div>}
        <LoginForm />
      </div>
    </div>
  )
}
