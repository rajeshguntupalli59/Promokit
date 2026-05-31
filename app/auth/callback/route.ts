import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`)
    }

    // Award referral credits to the referrer when a new user signs up via ref code
    const { data: { user } } = await supabase.auth.getUser()
    const referredBy = user?.user_metadata?.referred_by as string | undefined
    if (referredBy && user) {
      // Find the referrer by their referral_code and award 3 bonus generations
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id, referral_credits')
        .eq('referral_code', referredBy)
        .single()

      if (referrer) {
        await supabase
          .from('profiles')
          .update({ referral_credits: (referrer.referral_credits ?? 0) + 3 })
          .eq('id', referrer.id)
      }
    }
  }
  return NextResponse.redirect(`${origin}/dashboard`)
}
