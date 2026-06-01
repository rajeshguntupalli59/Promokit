import { prisma } from '@/lib/db'
import { publishToplatform } from '@/lib/social-publishers'

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posts = await prisma.scheduledPost.findMany({
    where: { status: 'pending', scheduledAt: { lte: new Date() } },
    take: 50,
  })

  if (posts.length === 0) return Response.json({ processed: 0 })

  const results = await Promise.allSettled(
    posts.map(async post => {
      const result = await publishToplatform(post.platform, post.content, post.mediaUrl ?? undefined)
      if (result.success) {
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: { status: 'published', publishedAt: new Date(), platformPostId: result.postId ?? null },
        })
      } else {
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: { status: 'error', errorMessage: result.error ?? 'Unknown error' },
        })
      }
      return { id: post.id, success: result.success }
    })
  )

  const published = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length
  const failed = results.length - published
  console.log(`[cron/publish-posts] processed=${results.length} published=${published} failed=${failed}`)
  return Response.json({ processed: results.length, published, failed })
}
