import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('broadcast_contacts')
    .select('id, name, phone, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return Response.json({ contacts: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { ownerId, name, phone } = await req.json()

  if (!ownerId || !phone) return Response.json({ error: 'Missing fields' }, { status: 400 })
  const clean = phone.replace(/\D/g, '')
  if (clean.length < 10) return Response.json({ error: 'Invalid phone number' }, { status: 400 })

  // Verify ownerId is a real user to prevent spam to arbitrary UUIDs
  const { data: ownerExists } = await supabase.from('profiles').select('id').eq('id', ownerId).single()
  if (!ownerExists) return Response.json({ error: 'Invalid collection link' }, { status: 400 })

  const { error } = await supabase
    .from('broadcast_contacts')
    .upsert({ owner_id: ownerId, name: name?.trim() || null, phone: clean }, { onConflict: 'owner_id,phone' })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
