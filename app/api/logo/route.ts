import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.plan !== 'growth') {
    return Response.json({ error: 'Logo upload requires Growth plan' }, { status: 403 })
  }

  const form = await (req as Request & { formData(): Promise<FormData> }).formData()
  const file = form.get('file') as File | null
  if (!file) return Response.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const allowed = ['png', 'jpg', 'jpeg', 'webp', 'svg']
  if (!allowed.includes(ext)) return Response.json({ error: 'Invalid file type' }, { status: 400 })
  if (file.size > 2 * 1024 * 1024) return Response.json({ error: 'File too large (max 2 MB)' }, { status: 400 })

  // Convert to base64 data URL — stored directly in the businesses table
  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const mimeType = file.type || `image/${ext}`
  const dataUrl = `data:${mimeType};base64,${base64}`

  return Response.json({ url: dataUrl })
}
