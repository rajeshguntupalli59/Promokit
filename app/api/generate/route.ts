import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { FRAMEWORKS, TONE_STYLES, LANGUAGE_INSTRUCTIONS, buildSystemPrompt } from '@/lib/copywriting-frameworks'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 999999,
  growth: 999999,
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      profile = data

      if (profile) {
        const now = new Date()
        const periodStart = profile.billing_period_start ? new Date(profile.billing_period_start) : new Date(0)
        if (now.getMonth() !== periodStart.getMonth() || now.getFullYear() !== periodStart.getFullYear()) {
          await supabase.from('profiles').update({
            generations_this_month: 0,
            billing_period_start: now.toISOString(),
          }).eq('id', user.id)
          profile.generations_this_month = 0
        }

        const limit = PLAN_LIMITS[profile.plan] ?? 3
        if (profile.generations_this_month >= limit) {
          return Response.json({ error: 'limit_reached', plan: profile.plan }, { status: 402 })
        }
      }
    }

    const data = await req.json()
    const {
      businessName, businessType, description, location, whatsapp, language, tone, festivals,
      offerEnabled, offerOccasion, offerBadge, offerValidTill, offerItems,
    } = data

    if (!businessName || !businessType || !description) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const toneGuide = TONE_STYLES[tone as keyof typeof TONE_STYLES] ?? TONE_STYLES['Friendly & Warm']
    const langGuide = LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS['English']

    const systemPrompt = buildSystemPrompt()

    // Build offer context string
    let offerContext = ''
    if (offerEnabled) {
      const lines: string[] = ['CURRENT PROMOTION:']
      if (offerOccasion) lines.push(`Occasion: ${offerOccasion}`)
      if (offerBadge) lines.push(`Offer badge: ${offerBadge}`)
      if (offerValidTill) lines.push(`Valid till: ${offerValidTill}`)
      if (Array.isArray(offerItems)) {
        const priced = offerItems.filter((it: { name: string; price: string; original: string }) => it.name)
        if (priced.length) {
          lines.push('Price list:')
          priced.forEach((it: { name: string; price: string; original: string }) => {
            const orig = it.original ? ` (was ₹${it.original})` : ''
            lines.push(`  • ${it.name}${it.price ? ` — ₹${it.price}${orig}` : ''}`)
          })
        }
      }
      lines.push('→ Reference this offer prominently in WhatsApp, Instagram, and Facebook content. Mention specific prices where provided. Create urgency around the valid-till date if given.')
      offerContext = '\n\n' + lines.join('\n')
    }

    const userPrompt = `BUSINESS BRIEF:
Name: ${businessName}
Type: ${businessType}
What they sell: ${description}
Location: ${location || 'India'}
WhatsApp/Contact: ${whatsapp || 'Contact us'}
Language: ${language}
Tone: ${tone}
Festival greetings: ${festivals ? 'Yes — weave in current Indian festival context naturally' : 'No'}${offerContext}

TONE GUIDE: ${toneGuide}

LANGUAGE GUIDE: ${langGuide}

COPYWRITING FRAMEWORKS TO APPLY:
${FRAMEWORKS.whatsapp}

${FRAMEWORKS.instagram}

${FRAMEWORKS.facebook}

${FRAMEWORKS.flyer}

${FRAMEWORKS.google}

OUTPUT: Return ONLY valid JSON — no markdown fences, no explanation:
{
  "whatsapp": ["msg1 using 4U formula", "msg2 using PAS formula", "msg3 using Emotional Connect formula"],
  "instagram": ["caption1 Hook+Story+CTA with 5-8 hashtags", "caption2 AIDA with hashtags", "caption3 BAB with hashtags"],
  "facebook": ["post1 PPPP formula", "post2 community story format"],
  "google": "150-200 word FAB description — professional, no emojis",
  "flyerTagline": "6-8 word benefit headline",
  "flyerHighlight": "one FAB sentence with Feature + Advantage + Benefit"
}`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          // @ts-expect-error cache_control is valid per Anthropic SDK but not yet typed
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
    const generated = JSON.parse(jsonMatch[0])
    const required = ['whatsapp', 'instagram', 'facebook', 'google', 'flyerTagline', 'flyerHighlight']
    for (const key of required) {
      if (!(key in generated)) return Response.json({ error: 'Incomplete AI response, please try again' }, { status: 500 })
    }

    // Persist if authenticated
    if (user && profile) {
      const { data: biz } = await supabase.from('businesses').insert({
        user_id: user.id,
        name: businessName,
        type: businessType,
        description,
        location: location || '',
        whatsapp: whatsapp || '',
        language,
        tone,
        festivals: festivals ?? false,
      }).select().single()

      await Promise.all([
        supabase.from('generations').insert({
          user_id: user.id,
          business_id: biz?.id ?? null,
          business_name: businessName,
          content: generated,
        }),
        supabase.from('profiles').update({
          generations_this_month: (profile.generations_this_month || 0) + 1,
        }).eq('id', user.id),
      ])
    }

    return Response.json({ success: true, data: generated, business: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[PromoKit API Error]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
