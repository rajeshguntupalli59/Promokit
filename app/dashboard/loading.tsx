export default function DashboardLoading() {
  return (
    <div className="min-h-screen" style={{ background: '#050508' }}>
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 animate-pulse">
        <div className="flex gap-6 mb-8">
          <div className="w-48 h-8 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
