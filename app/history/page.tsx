import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HistoryClient from '@/components/HistoryClient'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: generations } = await supabase
    .from('generations')
    .select('id, business_name, content, created_at, businesses(type, location, whatsapp, language, logo_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return <HistoryClient generations={generations ?? []} />
}
