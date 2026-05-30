import { createServerClient } from '@supabase/ssr'
import { publishToplatform } from '@/lib/social-publishers'

// Vercel Cron Job — runs every 15 minutes
// Protected by CRON_SECRET header (set in Vercel environment variables)
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.warn('[cron/publish-posts] CRON_SECRET not set — endpoint is unprotected')
  } else {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Service-role client to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    console.error('[cron/publish-posts] FATAL: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return Response.json({ error: 'Service misconfigured' }, { status: 503 })
  }

  const supabase = createServerClient(supabaseUrl, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  })

  const now = new Date().toISOString()

  // Fetch all posts due for publishing
  const { data: posts, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', now)
    .limit(50)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!posts || posts.length === 0) return Response.json({ processed: 0 })

  const results = await Promise.allSettled(
    posts.map(async (post: {
      id: string; platform: string; content: string; media_url?: string
    }) => {
      const result = await publishToplatform(post.platform, post.content, post.media_url)
      if (result.success) {
        await supabase.from('scheduled_posts').update({
          status: 'published',
          published_at: new Date().toISOString(),
          platform_post_id: result.postId ?? null,
        }).eq('id', post.id)
      } else {
        await supabase.from('scheduled_posts').update({
          status: 'error',
          error_message: result.error ?? 'Unknown error',
        }).eq('id', post.id)
      }
      return { id: post.id, success: result.success }
    })
  )

  const published = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length
  const failed = results.length - published

  console.log(`[cron/publish-posts] processed=${results.length} published=${published} failed=${failed}`)
  return Response.json({ processed: results.length, published, failed })
}
