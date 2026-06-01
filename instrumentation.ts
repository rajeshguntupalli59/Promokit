export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { schedule } = await import('node-cron')

  const secret = process.env.CRON_SECRET
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3002}`

  schedule('*/15 * * * *', async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (secret) headers['Authorization'] = `Bearer ${secret}`
      const res = await fetch(`${appUrl}/api/cron/publish-posts`, { headers })
      const json = await res.json()
      console.log('[cron] publish-posts:', json)
    } catch (err) {
      console.error('[cron] publish-posts failed:', err)
    }
  })

  console.log('[cron] Scheduled publish-posts every 15 minutes')
}
