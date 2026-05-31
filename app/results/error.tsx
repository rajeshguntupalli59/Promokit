'use client'
import Link from 'next/link'
export default function ResultsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#050508' }}>
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-white/40 text-sm mb-6">Your results couldn&apos;t load. Try regenerating.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold">Try Again</button>
          <Link href="/create" className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-semibold">Regenerate →</Link>
        </div>
      </div>
    </div>
  )
}
