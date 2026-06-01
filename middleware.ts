export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/history/:path*',
    '/broadcast/:path*',
    '/market/:path*',
    '/schedule/:path*',
  ],
}
