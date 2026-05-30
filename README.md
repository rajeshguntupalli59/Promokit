# PromoKit — AI Promotion Tool for Indian Small Businesses

> Generate WhatsApp messages, Instagram posts & flyers in 7 Indian languages in 2 minutes.

## What it does

Small business owners fill a simple form → AI generates ready-to-share promotional content in their language — no design skills, no marketing degree needed.

**Outputs generated:**
- 3 WhatsApp message variants
- 3 Instagram captions with hashtags
- 2 Facebook posts
- Google Business description
- Downloadable flyer

**Languages:** Hindi · Telugu · Tamil · Marathi · Kannada · Bengali · English

## Tech Stack

- **Frontend:** Next.js 14 + Tailwind CSS
- **AI:** Claude Haiku API (Anthropic) with prompt caching
- **Hosting:** Vercel (recommended)

## Getting Started

```bash
# Install dependencies
pnpm install

# Add your Anthropic API key
cp .env.example .env.local
# Edit .env.local and add: ANTHROPIC_API_KEY=your_key_here

# Run locally
pnpm dev
# Opens at http://localhost:3002
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel
# Add ANTHROPIC_API_KEY in Vercel dashboard → Settings → Environment Variables
```

## Pricing

| Plan | Price | Features |
|---|---|---|
| Free | ₹0 | 3 generations/month, 2 languages |
| Starter | ₹299/month | Unlimited, all 7 languages, flyers, QR page |
| Growth | ₹699/month | Everything + 5 profiles, broadcasts, analytics |

## Get an Anthropic API Key

Sign up at [console.anthropic.com](https://console.anthropic.com) — free tier available.
Each generation costs ~₹0.03–0.05 with Claude Haiku + prompt caching.

---

Made with ❤️ for India 🇮🇳
