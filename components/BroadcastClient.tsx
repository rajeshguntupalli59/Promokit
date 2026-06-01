'use client'

import { useState } from 'react'
import Link from 'next/link'

type Contact = { id: string; name: string | null; phone: string; created_at: string }

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function formatPhone(phone: string) {
  const clean = phone.replace(/\D/g, '')
  return clean.startsWith('91') ? clean : `91${clean}`
}

export default function BroadcastClient({ userId, contacts }: { userId: string; contacts: Contact[] }) {
  const [copied, setCopied] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [queueIndex, setQueueIndex] = useState<number | null>(null)
  const [openedSet, setOpenedSet] = useState<Set<string>>(new Set())

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const collectUrl = `${origin}/broadcast/collect?uid=${userId}`

  const filtered = contacts.filter(c =>
    (c.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const selectedContacts = contacts.filter(c => selected.has(c.id))

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() { setSelected(new Set(filtered.map(c => c.id))) }
  function clearAll() { setSelected(new Set()) }

  async function copyLink() {
    await navigator.clipboard.writeText(collectUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function startQueue() {
    if (!message.trim() || selectedContacts.length === 0) return
    setQueueIndex(0)
    setOpenedSet(new Set())
  }

  function openCurrent() {
    if (queueIndex === null) return
    const contact = selectedContacts[queueIndex]
    const enc = encodeURIComponent(message.trim())
    window.open(`https://wa.me/${formatPhone(contact.phone)}?text=${enc}`, '_blank')
    setOpenedSet(prev => new Set(Array.from(prev).concat(contact.id)))
  }

  function nextContact() {
    if (queueIndex === null) return
    const next = queueIndex + 1
    if (next >= selectedContacts.length) {
      setQueueIndex(null)
    } else {
      setQueueIndex(next)
    }
  }

  function cancelQueue() { setQueueIndex(null) }

  return (
    <div className="min-h-screen pt-20 pb-20 px-4" style={{ background: '#050508' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">WhatsApp Broadcast</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {contacts.length} contacts collected
            </p>
          </div>
          <Link href="/dashboard" className="btn-ghost px-4 py-2 rounded-xl text-sm font-semibold">
            ← Dashboard
          </Link>
        </div>

        {/* Collect link card */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: '#111', border: '1px solid rgba(255,215,0,0.2)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">📲</span>
            <div>
              <p className="font-bold text-white text-sm mb-0.5">Your Collection Link</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Share this link or QR code. Customers enter their number to receive your WhatsApp offers.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={collectUrl}
              className="form-input flex-1 text-xs"
              style={{ color: 'rgba(255,255,255,0.6)', cursor: 'text' }}
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0 transition-all"
              style={
                copied
                  ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
                  : { background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }
              }
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Contacts list */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold text-white text-sm">Contacts ({filtered.length})</h2>
            <div className="flex gap-2">
              {selected.size > 0 && (
                <button onClick={clearAll} className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Clear
                </button>
              )}
              <button
                onClick={selectAll}
                className="text-xs font-semibold px-3 py-1 rounded-lg"
                style={{ background: 'rgba(255,107,26,0.1)', color: '#FF6B1A' }}
              >
                Select all
              </button>
            </div>
          </div>

          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <input
              className="form-input text-sm"
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 12px' }}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">👥</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {search ? 'No matches' : 'No contacts yet — share your collection link'}
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filtered.map(c => (
                <label
                  key={c.id}
                  className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors hover:bg-white/[0.02]"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleSelect(c.id)}
                    className="w-4 h-4 rounded accent-orange-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{c.name ?? 'Unknown'}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.phone}</p>
                  </div>
                  <p className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {timeAgo(c.created_at)}
                  </p>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Compose + send */}
        {selected.size > 0 && queueIndex === null && (
          <div
            className="rounded-2xl p-5"
            style={{ background: '#111', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <p className="text-sm font-bold text-white mb-3">
              Send to {selected.size} contact{selected.size > 1 ? 's' : ''}
            </p>
            <textarea
              className="form-input mb-3"
              style={{ minHeight: '100px', resize: 'vertical' }}
              placeholder="Type your WhatsApp message here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button
              onClick={startQueue}
              disabled={!message.trim()}
              className="btn-primary w-full py-3 rounded-xl font-bold text-sm"
              style={{ opacity: !message.trim() ? 0.5 : 1 }}
            >
              💬 Start Sending ({selected.size} contacts) →
            </button>
          </div>
        )}

        {/* Sequential send queue */}
        {queueIndex !== null && (
          <div
            className="rounded-2xl p-5"
            style={{ background: '#111', border: '1px solid rgba(37,211,102,0.35)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-white">
                Sending {queueIndex + 1} of {selectedContacts.length}
              </p>
              <button onClick={cancelQueue} className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Cancel
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', height: '4px' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${((queueIndex) / selectedContacts.length) * 100}%`, background: '#25D366' }}
              />
            </div>

            <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-sm font-bold text-white">{selectedContacts[queueIndex]?.name ?? 'Unknown'}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                +{selectedContacts[queueIndex]?.phone}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={openCurrent}
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9 9 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
                Open WhatsApp
              </button>
              <button
                onClick={nextContact}
                className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {queueIndex + 1 >= selectedContacts.length ? 'Done ✓' : `Next (${queueIndex + 2}/${selectedContacts.length}) →`}
              </button>
            </div>

            {openedSet.size > 0 && (
              <p className="text-xs text-center mt-3" style={{ color: 'rgba(37,211,102,0.7)' }}>
                ✓ Opened for {openedSet.size} contact{openedSet.size > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
