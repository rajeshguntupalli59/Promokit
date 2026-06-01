import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const businesses = await prisma.business.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, name: true, type: true, description: true, location: true, whatsapp: true, language: true, tone: true, festivals: true, logoUrl: true },
  })

  const data = businesses.map(b => ({ ...b, logo_url: b.logoUrl }))
  return Response.json({ businesses: data })
}
