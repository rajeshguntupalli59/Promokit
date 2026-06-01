# PromoKit — IQ / Handover Document

**Last updated:** 1 June 2026
**Repo:** `github.com/rajeshguntupalli59/Promokit`
**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Supabase · Claude API · Railway

---

## 1. What The Product Does

AI-powered promotional content generator for Indian small businesses. A business owner fills in their name, business type, and current offer — and in 30 seconds receives:

| Output | Count |
|--------|-------|
| WhatsApp messages | 3 versions |
| Instagram captions | 3 versions |
| Facebook posts | 2 versions |
| Google Business description | 1 |
| PDF flyer poster | 9 templates |
| Video / Reel (animated) | 8 styles |
| Business Card | 4 styles |

All output is in the owner's chosen Indian language (7 supported: English, Hindi, Telugu, Tamil, Marathi, Kannada, Bengali).

---

## 2. Plans & Pricing

| Plan | Monthly | Generations/month |
|------|---------|-------------------|
| Free | ₹0 | 3 |
| Starter | ₹499 | Unlimited |
| Growth | ₹999 | Unlimited |

Plan is stored in `profiles.plan` (Supabase). The UI reads `profiles.plan` on every dashboard load — no localStorage caching of the plan.

---

## 3. Railway Deployment — Step by Step

