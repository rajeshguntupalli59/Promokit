import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const [user, businesses, generations] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.business.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.generation.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])

  if (!user) redirect('/auth/login')

  const profile = {
    id: user.id,
    email: user.email ?? '',
    plan: user.plan,
    generations_this_month: user.generationsThisMonth,
    billing_period_start: user.billingPeriodStart.toISOString(),
    referral_code: user.referralCode ?? undefined,
    referral_credits: user.referralCredits,
    created_at: user.createdAt.toISOString(),
  }

  const userForClient = { id: user.id, email: user.email ?? '', user_metadata: { full_name: user.name ?? undefined } }

  const bizForClient = businesses.map(b => ({
    id: b.id, name: b.name, type: b.type ?? '', description: b.description ?? '',
    location: b.location ?? '', language: b.language, tone: b.tone, created_at: b.createdAt.toISOString(),
  }))

  const genForClient = generations.map(g => ({
    id: g.id, business_name: g.businessName ?? '', content: g.content as Record<string, unknown>,
    created_at: g.createdAt.toISOString(),
  }))

  return <DashboardClient user={userForClient} profile={profile} businesses={bizForClient} generations={genForClient} />
}
