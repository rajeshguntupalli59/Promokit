import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are PromoKit's friendly marketing assistant — an expert in Indian small business marketing.

ABOUT PROMOKIT:
- AI tool that generates WhatsApp messages, Instagram captions, Facebook posts, Google Business descriptions, and PDF poster flyers in 30 seconds
- Supports 7 Indian languages: Hindi, Telugu, Tamil, English, Marathi, Kannada, Bengali
- Plans: Free (3 generations/month, forever) → Starter ₹499/mo → Growth ₹999/mo
- Key features: QR code on poster, PDF flyer export, WhatsApp direct share, business logo, referral rewards, festival-aware content, video/reel creator, business card generator, hashtag packs, caption optimizer, smart calendar
- Target: kirana stores, restaurants, clothing shops, salons, medical clinics, coaching centres
- Sign up at promokit.in

YOUR PERSONALITY:
- Warm, helpful, and practical — like a knowledgeable friend
- Use Indian context naturally (mention chai shops, festivals, local idioms when relevant)
- Give specific, actionable marketing advice
- Keep replies concise — 3-5 sentences max unless user asks for detail
- If asked about pricing/features, give accurate info and encourage them to try the free plan
- If they describe their business, give 2-3 tailored marketing tips

NEVER:
- Mention competitor tools
- Promise features that don't exist
- Give lengthy corporate responses`

export async function POST(req: Request) {
  const { messages } = await req.json()
  if (!messages?.length) return new Response('No messages', { status: 400 })

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    // @ts-expect-error cache_control valid per Anthropic SDK but not yet typed
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  })
}
