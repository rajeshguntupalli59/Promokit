'use client'
import Link from 'next/link'
export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#050508' }}>
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Dashboard failed to load</h2>
        <p className="text-white/40 text-sm mb-6">Please try refreshing the page.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold">Refresh</button>
          <Link href="/create" className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-semibold">Create →</Link>
        </div>
      </div>
    </div>
  )
}
