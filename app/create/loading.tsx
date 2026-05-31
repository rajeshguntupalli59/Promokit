export default function CreateLoading() {
  return (
    <div className="min-h-screen pt-20 px-4 animate-pulse" style={{ background: '#050508' }}>
      <div className="max-w-2xl mx-auto">
        <div className="h-10 w-64 rounded-xl mb-8 mx-auto" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-96 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  )
}
