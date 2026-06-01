'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email, password }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed'); setLoading(false); return }
    router.push('/auth/login?reset=1')
  }

  if (!token || !email) {
    return <p style={{ color: '#f87171', textAlign: 'center' }}>Invalid reset link. <Link href="/auth/forgot-password" style={{ color: '#FF6B1A' }}>Request a new one →</Link></p>
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>Choose a strong password for your account</p>
      </div>
      {error && <div className="rounded-xl px-4 py-3 mb-5 text-sm font-medium" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="form-label">New Password</label>
          <input type="password" className="form-input" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm font-bold rounded-xl" style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Saving...' : 'Set New Password →'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#000' }}>
      <div className="orb w-96 h-96 pointer-events-none" style={{ background: 'rgba(255,107,26,0.12)', top: '10%', left: '50%', transform: 'translateX(-50%)', position: 'fixed' }} />
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B1A, #FFD700)', boxShadow: '0 0 24px rgba(255,107,26,0.55)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" /></svg>
          </div>
          <span className="font-black text-2xl tracking-tight" style={{ background: 'linear-gradient(135deg, #FF6B1A, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>PromoKit</span>
        </div>
        <div className="rounded-2xl p-8" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 120px rgba(0,0,0,0.6)' }}>
          <Suspense fallback={<div className="text-white/50 text-center py-4">Loading...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
