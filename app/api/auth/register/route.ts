import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { name, email, password, referredBy } = await req.json()
  if (!email || !password) return Response.json({ error: 'Missing fields' }, { status: 400 })
  if (password.length < 8) return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return Response.json({ error: 'Email already registered' }, { status: 409 })

  const hash = await bcrypt.hash(password, 12)
  const referralCode = Math.random().toString(36).slice(2, 10).toUpperCase()

  await prisma.user.create({
    data: {
      name: name?.trim() || null,
      email,
      password: hash,
      referralCode,
      referredBy: referredBy || null,
    },
  })

  return Response.json({ ok: true })
}
