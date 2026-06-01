'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const refCode = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') : null

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, referredBy: refCode }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Registration failed'); setLoading(false); return }

    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) { setError('Account created but login failed. Please sign in.'); setLoading(false); return }
    router.push('/dashboard')
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#000' }}>
      <div className="orb w-96 h-96 pointer-events-none" style={{ background: 'rgba(255,107,26,0.12)', top: '5%', left: '50%', transform: 'translateX(-50%)', position: 'fixed' }} />
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B1A, #FFD700)', boxShadow: '0 0 24px rgba(255,107,26,0.55)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" /></svg>
          </div>
          <span className="font-black text-2xl tracking-tight" style={{ background: 'linear-gradient(135deg, #FF6B1A, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>PromoKit</span>
        </div>
        <div className="rounded-2xl p-8" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 120px rgba(0,0,0,0.6)' }}>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>Free forever. No credit card needed.</p>
          </div>
          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 rounded-xl py-3 mb-6 font-semibold text-sm transition-all duration-200 hover:opacity-90" style={{ background: '#fff', color: '#111', border: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-4 mb-6">
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 500 }}>or continue with email</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>
          {error && <div className="rounded-xl px-4 py-3 mb-5 text-sm font-medium" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="form-label">Full name</label>
              <input type="text" className="form-input" placeholder="Rajesh Kumar" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
            </div>
            <div>
              <label className="form-label">Email address</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" style={{ paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm font-bold rounded-xl mt-1" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
          <p className="text-center mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Already have an account?{' '}<Link href="/auth/login" style={{ color: '#FF6B1A', fontWeight: 600 }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
