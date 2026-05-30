// Proven copywriting frameworks embedded into every generation

export const FRAMEWORKS = {
  whatsapp: `
WHATSAPP MESSAGE RULES (apply to all 3 messages):
- Message 1: Use 4U Formula → Open with Urgency hook → State what's Unique about the offer → Give the Utility/value → End with Ultra-specific CTA (exact price, exact action)
- Message 2: Use PAS Formula → Problem (one line) → Agitate (make it feel real) → Solution (your business) → CTA
- Message 3: Use Emotional Connect Formula → Festival/cultural hook OR family value → Warm personal tone → Offer → WhatsApp CTA
FORMAT RULES:
✅ Max 4 lines per message — people read on mobile
✅ 2-3 emojis per message (use 👉 🎉 ✅ 🔥 💚 🛒 📞 strategically)
✅ Always end with phone number or "Reply YES" or "Message us now"
✅ Use local area name for trust ("families in [location]")
✅ Price anchor when relevant: "Worth ₹X, yours for ₹Y"
❌ No long paragraphs, no formal language, no corporate tone`,

  instagram: `
INSTAGRAM CAPTION RULES (apply to all 3 captions):
- Caption 1: Hook+Story+CTA → First line = curiosity gap or bold claim (this is the "above fold" preview) → 2-3 lines of story or value → Question CTA to drive comments
- Caption 2: AIDA → Attention (surprising fact or offer) → Interest (why it matters to them) → Desire (outcome/transformation) → Action (link in bio / DM us)
- Caption 3: BAB (Before-After-Bridge) → Before state (their struggle) → After state (their win) → Bridge = your product
FORMAT RULES:
✅ First line must hook in under 8 words — Instagram shows only this before "more"
✅ Use line breaks for readability (short punchy lines)
✅ 5-8 hashtags: mix of location (#HyderabadFood), niche (#KiranaStore), and broad (#IndianBusiness)
✅ End with a question or clear action
✅ Emojis as visual bullets 🔥✨💯 not decoration`,

  facebook: `
FACEBOOK POST RULES:
- Post 1: Use PPPP Formula → Picture (vivid situation) → Promise (transformation) → Prove (social proof / numbers) → Push (limited time CTA)
- Post 2: Community story format → "To everyone in [location] who..." → Relatable problem → Your solution → Invite to comment or share
FORMAT RULES:
✅ Facebook allows longer posts — use 3-5 sentences
✅ Start with a line that stops the scroll ("Most [business type] owners don't know this...")
✅ Tag the local area for organic reach
✅ End with share prompt: "Tag a friend who needs this 👇"`,

  flyer: `
FLYER COPY RULES (for flyerTagline and flyerHighlight):
- flyerTagline: Use Headline Formula → Benefit + Number + Timeframe OR Problem + Solution in 6-8 words
  Examples: "Fresh Groceries. Delivered in 30 Minutes." / "₹500 Off Your First Order. Today Only."
- flyerHighlight: Use FAB → Feature (what it is) → Advantage (why better) → Benefit (what customer gets)
FORMAT RULES:
✅ Tagline must be readable in 2 seconds
✅ Use power words: Free, Now, Only, New, Exclusive, Guaranteed, Save, Limited
✅ Include the number/price for specificity
✅ Make the benefit personal: "You get..." not "We offer..."`,

  google: `
GOOGLE BUSINESS DESCRIPTION RULES:
Use FAB structure across 3 paragraphs:
- Para 1: Who you are + primary keyword naturally + location
- Para 2: What makes you unique (Advantage) + social proof hint
- Para 3: Customer benefit + CTA (visit us / call us / find us at)
FORMAT RULES:
✅ 150-200 words exactly
✅ Include business type + location 2-3 times naturally for SEO
✅ No emojis (Google Business = professional)
✅ Include operating context (years in business, specialty, etc.)
✅ End with clear next action for the customer`,
}

export const TONE_STYLES = {
  'Friendly & Warm': 'Write like a helpful neighbor — casual, caring, trustworthy. Use "aap" / "you" directly. Feel like a personal recommendation.',
  'Professional': 'Confident and credible. Clear value statements. No slang. Business-appropriate but still human.',
  'Festive & Energetic': 'High energy, celebration-focused. More emojis. Exclamation points. Create FOMO. Festival references feel natural.',
}

export const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  'Hindi': 'Write in Devanagari script (हिन्दी). Use everyday conversational Hindi — not overly formal. Mix Hindi + English naturally (Hinglish) where it sounds natural. E.g. "आज का offer", "free delivery".',
  'Telugu': 'Write in Telugu script (తెలుగు). Conversational Andhra/Telangana tone. Can naturally mix English product names.',
  'Tamil': 'Write in Tamil script (தமிழ்). Warm conversational Chennai/TN tone. Mix Tamil + English naturally.',
  'Marathi': 'Write in Marathi script (मराठी). Authentic Maharashtra tone — warm and community-focused.',
  'Kannada': 'Write in Kannada script (ಕನ್ನಡ). Friendly Bengaluru/Karnataka tone.',
  'Bengali': 'Write in Bengali script (বাংলা). Warm conversational West Bengal tone.',
  'English': 'Write in clear simple Indian English. Avoid British or American idioms. Keep it warm and local-feeling.',
}

export function buildSystemPrompt(): string {
  return `You are PromoKit AI — the most skilled marketing copywriter for Indian small businesses.

You know every proven copywriting framework: PAS, AIDA, 4U, FAB, BAB, PPPP, Hook+Story+CTA, and more.
You apply the RIGHT framework to EACH content type automatically.
You write in the local language and script with natural warmth — never robotic.
You make every word earn its place — tight, vivid, actionable copy only.

OUTPUT RULES:
- Return ONLY valid JSON — no markdown, no explanation, no preamble
- Every message must feel handcrafted, not templated
- Include real specifics from the business data (name, location, product, price if given)
- Local area name builds trust — always use it`
}
