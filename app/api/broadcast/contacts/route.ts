import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const contacts = await prisma.broadcastContact.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, phone: true, createdAt: true },
  })

  return Response.json({ contacts: contacts.map(c => ({ ...c, created_at: c.createdAt.toISOString() })) })
}

export async function POST(req: NextRequest) {
  const { ownerId, name, phone } = await req.json()
  if (!ownerId || !phone) return Response.json({ error: 'Missing fields' }, { status: 400 })
  const clean = phone.replace(/\D/g, '')
  if (clean.length < 10) return Response.json({ error: 'Invalid phone number' }, { status: 400 })

  const ownerExists = await prisma.user.findUnique({ where: { id: ownerId }, select: { id: true } })
  if (!ownerExists) return Response.json({ error: 'Invalid collection link' }, { status: 400 })

  await prisma.broadcastContact.upsert({
    where: { ownerId_phone: { ownerId, phone: clean } },
    create: { ownerId, name: name?.trim() || null, phone: clean },
    update: { name: name?.trim() || null },
  })

  return Response.json({ ok: true })
}
