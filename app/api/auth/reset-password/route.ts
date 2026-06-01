import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { token, email, password } = await req.json()
  if (!token || !email || !password) return Response.json({ error: 'Missing fields' }, { status: 400 })
  if (password.length < 8) return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  const record = await prisma.verificationToken.findFirst({
    where: { token, identifier: email },
  })

  if (!record) return Response.json({ error: 'Invalid or expired reset link' }, { status: 400 })
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } })
    return Response.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { email }, data: { password: hash } })
  await prisma.verificationToken.delete({ where: { token } })

  return Response.json({ ok: true })
}
