import LoginForm from '@/components/admin/LoginForm'

export default async function Login({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams
  return (
    <div className="login">
      <h1>Site admin</h1>
      <p className="note">Sign in with your Coastline Films portal account.</p>
      {denied && <p className="warn">That account can&apos;t edit the website. Only Super Admins and Admins can.</p>}
      <LoginForm />
    </div>
  )
}
