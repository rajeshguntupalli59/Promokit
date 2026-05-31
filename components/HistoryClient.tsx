'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type BusinessRef = {
  type: string
  location: string
  whatsapp: string
  language: string
  logo_url: string | null
}

type Generation = {
  id: string
  business_name: string
  content: Record<string, unknown>
  created_at: string
  businesses?: BusinessRef | null
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function HistoryClient({ generations }: { generations: Generation[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  const filtered = generations.filter(g =>
    g.business_name.toLowerCase().includes(search.toLowerCase())
  )

  function loadGeneration(gen: Generation) {
    const biz = gen.businesses
    const payload = {
      success: true,
      data: gen.content,
      business: {
        businessName: gen.business_name,
        businessType: biz?.type ?? '',
        location: biz?.location ?? '',
        whatsapp: biz?.whatsapp ?? '',
        language: biz?.language ?? 'English',
        logoUrl: biz?.logo_url ?? '',
      },
    }
    localStorage.setItem('promokit_result', JSON.stringify(payload))
    router.push('/results')
  }

  async function regenerateGeneration(e: React.MouseEvent, gen: Generation) {
    e.stopPropagation()
    if (regeneratingId) return
    setRegeneratingId(gen.id)
    try {
      const biz = gen.businesses
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: gen.business_name,
          businessType: biz?.type ?? 'General Store',
          description: biz?.type ?? 'Quality products and services',
          location: biz?.location ?? '',
          whatsapp: biz?.whatsapp ?? '',
          language: biz?.language ?? 'English',
          tone: 'Friendly & Warm',
          festivals: false,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        localStorage.setItem('promokit_result', JSON.stringify(json))
        localStorage.setItem('promokit_plan', json.plan ?? 'free')
        router.push('/results')
      } else {
        alert(json.error ?? 'Regeneration failed')
      }
    } finally {
      setRegeneratingId(null)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-20 px-4" style={{ background: '#050508' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Generation History</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {generations.length} total generations
            </p>
          </div>
          <Link href="/create" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold">
            New PromoKit →
          </Link>
        </div>

        {/* Search */}
        <input
          className="form-input mb-6"
          placeholder="Search by business name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-white/40">{search ? 'No matches found' : 'No generations yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(gen => {
              const content = gen.content as { flyerTagline?: string; whatsapp?: string[] }
              const wa0 = content?.whatsapp?.[0]
              const preview = content?.flyerTagline ?? (wa0 ? wa0.slice(0, 80) + '…' : '')
              return (
                <button
                  key={gen.id}
                  onClick={() => loadGeneration(gen)}
                  className="w-full text-left rounded-2xl px-5 py-4 transition-all duration-150 group"
                  style={{
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-black"
                        style={{ background: 'rgba(255,107,26,0.15)', color: '#FF6B1A' }}
                      >
                        {gen.business_name[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{gen.business_name}</p>
                        {preview && (
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {preview}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {timeAgo(gen.created_at)}
                      </span>
                      <button
                        onClick={(e) => regenerateGeneration(e, gen)}
                        disabled={regeneratingId === gen.id}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8' }}
                      >
                        {regeneratingId === gen.id ? '⏳' : '↻ New'}
                      </button>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(255,107,26,0.15)', color: '#FF6B1A' }}
                      >
                        View →
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
