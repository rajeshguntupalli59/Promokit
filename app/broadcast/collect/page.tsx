'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CollectForm() {
  const params = useSearchParams()
  const ownerId = params.get('uid') ?? ''
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ownerId) { setError('Invalid link'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/broadcast/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId, name, phone }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed'); setLoading(false); return }
    setDone(true)
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#000' }}>
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-white mb-2">You&apos;re on the list!</h2>
        <p className="text-white/50 text-sm">You&apos;ll receive exclusive offers on WhatsApp.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#000' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📲</div>
          <h1 className="text-2xl font-bold text-white mb-1">Get Exclusive Offers</h1>
          <p className="text-white/45 text-sm">Enter your number to receive WhatsApp deals</p>
        </div>

        <div
          className="rounded-2xl p-7"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {error && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Your Name (optional)</label>
              <input
                className="form-input"
                placeholder="Ramesh"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">WhatsApp Number *</label>
              <input
                className="form-input"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 font-bold rounded-xl text-sm"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Saving...' : 'Get Offers on WhatsApp →'}
            </button>
          </form>
          <p className="text-xs text-center mt-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
            We&apos;ll never spam. Unsubscribe any time.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CollectPage() {
  return <Suspense><CollectForm /></Suspense>
}
