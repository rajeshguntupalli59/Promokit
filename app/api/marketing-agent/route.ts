import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMOKIT_CONTEXT = `
PRODUCT: PromoKit (promokit.in)
WHAT IT DOES: AI-powered promotional content generator for Indian small businesses. In 30 seconds, business owners get WhatsApp messages, Instagram captions, Facebook posts, Google Business descriptions, and printed poster flyers — all AI-written.
LANGUAGES: Hindi, Telugu, Tamil, English, Marathi, Kannada, Bengali (7 Indian languages)
PLANS: Free (3 generations/month, forever) → Starter ₹299/mo → Growth ₹699/mo
KEY FEATURES: QR code on poster, PDF flyer export, animated poster preview, WhatsApp direct share, business logo on poster, broadcast contact list, referral rewards, festival-aware content
TARGET CUSTOMERS: Indian small business owners — kirana stores, restaurants, clothing shops, salons, medical clinics, coaching centres
PAIN SOLVED: They need consistent social media presence but can't afford agencies, don't know what to write, or waste hours trying
USP: Less than a cup of chai per day (₹10/day) for unlimited AI-generated marketing content in their own language
SIGN-UP LINK: promokit.in
`

const SYSTEM_PROMPT = `You are a world-class growth marketer specialising in Indian small business markets. You are promoting PromoKit — an AI marketing tool.

${PROMOKIT_CONTEXT}

Your content must:
- Feel authentic and locally relatable (use Indian idioms, festival references, familiar business scenarios)
- Be immediately copy-pasteable — no placeholders like [YOUR NAME]
- Include specific features, prices, and clear CTAs pointing to promokit.in
- Match the platform format (WhatsApp: short + emoji, Instagram: visual + hashtags, Email: subject + body)
- Always return ONLY valid JSON. Never wrap in markdown code blocks.`

const CAMPAIGN_TEMPLATES: Record<string, string> = {
  social: `Generate a complete social media campaign to acquire new users for PromoKit.

Audience: {audience}
Tone: {tone}
Occasion/Hook: {hook}

Create:
1. whatsapp_messages: 3 messages for WhatsApp broadcast (150-200 chars each, conversational, emoji-rich)
2. instagram_posts: 3 Instagram captions with hooks (max 300 chars each) + 8 hashtags each
3. facebook_posts: 2 Facebook posts (story-format, 200-300 chars each, end with a question)
4. linkedin_post: 1 LinkedIn post targeting business owners (professional, 200 chars)
5. posting_schedule: When to post each (day + time recommendation)

Return ONLY this JSON:
{
  "whatsapp_messages": [{"text":"","hook":"why this works"}],
  "instagram_posts": [{"caption":"","hashtags":"","hook":""}],
  "facebook_posts": [{"text":"","hook":""}],
  "linkedin_post": {"text":"","hook":""},
  "posting_schedule": [{"platform":"","day":"","time":"","reason":""}]
}`,

  ads: `Generate a paid advertising campaign for PromoKit to acquire new users.

Audience: {audience}
Tone: {tone}
Budget focus: {hook}

Create:
1. google_search_ads: 3 ads (each has headline_1, headline_2, headline_3 max 30 chars each, description max 90 chars)
2. meta_ads: 3 Facebook/Instagram ads (awareness, conversion, retargeting — each has primary_text, headline, description, cta_button)
3. audience_targeting: Specific targeting interests, demographics, and locations for Meta Ads
4. budget_recommendations: Weekly budget split across channels
5. ab_test_angles: 3 different angles to A/B test (price-focused, time-saving, language-focused)

Return ONLY this JSON:
{
  "google_search_ads": [{"headline_1":"","headline_2":"","headline_3":"","description":"","type":""}],
  "meta_ads": [{"type":"","primary_text":"","headline":"","description":"","cta_button":""}],
  "audience_targeting": {"interests":[],"demographics":"","locations":[],"lookalike":""},
  "budget_recommendations": [{"channel":"","weekly_budget":"","expected_result":""}],
  "ab_test_angles": [{"angle":"","message":"","hypothesis":""}]
}`,

  email: `Generate an email marketing and SEO content strategy for PromoKit.

Audience: {audience}
Tone: {tone}
Focus: {hook}

Create:
1. email_sequence: 5-email drip sequence for new sign-ups (welcome → feature education → social proof → upgrade offer → last chance). Each email has subject, preview_text, body (3-4 sentences), cta
2. blog_post_ideas: 3 SEO article ideas with title, target_keyword, search_intent, outline (4 bullet points each)
3. featured_blog_post: Full blog post for the highest-traffic idea — title, meta_description, intro (2 sentences), sections (3 sections each with heading + 3 sentences), conclusion + CTA

Return ONLY this JSON:
{
  "email_sequence": [{"day":1,"subject":"","preview_text":"","body":"","cta":""}],
  "blog_post_ideas": [{"title":"","target_keyword":"","search_intent":"","outline":[]}],
  "featured_blog_post": {"title":"","meta_description":"","intro":"","sections":[{"heading":"","content":""}],"conclusion":""}
}`,

  referral: `Generate a referral and influencer outreach campaign for PromoKit.

Audience: {audience}
Tone: {tone}
Incentive angle: {hook}

Create:
1. business_owner_whatsapp: 2 WhatsApp messages to send to small business owners asking them to try PromoKit (personal, friendly, no spam feel)
2. influencer_outreach_email: 1 email to micro-influencers (Instagram/YouTube with 5k-50k followers) to partner with PromoKit
3. referral_program_copy: Landing page copy explaining the referral rewards (earn free generations for every referral)
4. whatsapp_group_post: Message to post in WhatsApp business groups (e.g. "Kirana Owners Mumbai", "Restaurant Owners India")
5. testimonial_request: Message to send to happy users asking for a review/testimonial

Return ONLY this JSON:
{
  "business_owner_whatsapp": [{"text":"","context":"when to send this"}],
  "influencer_outreach_email": {"subject":"","body":"","ps":""},
  "referral_program_copy": {"headline":"","subheadline":"","how_it_works":["step1","step2","step3"],"reward_copy":"","cta":""},
  "whatsapp_group_post": {"text":"","tips":"best time to post"},
  "testimonial_request": {"text":"","follow_up":""}
}`
}

export async function POST(req: Request) {
  try {
    const { campaignType, audience, tone, hook } = await req.json()

    if (!campaignType || !CAMPAIGN_TEMPLATES[campaignType]) {
      return Response.json({ error: 'Invalid campaign type' }, { status: 400 })
    }

    const taskPrompt = CAMPAIGN_TEMPLATES[campaignType]
      .replace('{audience}', audience || 'Indian small business owners — kirana, restaurant, salon, clinic')
      .replace('{tone}', tone || 'Friendly and relatable')
      .replace('{hook}', hook || 'Save time on marketing with AI')

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      // @ts-expect-error cache_control valid per Anthropic SDK but not yet typed
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: taskPrompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return Response.json({ error: 'AI response parse error. Please try again.' }, { status: 500 })

    const result = JSON.parse(match[0])
    return Response.json({ success: true, data: result, campaignType })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    console.error('[marketing-agent]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
