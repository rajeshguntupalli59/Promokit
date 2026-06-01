import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return Response.json({ error: 'Email required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })

  // Always return success to avoid email enumeration
  if (!user) return Response.json({ ok: true })

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

  await prisma.verificationToken.upsert({
    where: { token },
    create: { identifier: email, token, expires },
    update: { expires },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002'
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  // Send email if SMTP configured
  const smtpHost = process.env.SMTP_HOST
  if (smtpHost) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nodemailer = require('nodemailer') as typeof import('nodemailer')
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
      await transporter.sendMail({
        from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
        to: email,
        subject: 'PromoKit — Reset your password',
        html: `<p>Click the link below to reset your password. It expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      })
    } catch (err) {
      console.error('[forgot-password] Email send failed:', err)
    }
  } else {
    // Log reset URL in Railway logs when SMTP is not configured
    console.log('[forgot-password] Reset URL for', email, ':', resetUrl)
  }

  return Response.json({ ok: true })
}
