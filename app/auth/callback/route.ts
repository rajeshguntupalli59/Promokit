import { NextResponse } from 'next/server'

// NextAuth handles OAuth callbacks at /api/auth/callback/[provider]
// This route redirects any legacy links to the dashboard
export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  return NextResponse.redirect(`${origin}/dashboard`)
}
