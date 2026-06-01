import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import HistoryClient from '@/components/HistoryClient'

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const generations = await prisma.generation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const data = generations.map(g => ({
    id: g.id,
    business_name: g.businessName ?? '',
    content: g.content as Record<string, unknown>,
    created_at: g.createdAt.toISOString(),
  }))

  return <HistoryClient generations={data} />
}
