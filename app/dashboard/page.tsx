import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: businesses }, { data: generations }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('businesses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('generations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  return (
    <DashboardClient
      user={user}
      profile={profile}
      businesses={businesses || []}
      generations={generations || []}
    />
  )
}
