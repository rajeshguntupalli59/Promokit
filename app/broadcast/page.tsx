import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BroadcastClient from '@/components/BroadcastClient'

export default async function BroadcastPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  const { data: contacts } = await supabase
    .from('broadcast_contacts')
    .select('id, name, phone, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return <BroadcastClient userId={profile?.id ?? user.id} contacts={contacts ?? []} />
}
