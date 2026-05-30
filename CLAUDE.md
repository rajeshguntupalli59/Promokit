# PromoKit — Claude Session Memory

> AI-powered promotional content generator for Indian small businesses.
> Read this file at the start of every session before touching any code.

---

## Project Identity

**Repo:** github.com/rajeshguntupalli59/Promokit  
**Branch:** main  
**Local path:** /home/user/promokit  
**Running on:** port 3002 (`pnpm dev -- -p 3002`)  
**Owner email:** rajeshguntupalli59@gmail.com  

### Push procedure (token in credentials file)
```bash
TOKEN=$(cat /home/user/.git-credentials-promokit | grep -o 'ghp_[^@]*')
git remote set-url origin "https://${TOKEN}@github.com/rajeshguntupalli59/Promokit.git"
git push -u origin main
git remote set-url origin "https://github.com/rajeshguntupalli59/Promokit.git"
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router (TypeScript strict) |
| Auth + DB | Supabase (`@supabase/ssr`) |
| AI | Claude Haiku `claude-haiku-4-5-20251001` with `cache_control: ephemeral` |
| Poster gen | `next/og` ImageResponse (Satori, 1080×1350 px, `runtime = 'nodejs'`) |
| Payments | Razorpay (create-order + HMAC verify) |
| Styling | Tailwind CSS + inline styles (dark theme, #050508 bg) |
| Package mgr | pnpm |
| Port | 3002 |

---

## Key Rules

- **TypeScript strict**: `npx tsc --noEmit` must pass 0 errors before every commit
- **No comments** unless WHY is non-obvious (one line max)
- **No docstrings** on internal functions
- **Edit over Write** — always read file before editing
- **Parallel tool calls** for independent reads/writes
- **Claude Haiku** for all AI generation (cost guard) — never use Opus in loops
- **Prompt caching** (`cache_control: ephemeral`) on system prompts always

---

## Folder Structure

```
/app
  /api
    /generate/route.ts       ← main AI generation endpoint (POST)
    /poster/route.tsx        ← Satori 1080×1350 PNG (GET)
    /qr/route.ts             ← QR code PNG generation (GET ?url=)
    /businesses/route.ts     ← user's saved businesses (GET, auth required)
    /logo/route.ts           ← Supabase Storage logo upload (POST)
    /broadcast/contacts/route.ts ← broadcast contacts (GET/POST)
    /billing/create-order/   ← Razorpay order creation
    /billing/verify/         ← Razorpay HMAC verify + plan update
  /auth/login /signup /callback /forgot-password
  /create/page.tsx           ← BusinessForm wrapper
  /results/page.tsx          ← ResultsDashboard wrapper
  /history/page.tsx          ← generation history
  /broadcast/page.tsx        ← broadcast dashboard
  /broadcast/collect/[uid]/  ← public contact collection form
  /dashboard/page.tsx        ← main dashboard (server)
/components
  BusinessForm.tsx           ← 3-step form (business info, prefs, review)
  ResultsDashboard.tsx       ← tabs: WhatsApp, Instagram, Facebook, Google, Flyer
  Nav.tsx
  /dashboard
    DashboardClient.tsx      ← tabs: overview, businesses, generations, history, broadcast, settings
    RazorpayButton.tsx
/lib
  copywriting-frameworks.ts  ← FRAMEWORKS, TONE_STYLES, LANGUAGE_INSTRUCTIONS, buildSystemPrompt()
  /supabase/client.ts server.ts middleware.ts
/supabase/schema.sql         ← run in Supabase SQL editor to set up DB
```

---

## Database Schema

```sql
-- Core tables
profiles (id, email, plan, generations_this_month, billing_period_start,
          razorpay_subscription_id, referral_code, referral_credits, referred_by, created_at)

businesses (id, user_id, name, type, description, location, whatsapp,
            language, tone, festivals, logo_url, created_at)

generations (id, user_id, business_id, business_name, content jsonb, created_at)

-- Feature tables (added after initial launch)
reminders (id, user_id, title, scheduled_at, content, created_at)
broadcast_contacts (id, user_id, name, phone, created_at)
```

**Plans:** `free` (3/mo) · `starter` (₹299/mo, unlimited) · `growth` (₹699/mo, unlimited)

---

## Environment Variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

---

## API Contracts

### POST /api/generate
```typescript
// Request body
{
  businessName, businessType, description, location, whatsapp,
  language, tone, festivals,
  offerEnabled?, offerOccasion?, offerBadge?, offerValidTill?,
  offerItems?: { name, price, original }[],
  logoUrl?
}
// Response
{ success: true, data: { whatsapp[], instagram[], facebook[], google, flyerTagline, flyerHighlight }, business: {...} }
```

### GET /api/poster
```
?name=&type=&location=&whatsapp=&tagline=&highlight=&template=&language=
&offerBadge=&offerOccasion=&offerValidTill=&offerItems=(JSON)
&qr=1  (adds WhatsApp QR to poster)
&logoUrl= (business logo, fetched as base64)
```
Templates: saffron, diwali, rose, midnight, ocean, emerald, violet, sunrise, steel

### GET /api/qr
```
?url=<encoded URL>
Returns: PNG image
```

---

## Completed Features

- [x] AI content generation (WhatsApp × 3, Instagram × 3, Facebook × 2, Google, flyer)
- [x] 9 poster templates with SVG pattern overlays
- [x] Special offer / price list on poster (occasion, badge, price grid, valid-till)
- [x] Server-side 1080×1350 PNG poster via Satori (with Indian language fonts)
- [x] Auth (email/password + Google OAuth, forgot password)
- [x] Dashboard (overview, businesses, generations, settings)
- [x] Razorpay billing (starter + growth plans)
- [x] Copywriting frameworks (PAS, AIDA, 4U, FAB, BAB, PPPP, Hook+Story+CTA)
- [x] 7 Indian languages with correct Google Fonts
- [x] QR code on poster (WhatsApp deeplink)
- [x] Generation history page (/history)
- [x] PDF flyer export (jsPDF, client-side)
- [x] Animated poster preview (CSS toggle)
- [x] WhatsApp direct share button
- [x] Load saved business into form
- [x] Schedule reminder (localStorage-based)
- [x] Logo upload (Supabase Storage → Satori render)
- [x] Referral system (code + link)
- [x] Broadcast contact list (/broadcast + /broadcast/collect/[uid])

---

## Key Patterns

### Supabase auth check (server)
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

### Google Font loading in Satori
```typescript
const fontCache = new Map<string, ArrayBuffer>()
// Parse CSS → extract woff2 URL → fetch → cache in module scope
```

### localStorage result persistence
```typescript
// BusinessForm stores: localStorage.setItem('promokit_result', JSON.stringify(json))
// ResultsDashboard reads: JSON.parse(localStorage.getItem('promokit_result') ?? '{}')
```

### Prompt caching pattern
```typescript
system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }]
```
