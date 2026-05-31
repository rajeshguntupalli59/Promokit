'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Festival = {
  name: string
  emoji: string
  date: string // YYYY-MM-DD
  occasion: string
  badge: string
}

const FESTIVALS: Festival[] = [
  { name: 'Eid al-Adha', emoji: '🌙', date: '2026-06-07', occasion: 'Eid', badge: 'EID MUBARAK' },
  { name: 'Guru Purnima', emoji: '🙏', date: '2026-07-10', occasion: 'Guru Purnima', badge: 'GURU PURNIMA SPECIAL' },
  { name: 'Independence Day', emoji: '🇮🇳', date: '2026-08-15', occasion: 'Independence Day', badge: 'AZADI KA AMRIT' },
  { name: 'Ganesh Chaturthi', emoji: '🐘', date: '2026-08-23', occasion: 'Ganesh Chaturthi', badge: 'GANPATI BAPPA MORYA' },
  { name: 'Onam', emoji: '🌸', date: '2026-08-25', occasion: 'Onam', badge: 'ONAM SPECIAL' },
  { name: 'Navratri', emoji: '🎺', date: '2026-09-21', occasion: 'Navratri', badge: 'NAVRATRI SPECIAL' },
  { name: 'Dussehra', emoji: '🏹', date: '2026-10-01', occasion: 'Dussehra', badge: 'VIJAYADASHAMI OFFER' },
  { name: 'Diwali', emoji: '🪔', date: '2026-10-20', occasion: 'Diwali', badge: 'DIWALI DHAMAKA' },
  { name: 'Bhai Dooj', emoji: '🎁', date: '2026-10-22', occasion: 'Bhai Dooj', badge: 'BHAI DOOJ SPECIAL' },
  { name: 'Christmas', emoji: '🎄', date: '2026-12-25', occasion: 'Christmas', badge: 'CHRISTMAS SALE' },
  { name: 'New Year', emoji: '🎆', date: '2027-01-01', occasion: 'New Year', badge: 'NEW YEAR OFFER' },
  { name: 'Makar Sankranti', emoji: '🪁', date: '2027-01-14', occasion: 'Pongal', badge: 'SANKRANTI SPECIAL' },
  { name: 'Republic Day', emoji: '🇮🇳', date: '2027-01-26', occasion: 'Independence Day', badge: 'REPUBLIC DAY SALE' },
  { name: 'Holi', emoji: '🌈', date: '2027-03-01', occasion: 'Holi', badge: 'HOLI DHAMAKA' },
]

function getUpcomingFestival(): (Festival & { daysAway: number }) | null {
  const now = new Date()
  for (const f of FESTIVALS) {
    const d = new Date(f.date)
    const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000)
    if (diff >= 0 && diff <= 14) return { ...f, daysAway: diff }
  }
  return null
}

type SavedBusiness = { id: string; name: string; type: string; description: string; location: string; whatsapp: string; language: string; tone: string }

export default function FestiveBanner() {
  const router = useRouter()
  const [festival, setFestival] = useState<(Festival & { daysAway: number }) | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [businesses, setBusinesses] = useState<SavedBusiness[]>([])

  useEffect(() => {
    const f = getUpcomingFestival()
    if (!f) return
    const key = `promokit_festive_dismissed_${f.name}`
    if (localStorage.getItem(key)) return
    setFestival(f)
    fetch('/api/businesses').then(r => r.ok ? r.json() : null).then(j => {
      if (j?.businesses?.length) setBusinesses(j.businesses)
    }).catch(() => {})
  }, [])

  if (!festival || dismissed) return null

  async function generateFestive() {
    if (!festival) return
    setLoading(true)
    const biz = businesses[0]
    const body = biz
      ? { businessName: biz.name, businessType: biz.type, description: biz.description, location: biz.location, whatsapp: biz.whatsapp, language: biz.language, tone: biz.tone, festivals: true, offerEnabled: true, offerOccasion: festival.occasion, offerBadge: festival.badge }
      : { businessName: 'My Business', businessType: 'Kirana Store', description: 'Quality products', location: 'India', language: 'Hindi', tone: 'Festive & Energetic', festivals: true, offerEnabled: true, offerOccasion: festival.occasion, offerBadge: festival.badge }

    const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()
    if (res.ok) {
      localStorage.setItem('promokit_result', JSON.stringify(json))
      localStorage.setItem('promokit_plan', json.plan ?? 'free')
      router.push('/results')
    }
    setLoading(false)
  }

  function dismiss() {
    if (!festival) return
    localStorage.setItem(`promokit_festive_dismissed_${festival.name}`, '1')
    setDismissed(true)
  }

  const urgency = festival.daysAway === 0 ? 'Today!' : festival.daysAway === 1 ? 'Tomorrow!' : `In ${festival.daysAway} days`

  return (
    <div
      className="rounded-2xl p-4 mb-6 flex items-center justify-between gap-4"
      style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.25)' }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-3xl flex-shrink-0">{festival.emoji}</span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">
            {festival.name} is <span style={{ color: '#FFD700' }}>{urgency}</span>
          </p>
          <p className="text-xs text-white/45 truncate">
            {businesses.length > 0 ? `Generate ${festival.name} content for ${businesses[0].name}` : 'Generate festive promotional content now'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={generateFestive}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
          style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.4)' }}
        >
          {loading ? '⏳ Generating…' : `Generate ${festival.emoji}`}
        </button>
        <button onClick={dismiss} className="text-white/25 hover:text-white/50 transition-colors text-lg leading-none">×</button>
      </div>
    </div>
  )
}