### Prerequisites
- Railway account at [railway.app](https://railway.app)
- Supabase project set up (see Section 5)
- Razorpay account (live keys for production)
- Anthropic API key

### Deploy Steps

**Step 1 — Create Railway project**
1. Railway dashboard → New Project → Deploy from GitHub repo
2. Select `rajeshguntupalli59/Promokit`
3. Railway auto-detects Next.js + pnpm via Nixpacks — no Dockerfile needed

**Step 2 — Set environment variables**
Go to Railway → Your Service → Variables → Add all variables from Section 4.
At minimum for the app to boot: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Step 3 — Set custom domain**
Railway → Your Service → Settings → Networking → Add Custom Domain → `promokit.in`
Point your domain's DNS: CNAME → `<your-service>.railway.app`

**Step 4 — Set up the cron job (auto-publish scheduler)**
Railway does not have a built-in cron like Vercel. Create a second service in the same Railway project:
1. New Service → Empty Service → name it `cron`
2. Set Start Command: `while true; do curl -s -X GET https://promokit.in/api/cron/publish-posts -H "Authorization: Bearer $CRON_SECRET" && sleep 900; done`
3. Set the same `CRON_SECRET` variable in this service
4. This runs the publish job every 15 minutes (900 seconds)

Alternatively, use [cron-job.org](https://cron-job.org) (free) to call `GET https://promokit.in/api/cron/publish-posts` with header `Authorization: Bearer YOUR_CRON_SECRET` every 15 minutes.

**Step 5 — Supabase config**
In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://promokit.in`
- Redirect URLs: add `https://promokit.in/auth/callback`

In Supabase Dashboard → Authentication → Providers:
- Enable Google OAuth (add Railway domain to authorized redirect URIs in Google Cloud Console)

**Step 6 — Razorpay webhook**
Razorpay Dashboard → Webhooks → Add:
- URL: `https://promokit.in/api/billing`
- Events: `payment.captured`

**Deployment checklist:**
- [ ] All env vars set in Railway (see Section 4)
- [ ] `supabase/schema.sql` run in Supabase SQL editor
- [ ] Supabase Storage bucket `logos` created, set to **public**
- [ ] Supabase Auth redirect URL set to `https://promokit.in/auth/callback`
- [ ] Razorpay webhook pointing to `https://promokit.in/api/billing`
- [ ] `CRON_SECRET` set and same value in both Railway services
- [ ] Custom domain CNAME configured
- [ ] Social platform API keys obtained and tested (optional — features degrade gracefully if missing)

---

## 4. Environment Variables

Set all of these in Railway → Service → Variables.

### Required (app will not boot without these)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL — `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

### Required for billing

| Variable | Description |
|----------|-------------|
| `RAZORPAY_KEY_ID` | From Razorpay dashboard (live key for production) |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` (exposed to browser) |

### Required for scheduled publishing (auto-publish feature)

| Variable | Description |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — bypasses RLS for cron job |
| `CRON_SECRET` | Any random secret string — protects the `/api/cron/publish-posts` endpoint |

### Optional — social platform publishing

| Variable | Platform |
|----------|----------|
| `FACEBOOK_PAGE_ID` | Facebook auto-publish |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Facebook + Instagram (same token) |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Instagram auto-publish |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn auto-publish |
| `LINKEDIN_AUTHOR_URN` | LinkedIn — e.g. `urn:li:person:XXXX` |
| `TWITTER_API_KEY` | Twitter/X OAuth 1.0a |
| `TWITTER_API_SECRET` | Twitter/X OAuth 1.0a |
| `TWITTER_ACCESS_TOKEN` | Twitter/X OAuth 1.0a |
| `TWITTER_ACCESS_TOKEN_SECRET` | Twitter/X OAuth 1.0a |

> If social keys are missing, the publish button shows an error for that platform only. The rest of the app works normally.

---

## 5. Supabase Setup

Run `supabase/schema.sql` in the Supabase SQL editor (Dashboard → SQL Editor → New Query → paste → Run).

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User plan, billing, referral code, generation count |
| `businesses` | Saved business profiles per user |
| `generations` | Full content generation history (JSONB) |
| `reminders` | Smart Calendar reminders |
| `broadcast_contacts` | WhatsApp broadcast contact list |
| `scheduled_posts` | Auto-publish queue — `pending` → `published` / `error` |

All tables have **Row Level Security (RLS)** enabled. Users can only read/write their own rows.
The cron job uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS when publishing posts for all users.

### Storage

Create a storage bucket named `logos` and set it to **public**:
- Supabase Dashboard → Storage → New Bucket → name: `logos` → Public: ON

Logo images uploaded here are served via `https://xxxx.supabase.co/storage/v1/object/public/logos/...` and embedded in poster PNGs server-side.

---

## 6. Pages & Routes

| Route | Description | Min Plan |
|-------|-------------|----------|
| `/` | Landing page | Public |
| `/create` | Main content generator (3-step form) | Free |
| `/results` | Generated content viewer | Free |
| `/history` | Past generation history | Free |
| `/dashboard` | Business overview + Festival Planner | Free |
| `/market` | Marketing Agent — campaigns + publish queue | Starter |
| `/schedule` | Smart Calendar — monthly reminders | Starter |
| `/broadcast` | WhatsApp broadcast list manager | Growth |
| `/broadcast/collect/[uid]` | Public contact collection form | Growth |
| `/auth/login` | Supabase email login | Public |
| `/auth/signup` | Signup | Public |
| `/auth/forgot-password` | Password reset | Public |
| `/auth/callback` | Supabase OAuth callback | Public |

---

## 7. API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/generate` | POST | Main content generation — Claude Sonnet |
| `/api/poster` | GET | Server-side 1080×1350 PNG via Satori |
| `/api/qr` | GET | QR code PNG — `?url=` |
| `/api/optimize-caption` | POST | Caption A/B optimizer — Claude Haiku |
| `/api/marketing-agent` | POST | Full campaign generator — Claude Sonnet |
| `/api/marketing-agent/schedule` | GET/POST/DELETE | Scheduled post CRUD |
| `/api/cron/publish-posts` | GET | Cron endpoint — publishes due posts |
| `/api/chat` | POST | AI chat widget — Claude Haiku |
| `/api/billing` | POST | Razorpay webhook + plan upgrade |
| `/api/billing/create-order` | POST | Create Razorpay order |
| `/api/businesses` | GET/POST | Saved business profiles |
| `/api/broadcast/contacts` | GET/POST | Broadcast contact list |
| `/api/logo` | POST | Logo upload to Supabase Storage |

---

## 8. Key Components

| File | What It Does |
|------|-------------|
| `components/BusinessForm.tsx` | 3-step form — business info → prefs → review |
| `components/ResultsDashboard.tsx` | Tab viewer for all generated content |
| `components/VideoCreator.tsx` | Canvas animation engine, 8 styles, WebM export |
| `components/BusinessCardGenerator.tsx` | Canvas card generator, 4 styles, PNG download |
| `components/CaptionOptimizer.tsx` | AI A/B test — 5 tones, 3 variants |
| `components/HashtagPack.tsx` | Industry hashtag picker, 9 business types |
| `components/FestivalPlanner.tsx` | 60-day rolling Indian festival calendar |
| `components/ChatWidget.tsx` | Floating AI chat bubble — all pages |
| `components/Nav.tsx` | Fixed nav, auth-aware, mobile hamburger |
| `components/dashboard/DashboardClient.tsx` | Dashboard tabs: overview, businesses, history, broadcast, settings |
| `components/dashboard/RazorpayButton.tsx` | Razorpay checkout button |
| `lib/copywriting-frameworks.ts` | 7 frameworks (PAS, AIDA, 4U, FAB, BAB, PPPP, Hook+Story+CTA) |
| `lib/social-publishers.ts` | Publish adapters for FB / IG / LinkedIn / Twitter |
| `app/api/poster/route.tsx` | Satori image generation with local TTF fonts |

---

## 9. How Auto-Publish Works

```
User clicks "Schedule" on any generated post
        ↓
POST /api/marketing-agent/schedule
    → saves row to scheduled_posts (status: 'pending')
        ↓
Cron fires every 15 min (Railway cron service or cron-job.org)
GET /api/cron/publish-posts
        ↓
Fetches rows where status='pending' AND scheduled_at <= now()
        ↓
Calls lib/social-publishers.ts → publishToplatform(platform, content)
        ↓
Updates row: status='published' (with platform_post_id)
          or status='error'    (with error_message)
        ↓
User sees result in the Queue tab on /market
```

**Supported platforms:** Facebook · Instagram · LinkedIn · Twitter/X

---

## 10. AI Models

| Feature | Model | Reason |
|---------|-------|--------|
| Content generation | `claude-sonnet-4-6` | Complex multi-format JSON output |
| Marketing Agent campaigns | `claude-sonnet-4-6` | Long strategy reasoning |
| Caption Optimizer | `claude-haiku-4-5-20251001` | Simple 3-variant task — cost efficiency |
| Chat Widget | `claude-haiku-4-5-20251001` | High-volume conversational |

All system prompts use `cache_control: { type: 'ephemeral' }`. This achieves >60% cache hit rate and cuts API costs by ~70% on repeated calls from the same user.

---

## 11. Feature Gating

| Feature | Free | Starter | Growth |
|---------|------|---------|--------|
| AI generations | 3/month | Unlimited | Unlimited |
| Languages | 4 | All 7 | All 7 |
| Poster templates | 3 | All 9 | All 9 |
| PDF flyer export | ✗ | ✓ | ✓ |
| QR code on poster | ✗ | ✓ | ✓ |
| Caption Optimizer | ✗ | ✓ | ✓ |
| Business Card Generator | ✗ | ✓ | ✓ |
| Video / Reel Creator | ✗ | 4 styles | All 8 styles |
| Festival Planner | ✗ | ✓ | ✓ |
| Smart Calendar | ✗ | ✓ | ✓ |
| Marketing Agent | ✗ | ✓ | ✓ |
| Auto-publish scheduling | ✗ | ✓ | ✓ |
| Hashtag Pack | ✓ | ✓ | ✓ |
| AI Chat Assistant | ✓ | ✓ | ✓ |
| Business logo on poster | ✗ | ✗ | ✓ |
| WhatsApp broadcast list | ✗ | ✗ | ✓ |
| Customer collection page | ✗ | ✗ | ✓ |
| Referral rewards | ✗ | ✗ | ✓ |
| Saved businesses | ✗ | Up to 3 | Unlimited |

---

## 12. Poster Generation — Technical Detail

`/api/poster` uses `@vercel/og` (Satori) to render a 1080×1350 PNG server-side at `runtime = 'nodejs'`.

**Fonts:** Local TTF files in `/public/fonts/` — no network call at render time:
```
Poppins-Black.ttf          ← English headlines
Poppins-Bold.ttf           ← English body
NotoSansDevanagari-Bold.ttf ← Hindi / Marathi
NotoSansTelugu-Bold.ttf    ← Telugu
NotoSansTamil-Bold.ttf     ← Tamil
NotoSansKannada-Bold.ttf   ← Kannada
NotoSansBengali-Bold.ttf   ← Bengali
```

**Templates:** saffron · diwali · rose · midnight · ocean · emerald · violet · sunrise · steel

**QR code:** If `?qr=1` is passed, the WhatsApp deeplink QR is rendered bottom-right using the `/api/qr` route internally.

**Logo:** If `?logoUrl=` is passed, the image is fetched server-side and embedded as base64 — no CORS issues.

---

## 13. Known Constraints & Gotchas

| Issue | Detail |
|-------|--------|
| **Instagram text-only posts** | Instagram Graph API requires a public image URL. Posts without `media_url` return a graceful error — no crash |
| **Twitter OAuth** | Implemented using `crypto.subtle` HMAC-SHA1 (Web Crypto). No external OAuth library needed |
| **Canvas video export** | Uses `MediaRecorder` with `video/webm;codecs=vp9`. Not supported in Safari — UI shows an error message |
| **Cron on Railway** | Railway has no built-in cron. Use a second Railway service running a `curl` loop, or cron-job.org (free) |
| **CRON_SECRET missing** | Endpoint logs a warning and remains callable by anyone. Always set in production |
| **Supabase not configured** | All Supabase calls are null-guarded. App works without Supabase — auth and save features disabled gracefully |
| **TypeScript target** | `tsconfig.json` target is `ES2017`. Avoid spreading `Uint8Array` — use `Array.from()` instead |
| **Port** | Railway injects `PORT` env var. `package.json` start command reads it: `next start -p ${PORT:-3002}` |

---

## 14. Monthly Cost Estimate (100 active users)

| Service | Cost |
|---------|------|
| Railway Hobby plan | ~$5/mo |
| Supabase Free tier | $0 (up to 500MB DB, 1GB storage) |
| Anthropic Claude API | ~$8–15/mo (Haiku for chat, Sonnet for generation, with prompt caching) |
| Razorpay | 2% per transaction (no monthly fee) |
| **Total** | **~$13–20/mo** |

At 50 paying users × ₹499 = ₹24,950/mo (~$300) revenue against ~$20 cost = **93% margin**.

---

## 15. Folder Structure

```
/app
  /api
    /chat                    ← AI chat widget (Haiku streaming)
    /cron/publish-posts      ← Scheduled post publisher (called by cron every 15 min)
    /marketing-agent         ← Campaign generator + schedule CRUD
    /generate                ← Main content generation (Sonnet)
    /poster                  ← Satori 1080×1350 PNG
    /optimize-caption        ← A/B caption optimizer (Haiku)
    /billing                 ← Razorpay webhook handler
    /billing/create-order    ← Razorpay order creation
    /businesses              ← Saved business CRUD
    /broadcast/contacts      ← Broadcast list CRUD
    /logo                    ← Logo upload to Supabase Storage
    /qr                      ← QR code PNG
  /auth                      ← login / signup / forgot-password / callback
  /broadcast                 ← Broadcast dashboard + public collect form
  /create                    ← BusinessForm page
  /results                   ← ResultsDashboard page
  /history                   ← Generation history
  /dashboard                 ← Main dashboard (server component)
  /market                    ← Marketing Agent page
  /schedule                  ← Smart Calendar page
  page.tsx                   ← Landing page

/components                  ← All React components
/lib
  /supabase                  ← client.ts · server.ts · middleware.ts
  social-publishers.ts       ← FB / IG / LinkedIn / Twitter adapters
  copywriting-frameworks.ts  ← AI prompt frameworks

/public/fonts                ← Local TTF files for Satori poster
/supabase
  schema.sql                 ← Full DB schema — run in Supabase SQL editor

railway.json                 ← Railway deployment config (Nixpacks, healthcheck)
vercel.json                  ← Legacy cron config (not used on Railway)
```

---

## 16. Key Code Patterns

### Supabase auth check (server route)
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

### Prompt caching (all AI calls)
```typescript
system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }]
```

### Plan limit gate (server)
```typescript
const limit = PLAN_LIMITS[profile.plan ?? 'free'] ?? 3
if ((profile.generations_this_month ?? 0) >= limit) {
  return Response.json({ error: 'limit_reached' }, { status: 402 })
}
```

### Local font loading in Satori
```typescript
const LOCAL_FONTS: Record<string, string> = {
  English: 'Poppins-Black.ttf',
  Hindi: 'NotoSansDevanagari-Bold.ttf',
  // ...
}
const buf = fs.readFileSync(path.join(process.cwd(), 'public/fonts', LOCAL_FONTS[lang]))
```

---

*Owner: rajeshguntupalli59@gmail.com*
