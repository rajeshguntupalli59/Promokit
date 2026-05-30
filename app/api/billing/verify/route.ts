import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json()

  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await supabase.from('profiles').update({ plan }).eq('id', user.id)
  return Response.json({ success: true, plan })
}
