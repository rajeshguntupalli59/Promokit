import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import BroadcastClient from '@/components/BroadcastClient'

export default async function BroadcastPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const contacts = await prisma.broadcastContact.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  const data = contacts.map(c => ({
    id: c.id, name: c.name, phone: c.phone, created_at: c.createdAt.toISOString(),
  }))

  return <BroadcastClient userId={session.user.id} contacts={data} />
}
