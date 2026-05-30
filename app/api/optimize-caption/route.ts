import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TONE_PROMPTS: Record<string, string> = {
  Urgent: 'Create urgency and FOMO. Use scarcity language, time pressure, and strong CTAs. Make readers feel they must act NOW.',
  Emotional: 'Focus on emotional connection, personal story, and trust. Appeal to feelings, community, and shared values.',
  Funny: 'Be witty, relatable, and shareable. Use wordplay, humor, and a light tone while still promoting the business.',
  Professional: 'Authoritative, confident, expertise-driven. Build credibility and trust through professional language.',
  Story: 'Use a narrative arc — set the scene, build tension, resolve with the business as the hero. Before/after structure.',
}

export async function POST(req: Request) {
  try {
    const { caption, platform, tone, language, businessName, businessType } = await req.json()
    if (!caption || !platform || !tone) {
      return Response.json({ error: 'Missing fields' }, { status: 400 })
    }

    const toneGuide = TONE_PROMPTS[tone] ?? TONE_PROMPTS.Urgent
    const langNote = language && language !== 'English' ? `Write in ${language} mixed with English where natural.` : 'Write in English.'

    const systemPrompt = `You are an expert social media copywriter for Indian small businesses. Your job is to rewrite captions to maximize engagement on ${platform}. ${langNote}`

    const userPrompt = `ORIGINAL CAPTION:
${caption}

BUSINESS: ${businessName} (${businessType})
PLATFORM: ${platform}
TONE TO APPLY: ${tone}
TONE GUIDE: ${toneGuide}

Rewrite this caption 3 times using the ${tone} tone. Each version should:
- Be clearly different from the others
- Match the ${platform} format and character style
- Apply the ${tone} tone strongly
${platform === 'instagram' ? '- Include 5-8 relevant hashtags at the end' : ''}
${platform === 'whatsapp' ? '- Be conversational, use emojis, end with a CTA like "Reply YES" or a question' : ''}
${platform === 'facebook' ? '- Be longer, story-driven, end with a question to drive comments' : ''}

Return ONLY valid JSON, no markdown:
{"variants": ["variant1 text here", "variant2 text here", "variant3 text here"]}`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      // @ts-expect-error cache_control valid per Anthropic SDK but not yet typed
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return Response.json({ error: 'AI response parse failed' }, { status: 500 })
    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed.variants)) return Response.json({ error: 'Invalid AI response' }, { status: 500 })

    return Response.json({ variants: parsed.variants.slice(0, 3) })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    console.error('[optimize-caption]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
