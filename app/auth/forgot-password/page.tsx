'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed'); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

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
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#22C55E"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Check your email</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.6 }}>
                If <strong style={{ color: '#fff' }}>{email}</strong> is registered, a reset link has been sent. It expires in 1 hour.
              </p>
              <Link href="/auth/login" className="inline-block mt-6 text-sm font-semibold" style={{ color: '#FF6B1A' }}>Back to Sign In →</Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Reset password</h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>Enter your email and we&apos;ll send a reset link</p>
              </div>
              {error && <div className="rounded-xl px-4 py-3 mb-5 text-sm font-medium" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>{error}</div>}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="form-label">Email address</label>
                  <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm font-bold rounded-xl" style={{ opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>
              </form>
              <p className="text-center mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Remember it?{' '}<Link href="/auth/login" style={{ color: '#FF6B1A', fontWeight: 600 }}>Sign in →</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
