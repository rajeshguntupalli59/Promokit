import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const posts = await prisma.scheduledPost.findMany({
    where: { userId: session.user.id },
    orderBy: { scheduledAt: 'asc' },
  })

  const data = posts.map(p => ({
    id: p.id, platform: p.platform, content: p.content, media_url: p.mediaUrl,
    scheduled_at: p.scheduledAt.toISOString(), status: p.status,
    published_at: p.publishedAt?.toISOString() ?? null,
    error_message: p.errorMessage, platform_post_id: p.platformPostId,
    created_at: p.createdAt.toISOString(),
  }))

  return Response.json({ posts: data })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { platform, content, media_url, scheduled_at } = await req.json()
  if (!platform || !content || !scheduled_at) {
    return Response.json({ error: 'platform, content, and scheduled_at are required' }, { status: 400 })
  }

  const post = await prisma.scheduledPost.create({
    data: {
      userId: session.user.id, platform, content,
      mediaUrl: media_url ?? null, scheduledAt: new Date(scheduled_at),
    },
  })

  return Response.json({ post: { ...post, scheduled_at: post.scheduledAt.toISOString() } }, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  await prisma.scheduledPost.deleteMany({ where: { id, userId: session.user.id } })
  return Response.json({ ok: true })
}
