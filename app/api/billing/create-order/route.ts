import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

const PLANS = {
  starter: { amount: 29900, name: 'PromoKit Starter' },
  growth:  { amount: 69900, name: 'PromoKit Growth' },
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  const planDetails = PLANS[plan as keyof typeof PLANS]
  if (!planDetails) return Response.json({ error: 'Invalid plan' }, { status: 400 })

  // @ts-ignore — Razorpay constructor types are correct at runtime
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const order = await razorpay.orders.create({
    amount: planDetails.amount,
    currency: 'INR',
    receipt: `order_${user.id}_${Date.now()}`,
    notes: { user_id: user.id, plan },
  })

  return Response.json({ orderId: order.id, amount: planDetails.amount, name: planDetails.name })
}
