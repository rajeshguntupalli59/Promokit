# PromoKit — IQ / Handover Document

**Date:** 31 May 2026
**Repo:** `github.com/rajeshguntupalli59/Promokit` · branch `main`
**Live URL:** `promokit.in`
**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Supabase · Claude API · Vercel

---

## 1. What The Product Does

AI-powered promotional content generator for Indian small businesses. A business owner fills in their name, business type, and current offer — and in 30 seconds gets:

- WhatsApp messages (3 versions)
- Instagram captions (3 versions)
- Facebook posts (2 versions)
- Google Business description
- PDF poster flyer (9 templates)
- Video / Reel (8 animated styles)
- Business Card (4 styles)

All output is in the owner's chosen Indian language (7 supported).

---

## 2. Plans & Pricing

| Plan | Monthly | Annual | Generations |
|---|---|---|---|
| Free | ₹0 | ₹0 | 3 / month |
| Starter | ₹499/mo | ₹349/mo | Unlimited |
| Growth | ₹999/mo | ₹699/mo | Unlimited |

Plan is stored in `profiles.plan` (Supabase) and cached in `localStorage` key `promokit_plan` for instant UI gating without an extra DB call.

---

## 3. Environment Variables

All must be set in Vercel → Project → Settings → Environment Variables.

| Variable | Used By |
|---|---|
| `ANTHROPIC_API_KEY` | All Claude AI features |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase browser client |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron job — bypasses RLS to publish scheduled posts |
| `RAZORPAY_KEY_ID` | Billing / upgrade flow |
| `RAZORPAY_KEY_SECRET` | Billing webhook verification |
| `CRON_SECRET` | Vercel cron endpoint auth (set this — if missing, endpoint is public) |
| `FACEBOOK_PAGE_ID` | Facebook auto-publish |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Facebook + Instagram publish (same token) |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Instagram auto-publish |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn auto-publish |
| `LINKEDIN_AUTHOR_URN` | LinkedIn author identity e.g. `urn:li:person:XXXX` |
| `TWITTER_API_KEY` | Twitter/X OAuth 1.0a |
| `TWITTER_API_SECRET` | Twitter/X OAuth 1.0a |
| `TWITTER_ACCESS_TOKEN` | Twitter/X OAuth 1.0a |
| `TWITTER_ACCESS_TOKEN_SECRET` | Twitter/X OAuth 1.0a |

---

## 4. Pages & Routes

| Route | Description | Min Plan |
|---|---|---|
| `/` | Landing page — features, pricing, testimonials | Public |
| `/create` | Main content generator | Free |
| `/dashboard` | Business overview + Festival Planner | Free |
| `/schedule` | Smart Calendar — monthly view + reminders | Starter |
| `/market` | Marketing Agent — campaign generator + scheduled queue | Starter |
| `/auth/login` | Supabase email login | Public |
| `/auth/signup` | Sign up | Public |
| `/collect/[id]` | Public contact collection landing page | Growth |

---

## 5. API Routes

| Route | Method | Description |
|---|---|---|
| `/api/generate` | POST | Main content generation — Claude Sonnet |
| `/api/poster` | GET | Server-side PNG poster via Satori / ImageResponse |
| `/api/optimize-caption` | POST | Caption A/B optimizer — Claude Haiku |
| `/api/marketing-agent` | POST | Full campaign generator — Claude Sonnet |
| `/api/marketing-agent/schedule` | GET / POST / DELETE | Save, list, cancel scheduled posts |
| `/api/cron/publish-posts` | GET | Vercel Cron — publishes due posts every 15 min |
| `/api/chat` | POST | Streaming AI chat assistant — Claude Haiku |
| `/api/billing` | POST | Razorpay webhook handler |
| `/api/businesses` | GET / POST | CRUD for saved business profiles |
| `/api/broadcast` | POST | WhatsApp broadcast list management |
| `/api/logo` | POST | Business logo upload to Supabase Storage |
| `/api/qr` | GET | QR code generation |

---

## 6. Key Components

| File | What It Does |
|---|---|
| `components/ResultsDashboard.tsx` | Tab switcher rendering all generated content (WhatsApp, Instagram, Facebook, Google, Flyer, Video, Card, Optimize) |
| `components/VideoCreator.tsx` | Canvas animation engine — 8 styles, WebM video export via MediaRecorder |
| `components/BusinessCardGenerator.tsx` | Canvas-based card generator, 4 styles, PNG download |
| `components/CaptionOptimizer.tsx` | AI A/B caption testing — 5 tones, 3 variants per run |
| `components/HashtagPack.tsx` | Industry hashtag picker — 9 business types, copy-all |
| `components/FestivalPlanner.tsx` | 60-day rolling festival calendar with promo idea links |
| `components/Pricing.tsx` | Pricing section with plan cards and full comparison table |
| `components/Nav.tsx` | Fixed nav with auth-aware CTAs and mobile menu |
| `components/ChatWidget.tsx` | Floating 💬 AI chat bubble — visible on all pages |
| `lib/social-publishers.ts` | Publish to Facebook / Instagram / LinkedIn / Twitter/X |
| `app/market/page.tsx` | Marketing Agent UI — campaign generator + schedule modal + queue view |
| `app/schedule/page.tsx` | Smart Calendar — localStorage-based reminders, monthly grid |

