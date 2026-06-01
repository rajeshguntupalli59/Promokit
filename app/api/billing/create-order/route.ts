import Razorpay from 'razorpay'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const PLANS = {
  starter: { amount: 49900, name: 'PromoKit Starter' },
  growth:  { amount: 99900, name: 'PromoKit Growth' },
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  const planDetails = PLANS[plan as keyof typeof PLANS]
  if (!planDetails) return Response.json({ error: 'Invalid plan' }, { status: 400 })

  // @ts-ignore
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const order = await razorpay.orders.create({
    amount: planDetails.amount,
    currency: 'INR',
    receipt: `order_${session.user.id}_${Date.now()}`,
    notes: { user_id: session.user.id, plan },
  })

  return Response.json({ orderId: order.id, amount: planDetails.amount, name: planDetails.name })
}
