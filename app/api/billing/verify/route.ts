import crypto from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json()

  const VALID_PLANS = ['starter', 'growth']
  if (!VALID_PLANS.includes(plan)) return Response.json({ error: 'Invalid plan' }, { status: 400 })

  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '')
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { plan } })
  return Response.json({ success: true, plan })
}
