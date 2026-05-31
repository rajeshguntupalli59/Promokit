export default function HistoryLoading() {
  return (
    <div className="min-h-screen pt-20 px-4 animate-pulse" style={{ background: '#050508' }}>
      <div className="max-w-3xl mx-auto">
        <div className="h-8 w-48 rounded-xl mb-8" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-12 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
