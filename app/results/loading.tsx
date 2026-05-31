export default function ResultsLoading() {
  return (
    <div className="min-h-screen pt-20" style={{ background: '#050508' }}>
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="flex gap-2 mb-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-9 rounded-xl flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl p-5 h-32" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