---

## 7. Supabase Database Tables

Run `supabase/schema.sql` in the Supabase SQL editor to create all tables.

| Table | Purpose |
|---|---|
| `profiles` | User plan, billing info, referral code, generation count |
| `businesses` | Saved business profiles per user |
| `generations` | Full content generation history |
| `reminders` | Smart Calendar reminders |
| `broadcast_contacts` | WhatsApp broadcast contact list |
| `scheduled_posts` | Auto-publish queue — status: `pending` → `published` / `error` |

All tables have **Row Level Security (RLS)** enabled. Users can only read/write their own rows.
The cron job uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS when publishing posts for all users.

---

## 8. Auto-Publish Scheduling — How It Works

```
User clicks 📅 Schedule on any generated post
        ↓
POST /api/marketing-agent/schedule
    saves row to scheduled_posts (status: pending)
        ↓
Vercel Cron fires every 15 minutes
GET /api/cron/publish-posts
        ↓
Fetches rows where status = 'pending' AND scheduled_at <= now()
        ↓
Calls publishToplatform(platform, content) from lib/social-publishers.ts
        ↓
Updates row → status: 'published' (with platform_post_id)
              or status: 'error'  (with error_message)
        ↓
User sees result in 📅 Queue tab on /market
```

**Supported platforms:** Facebook · Instagram · LinkedIn · Twitter/X

---

## 9. AI Models Used

| Feature | Model | Reason |
|---|---|---|
| Content generation | `claude-sonnet-4-6` | Complex multi-format output |
| Marketing Agent campaigns | `claude-sonnet-4-6` | Long structured JSON, strategy reasoning |
| Caption Optimizer | `claude-haiku-4-5-20251001` | Simple 3-variant task — cost efficiency |
| Chat Widget | `claude-haiku-4-5-20251001` | High-volume conversational, low latency |

All system prompts use `cache_control: { type: 'ephemeral' }` (prompt caching). This targets >60% cache hit rate and cuts API costs by ~70–90% on repeated calls.

---

## 10. Feature Gating

| Feature | Free | Starter | Growth |
|---|---|---|---|
| AI generations | 3/month | Unlimited | Unlimited |
| Languages | 4 | All 7 | All 7 |
| Poster templates | 3 basic | All 9 | All 9 |
| PDF flyer export | ✗ | ✓ | ✓ |
| QR code on poster | ✗ | ✓ | ✓ |
| Caption Optimizer (AI A/B) | ✗ | ✓ | ✓ |
| Business Card Generator | ✗ | ✓ | ✓ |
| Video / Reel Creator | ✗ | 4 styles | All 8 styles |
| Premium reel styles | ✗ | ✗ | ✓ |
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

## 11. Known Constraints & Gotchas

| Issue | Detail |
|---|---|
| Instagram text-only posts | Instagram Graph API requires a public image URL. Posts without `media_url` return a graceful error — no crash. |
| Twitter OAuth | Implemented from scratch using Web Crypto (`crypto.subtle` HMAC-SHA1). No external OAuth library needed. |
| Vercel Cron minimum | Free tier minimum is 15 minutes. Do not set `*/5` — it will be silently rejected. Currently set to `*/15`. |
| Canvas video export | Uses `MediaRecorder` with `video/webm;codecs=vp9`. Not supported in Safari — falls back gracefully. |
| CRON_SECRET missing | If not set, the cron endpoint logs a warning but is callable by anyone. Always set in production. |
| Supabase not configured | All Supabase calls are null-guarded. The app works without Supabase — auth and saving features are disabled gracefully. |
| TypeScript target | `tsconfig.json` target is `es5`. Avoid spreading `Uint8Array` — use `Array.from()` instead. |

---

## 12. Folder Structure

```
/app
  /api                  → All API route handlers
    /chat               → Streaming AI chat
    /cron               → Vercel cron jobs
    /marketing-agent    → Campaign generator + schedule endpoints
    /generate           → Main content generation
    /poster             → Server-side PNG generation
    ...
  /market               → Marketing Agent page
  /schedule             → Smart Calendar page
  /dashboard            → User dashboard
  /auth                 → Login / signup
  page.tsx              → Landing page

/components             → All React components
/lib
  /supabase             → client.ts · server.ts · middleware.ts
  social-publishers.ts  → Facebook / Instagram / LinkedIn / Twitter adapters
  copywriting-frameworks.ts → AI prompt frameworks

/supabase
  schema.sql            → Full DB schema — run this in Supabase SQL editor

vercel.json             → Cron job config (every 15 min)
```

---

## 13. Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] `supabase/schema.sql` run in Supabase SQL editor
- [ ] Supabase Storage bucket `logos` created (public)
- [ ] Razorpay webhook pointed to `https://promokit.in/api/billing`
- [ ] `CRON_SECRET` set and matches Vercel cron auth header
- [ ] Social platform API keys obtained and tested (see Section 3)
- [ ] Custom domain `promokit.in` configured in Vercel

---

*Last updated: 31 May 2026*
