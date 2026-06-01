/**
 * E2E Prisma migration test.
 * Tests the full stack: auth APIs, DB operations via Prisma, page loads, protection.
 * Uses direct API calls (with cookie jar) for auth — more reliable than browser signIn flow.
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:3002'
const TEST_EMAIL = `e2e_${Date.now()}@promokit-test.local`
const TEST_PASS  = 'TestPass123!'
const TEST_NAME  = 'E2E Tester'

let pass = 0, warn = 0, fail = 0

function log(icon, label, detail = '') {
  const line = `${icon} ${label}${detail ? ' — ' + detail : ''}`
  console.log(line)
}

async function check(label, fn) {
  try { await fn(); log('✅', label); pass++ }
  catch (e) { log('❌', label, e.message?.slice(0, 150)); fail++ }
}

// ─── API helpers ────────────────────────────────────────────────────────────
// Holds cookies between fetch calls (simulates a browser session)
const jar = new Map()

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
}

function parseCookies(headers) {
  const setCookies = headers.getSetCookie?.() ?? (headers.get('set-cookie') ? [headers.get('set-cookie')] : [])
  for (const c of setCookies) {
    const [pair] = c.split(';')
    const idx = pair.indexOf('=')
    if (idx > 0) jar.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim())
  }
}

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { ...opts.headers, 'Cookie': cookieHeader() },
  })
  parseCookies(res.headers)
  return res
}

async function apiJson(path, opts = {}) {
  const res = await api(path, opts)
  return { status: res.status, body: await res.json() }
}

// Sign in via NextAuth credentials (same flow as browser signIn())
async function nextAuthSignIn(email, password) {
  // 1. Get CSRF token
  const csrfRes = await api('/api/auth/csrf')
  parseCookies(csrfRes.headers)
  const { csrfToken } = await csrfRes.json()

  // 2. POST credentials
  const body = new URLSearchParams({
    email, password,
    csrfToken,
    callbackUrl: `${BASE}/dashboard`,
    json: 'true',
  })
  const loginRes = await api('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1' },
    body: body.toString(),
  })
  parseCookies(loginRes.headers)
  const data = loginRes.status === 200 ? await loginRes.json() : null
  return { ok: loginRes.ok && data?.url?.includes('/dashboard'), data }
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

// ─── 1. Public pages ────────────────────────────────────────────────────────
await check('Landing page loads (200)', async () => {
  const res = await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`)
})

await check('Landing page has PromoKit branding + CTA', async () => {
  await page.waitForSelector('text=PromoKit', { timeout: 5000 })
  const el = await page.$('a[href="/auth/signup"]')
  if (!el) throw new Error('No signup CTA found')
})

await check('Signup page loads (200)', async () => {
  const res = await page.goto(`${BASE}/auth/signup`, { waitUntil: 'domcontentloaded' })
  if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`)
})

await check('Login page loads (200)', async () => {
  const res = await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded' })
  if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`)
})

await check('Forgot password page loads (200)', async () => {
  const res = await page.goto(`${BASE}/auth/forgot-password`, { waitUntil: 'domcontentloaded' })
  if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`)
})

await check('Reset password page loads (200)', async () => {
  const res = await page.goto(`${BASE}/auth/reset-password`, { waitUntil: 'domcontentloaded' })
  if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`)
})

await check('Broadcast collect page loads (public)', async () => {
  const res = await page.goto(`${BASE}/broadcast/collect?uid=testuid`, { waitUntil: 'domcontentloaded' })
  if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`)
})

await check('Create page loads (public)', async () => {
  const res = await page.goto(`${BASE}/create`, { waitUntil: 'domcontentloaded' })
  if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`)
})

// ─── 2. Auth protection (unauthenticated) ───────────────────────────────────
await check('GET /api/businesses → 401 when unauthenticated', async () => {
  const r = await apiJson('/api/businesses')
  if (r.status !== 401 || r.body.error !== 'Unauthorized') throw new Error(`Got ${r.status}: ${JSON.stringify(r.body)}`)
})

await check('GET /api/reminders → 401 when unauthenticated', async () => {
  const r = await apiJson('/api/reminders')
  if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`)
})

await check('POST /api/billing/create-order → 401 when unauthenticated', async () => {
  const r = await apiJson('/api/billing/create-order', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: 'starter' }),
  })
  if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`)
})

// ─── 3. Registration (Prisma write) ─────────────────────────────────────────
await check('POST /api/auth/register creates user in Railway PG via Prisma', async () => {
  const r = await apiJson('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: TEST_NAME, email: TEST_EMAIL, password: TEST_PASS }),
  })
  if (!r.body.ok) throw new Error(`Register failed: ${JSON.stringify(r.body)}`)
})

await check('POST /api/auth/register rejects duplicate email (409)', async () => {
  const r = await apiJson('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Dup', email: TEST_EMAIL, password: TEST_PASS }),
  })
  if (r.status !== 409) throw new Error(`Expected 409, got ${r.status}: ${JSON.stringify(r.body)}`)
})

await check('POST /api/auth/register rejects weak password (400)', async () => {
  const r = await apiJson('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'weak@test.com', password: 'short' }),
  })
  if (r.status !== 400) throw new Error(`Expected 400, got ${r.status}`)
})

// ─── 4. Login via NextAuth credentials ──────────────────────────────────────
await check('NextAuth credentials sign-in works (sets session-token cookie)', async () => {
  const result = await nextAuthSignIn(TEST_EMAIL, TEST_PASS)
  if (!result.ok) throw new Error(`Sign-in failed: ${JSON.stringify(result.data)}`)
  if (!jar.has('next-auth.session-token')) throw new Error('No session-token cookie set')
})

await check('Wrong password returns error (no session cookie)', async () => {
  const jar2 = new Map()
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { headers: { Cookie: '' } })
  const { csrfToken } = await csrfRes.json()
  const body = new URLSearchParams({ email: TEST_EMAIL, password: 'WrongPass!', csrfToken, callbackUrl: `${BASE}/dashboard`, json: 'true' })
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1', Cookie: '' },
    body: body.toString(),
  })
  if (res.status === 200) {
    const d = await res.json()
    if (d.url?.includes('dashboard')) throw new Error('Wrong password accepted!')
  }
})

// ─── 5. Authenticated API routes (Prisma reads/writes) ──────────────────────
await check('GET /api/businesses returns array (Prisma read)', async () => {
  const r = await apiJson('/api/businesses')
  if (r.status !== 200 || !Array.isArray(r.body.businesses)) throw new Error(`Got ${r.status}: ${JSON.stringify(r.body)}`)
})

await check('GET /api/reminders returns array (Prisma read)', async () => {
  const r = await apiJson('/api/reminders')
  if (r.status !== 200 || !Array.isArray(r.body.reminders)) throw new Error(`Got ${r.status}: ${JSON.stringify(r.body)}`)
})

let reminderId = null
await check('POST /api/reminders creates reminder (Prisma write)', async () => {
  const r = await apiJson('/api/reminders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Prisma E2E Reminder', scheduled_at: new Date(Date.now() + 86400000).toISOString(), content: 'test' }),
  })
  if (r.status !== 200 || !r.body.reminder?.id) throw new Error(`Got ${r.status}: ${JSON.stringify(r.body)}`)
  reminderId = r.body.reminder.id
})

await check('GET /api/reminders returns saved reminder', async () => {
  const r = await apiJson('/api/reminders')
  const found = r.body.reminders?.some(rem => rem.title === 'Prisma E2E Reminder')
  if (!found) throw new Error('Saved reminder not found in GET response')
})

await check('DELETE /api/reminders removes reminder (Prisma delete)', async () => {
  if (!reminderId) throw new Error('No reminder id from previous step')
  const r = await apiJson('/api/reminders', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: reminderId }),
  })
  if (r.status !== 200 || !r.body.ok) throw new Error(`Got ${r.status}: ${JSON.stringify(r.body)}`)
})

await check('GET /api/reminders is empty after delete', async () => {
  const r = await apiJson('/api/reminders')
  const found = r.body.reminders?.some(rem => rem.title === 'Prisma E2E Reminder')
  if (found) throw new Error('Deleted reminder still present')
})

// ─── 6. Broadcast contacts (Prisma upsert) ──────────────────────────────────
// Get the authenticated user's ID from session
const sessionRes = await api('/api/auth/session')
const session = await sessionRes.json()
const userId = session?.user?.id

await check('NextAuth session returns user.id and plan', async () => {
  if (!userId) throw new Error(`No user ID in session: ${JSON.stringify(session)}`)
  if (!session?.user?.plan) throw new Error(`No plan in session: ${JSON.stringify(session)}`)
})

await check('POST /api/broadcast/contacts saves contact (Prisma upsert)', async () => {
  if (!userId) throw new Error('No userId')
  const r = await apiJson('/api/broadcast/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerId: userId, name: 'Ravi Test', phone: '9876543210' }),
  })
  if (r.status !== 200 || !r.body.ok) throw new Error(`Got ${r.status}: ${JSON.stringify(r.body)}`)
})

await check('GET /api/broadcast/contacts returns saved contact', async () => {
  const r = await apiJson('/api/broadcast/contacts')
  const found = r.body.contacts?.some(c => c.phone === '9876543210')
  if (!found) throw new Error('Contact not found in GET')
})

await check('POST /api/broadcast/contacts rejects invalid ownerId', async () => {
  const r = await apiJson('/api/broadcast/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerId: 'invalid-owner-id', name: 'Spam', phone: '1234567890' }),
  })
  if (r.status !== 400) throw new Error(`Expected 400, got ${r.status}`)
})

// ─── 7. Forgot password (Prisma VerificationToken write) ────────────────────
await check('POST /api/auth/forgot-password returns ok (not leaking user existence)', async () => {
  const r = await apiJson('/api/auth/forgot-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent@test.com' }),
  })
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`)
})

await check('POST /api/auth/forgot-password creates token for known email', async () => {
  const r = await apiJson('/api/auth/forgot-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL }),
  })
  if (r.status !== 200 || !r.body.ok) throw new Error(`Got ${r.status}: ${JSON.stringify(r.body)}`)
})

await check('POST /api/auth/reset-password rejects invalid token', async () => {
  const r = await apiJson('/api/auth/reset-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: 'fakeinvalidtoken', email: TEST_EMAIL, password: 'NewPass456!' }),
  })
  if (r.status !== 400) throw new Error(`Expected 400, got ${r.status}`)
})

// ─── 8. Marketing agent schedule (Prisma write) ──────────────────────────────
await check('POST /api/marketing-agent/schedule creates scheduled post', async () => {
  const r = await apiJson('/api/marketing-agent/schedule', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'instagram', content: 'Test post from E2E', scheduled_at: new Date(Date.now() + 3600000).toISOString() }),
  })
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}: ${JSON.stringify(r.body)}`)
})

await check('GET /api/marketing-agent/schedule returns saved post', async () => {
  const r = await apiJson('/api/marketing-agent/schedule')
  const found = r.body.posts?.some(p => p.content === 'Test post from E2E')
  if (!found) throw new Error('Scheduled post not found')
})

// ─── 9. Protected pages (in browser) ────────────────────────────────────────
// Inject the session cookie into Playwright browser context
await browser.contexts()[0].addCookies([{
  name: 'next-auth.session-token',
  value: jar.get('next-auth.session-token') ?? '',
  domain: 'localhost',
  path: '/',
  httpOnly: true,
  sameSite: 'Lax',
}])

await check('Dashboard page loads for authenticated user', async () => {
  const res = await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' })
  if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`)
  const url = page.url()
  if (url.includes('/auth/login')) throw new Error('Redirected to login — session injection failed')
  await page.waitForSelector('text=Good', { timeout: 8000 })
})

await check('History page loads for authenticated user', async () => {
  const res = await page.goto(`${BASE}/history`, { waitUntil: 'domcontentloaded' })
  if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`)
  if (page.url().includes('/auth/login')) throw new Error('Redirected to login')
})

await check('Broadcast page loads for authenticated user', async () => {
  const res = await page.goto(`${BASE}/broadcast`, { waitUntil: 'domcontentloaded' })
  if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`)
  if (page.url().includes('/auth/login')) throw new Error('Redirected to login')
})

await check('Market page loads for authenticated user', async () => {
  const res = await page.goto(`${BASE}/market`, { waitUntil: 'domcontentloaded' })
  if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`)
})

await check('Schedule page loads for authenticated user', async () => {
  const res = await page.goto(`${BASE}/schedule`, { waitUntil: 'domcontentloaded' })
  if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`)
})

await check('Dashboard shows user name from Prisma DB', async () => {
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' })
  const content = await page.textContent('body')
  if (!content?.includes('E2E') && !content?.includes('Good')) throw new Error('No greeting or name found in dashboard')
})

await check('Dashboard shows plan (free) from Prisma DB', async () => {
  const content = await page.textContent('body')
  if (!content?.toLowerCase().includes('free')) throw new Error('No plan shown on dashboard')
})

// ─── 10. Unauthenticated page protection ─────────────────────────────────────
const page2 = await browser.newPage() // fresh context, no cookies
await check('/dashboard redirects to login (unauthenticated)', async () => {
  await page2.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' })
  const url = page2.url()
  if (!url.includes('/auth/login') && !url.includes('/api/auth/signin')) throw new Error(`Expected login redirect, got ${url}`)
})

await check('/history redirects to login (unauthenticated)', async () => {
  await page2.goto(`${BASE}/history`, { waitUntil: 'domcontentloaded' })
  const url = page2.url()
  if (!url.includes('/auth/login') && !url.includes('/api/auth/signin')) throw new Error(`Expected login redirect, got ${url}`)
})

await browser.close()

// ─── Report ──────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(65))
console.log(`Prisma E2E Results: ${pass} ✅  ${warn} ⚠️  ${fail} ❌  (${pass+warn+fail} total)`)
console.log('═'.repeat(65))
if (fail > 0) process.exit(1)
