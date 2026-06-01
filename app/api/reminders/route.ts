import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.user.id },
    orderBy: { scheduledAt: 'asc' },
    select: { id: true, title: true, scheduledAt: true, content: true, createdAt: true },
  })

  return Response.json({
    reminders: reminders.map(r => ({
      id: r.id, title: r.title, content: r.content,
      scheduled_at: r.scheduledAt.toISOString(),
      created_at: r.createdAt.toISOString(),
    })),
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, scheduled_at, content } = await req.json()
  if (!title || !scheduled_at) return Response.json({ error: 'Missing fields' }, { status: 400 })

  const reminder = await prisma.reminder.create({
    data: { userId: session.user.id, title, scheduledAt: new Date(scheduled_at), content: content ?? '' },
  })

  return Response.json({ reminder: { id: reminder.id, title: reminder.title, scheduled_at: reminder.scheduledAt.toISOString() } })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  await prisma.reminder.deleteMany({ where: { id, userId: session.user.id } })
  return Response.json({ ok: true })
}
