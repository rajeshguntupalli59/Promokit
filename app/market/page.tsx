'use client';

import { useState } from 'react';

type CampaignType = 'social' | 'ads' | 'email' | 'referral';

// ─── Copy button ───────────────────────────────────────────────
function CopyBtn({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
      style={copied
        ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}

// ─── Content card ──────────────────────────────────────────────
function ContentCard({ title, badge, badgeColor, text, meta }: {
  title: string; badge?: string; badgeColor?: string;
  text: string; meta?: string;
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-white/70">{title}</span>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: badgeColor ? `${badgeColor}22` : 'rgba(255,107,26,0.15)', color: badgeColor || '#FF6B1A', border: `1px solid ${badgeColor ? badgeColor + '44' : 'rgba(255,107,26,0.3)'}` }}>
              {badge}
            </span>
          )}
        </div>
        <CopyBtn text={text} />
      </div>
      <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">{text}</p>
      {meta && <p className="text-xs mt-2 italic" style={{ color: 'rgba(255,255,255,0.3)' }}>{meta}</p>}
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────
function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className="font-black text-white text-base">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ─── Result renderers per campaign type ───────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SocialResults({ data }: { data: any }) {
  return (
    <>
      <Section icon="💬" title="WhatsApp Messages">
        {data.whatsapp_messages?.map((m: { text: string; hook: string }, i: number) => (
          <ContentCard key={i} title={`Message ${i + 1}`} badge="WhatsApp" text={m.text} meta={`Why it works: ${m.hook}`} />
        ))}
      </Section>
      <Section icon="📸" title="Instagram Captions">
        {data.instagram_posts?.map((p: { caption: string; hashtags: string; hook: string }, i: number) => (
          <ContentCard key={i} title={`Post ${i + 1}`} badge="Instagram" badgeColor="#E1306C" text={`${p.caption}\n\n${p.hashtags}`} meta={p.hook} />
        ))}
      </Section>
      <Section icon="👥" title="Facebook Posts">
        {data.facebook_posts?.map((p: { text: string; hook: string }, i: number) => (
          <ContentCard key={i} title={`Post ${i + 1}`} badge="Facebook" badgeColor="#1877F2" text={p.text} meta={p.hook} />
        ))}
      </Section>
      {data.linkedin_post && (
        <Section icon="💼" title="LinkedIn Post">
          <ContentCard title="LinkedIn" badge="LinkedIn" badgeColor="#0A66C2" text={data.linkedin_post.text} meta={data.linkedin_post.hook} />
        </Section>
      )}
      {data.posting_schedule?.length > 0 && (
        <Section icon="📅" title="Posting Schedule">
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            {data.posting_schedule.map((s: { platform: string; day: string; time: string; reason: string }, i: number) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: i < data.posting_schedule.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                <span className="font-bold text-xs min-w-[80px]" style={{ color: '#FF6B1A' }}>{s.platform}</span>
                <span className="text-xs text-white/60">{s.day} · {s.time}</span>
                <span className="text-xs text-white/35 flex-1">{s.reason}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AdsResults({ data }: { data: any }) {
  return (
    <>
      <Section icon="🔍" title="Google Search Ads">
        {data.google_search_ads?.map((ad: { type: string; headline_1: string; headline_2: string; headline_3: string; description: string }, i: number) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(66,133,244,0.15)', color: '#4285F4', border: '1px solid rgba(66,133,244,0.3)' }}>{ad.type || `Ad ${i + 1}`}</span>
              <CopyBtn text={`${ad.headline_1} | ${ad.headline_2} | ${ad.headline_3}\n${ad.description}`} />
            </div>
            <div className="space-y-1.5">
              <div className="text-xs"><span className="text-white/35">H1: </span><span className="font-semibold text-white/80">{ad.headline_1}</span></div>
              <div className="text-xs"><span className="text-white/35">H2: </span><span className="font-semibold text-white/80">{ad.headline_2}</span></div>
              <div className="text-xs"><span className="text-white/35">H3: </span><span className="font-semibold text-white/80">{ad.headline_3}</span></div>
              <div className="text-xs mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}><span className="text-white/35">Desc: </span><span className="text-white/65">{ad.description}</span></div>
            </div>
          </div>
        ))}
      </Section>
      <Section icon="📱" title="Meta Ads (Facebook & Instagram)">
        {data.meta_ads?.map((ad: { type: string; primary_text: string; headline: string; description: string; cta_button: string }, i: number) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(24,119,242,0.15)', color: '#1877F2', border: '1px solid rgba(24,119,242,0.3)' }}>{ad.type}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>{ad.cta_button}</span>
                <CopyBtn text={`${ad.primary_text}\n\n${ad.headline}\n${ad.description}`} />
              </div>
            </div>
            <p className="text-sm text-white/75 mb-2 leading-relaxed">{ad.primary_text}</p>
            <div className="text-xs font-bold text-white/60">{ad.headline}</div>
            <div className="text-xs text-white/40 mt-0.5">{ad.description}</div>
          </div>
        ))}
      </Section>
      {data.audience_targeting && (
        <Section icon="🎯" title="Audience Targeting">
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="space-y-2.5 text-xs">
              <div><span className="text-white/35">Demographics: </span><span className="text-white/70">{data.audience_targeting.demographics}</span></div>
              <div><span className="text-white/35">Locations: </span><span className="text-white/70">{data.audience_targeting.locations?.join(', ')}</span></div>
              <div><span className="text-white/35">Interests: </span><span className="text-white/70">{data.audience_targeting.interests?.join(', ')}</span></div>
              <div><span className="text-white/35">Lookalike: </span><span className="text-white/70">{data.audience_targeting.lookalike}</span></div>
            </div>
          </div>
        </Section>
      )}
      {data.ab_test_angles?.length > 0 && (
        <Section icon="⚗️" title="A/B Test Angles">
          {data.ab_test_angles.map((ab: { angle: string; message: string; hypothesis: string }, i: number) => (
            <div key={i} className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="font-bold text-xs text-white/80 mb-1">{i + 1}. {ab.angle}</div>
              <div className="text-xs text-white/60 mb-1">{ab.message}</div>
              <div className="text-xs italic text-white/35">{ab.hypothesis}</div>
            </div>
          ))}
        </Section>
      )}
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EmailResults({ data }: { data: any }) {
  return (
    <>
      <Section icon="📧" title="Email Drip Sequence (5 Emails)">
        {data.email_sequence?.map((e: { day: number; subject: string; preview_text: string; body: string; cta: string }, i: number) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)' }}>Day {e.day}</span>
                <span className="font-bold text-xs text-white/80">{e.subject}</span>
              </div>
              <CopyBtn text={`Subject: ${e.subject}\nPreview: ${e.preview_text}\n\n${e.body}\n\nCTA: ${e.cta}`} />
            </div>
            <div className="text-[11px] text-white/35 mb-2 italic">Preview: {e.preview_text}</div>
            <p className="text-sm text-white/72 leading-relaxed mb-2">{e.body}</p>
            <div className="text-xs font-bold" style={{ color: '#FF6B1A' }}>CTA: {e.cta}</div>
          </div>
        ))}
      </Section>
      {data.blog_post_ideas?.length > 0 && (
        <Section icon="📝" title="SEO Blog Post Ideas">
          {data.blog_post_ideas.map((b: { title: string; target_keyword: string; search_intent: string; outline: string[] }, i: number) => (
            <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="font-bold text-sm text-white/85 mb-1">{b.title}</div>
              <div className="text-xs mb-2 space-x-3">
                <span style={{ color: '#22C55E' }}>🔑 {b.target_keyword}</span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>Intent: {b.search_intent}</span>
              </div>
              <ul className="space-y-1">
                {b.outline?.map((point: string, j: number) => (
                  <li key={j} className="text-xs text-white/55 flex gap-1.5"><span style={{ color: 'rgba(255,107,26,0.7)' }}>•</span>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}
      {data.featured_blog_post && (
        <Section icon="🌟" title="Featured Blog Post (Ready to Publish)">
          <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="font-black text-white text-sm mb-1">{data.featured_blog_post.title}</h4>
                <p className="text-xs text-white/40 italic">{data.featured_blog_post.meta_description}</p>
              </div>
              <CopyBtn text={[
                data.featured_blog_post.title,
                '',
                data.featured_blog_post.intro,
                '',
                ...(data.featured_blog_post.sections || []).flatMap((s: { heading: string; content: string }) => [s.heading, s.content, '']),
                data.featured_blog_post.conclusion
              ].join('\n')} label="Copy Article" />
            </div>
            <p className="text-sm text-white/65 mb-4 leading-relaxed">{data.featured_blog_post.intro}</p>
            {data.featured_blog_post.sections?.map((s: { heading: string; content: string }, i: number) => (
              <div key={i} className="mb-3">
                <div className="text-sm font-bold text-white/80 mb-1">{s.heading}</div>
                <p className="text-xs text-white/58 leading-relaxed">{s.content}</p>
              </div>
            ))}
            {data.featured_blog_post.conclusion && (
              <p className="text-sm text-white/65 mt-4 pt-3 leading-relaxed border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>{data.featured_blog_post.conclusion}</p>
            )}
          </div>
        </Section>
      )}
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ReferralResults({ data }: { data: any }) {
  return (
    <>
      {data.business_owner_whatsapp?.length > 0 && (
        <Section icon="💬" title="WhatsApp — Direct Outreach to Business Owners">
          {data.business_owner_whatsapp.map((m: { text: string; context: string }, i: number) => (
            <ContentCard key={i} title={`Message ${i + 1}`} badge="WhatsApp" text={m.text} meta={`When to send: ${m.context}`} />
          ))}
        </Section>
      )}
      {data.whatsapp_group_post && (
        <Section icon="📢" title="WhatsApp Business Groups Post">
          <ContentCard title="Group Message" badge="WhatsApp Groups" text={data.whatsapp_group_post.text} meta={`Best time: ${data.whatsapp_group_post.tips}`} />
        </Section>
      )}
      {data.influencer_outreach_email && (
        <Section icon="🌟" title="Influencer Outreach Email">
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-xs font-bold text-white/80 mb-0.5">Subject: {data.influencer_outreach_email.subject}</div>
              </div>
              <CopyBtn text={`Subject: ${data.influencer_outreach_email.subject}\n\n${data.influencer_outreach_email.body}\n\nP.S. ${data.influencer_outreach_email.ps}`} />
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-2 whitespace-pre-wrap">{data.influencer_outreach_email.body}</p>
            {data.influencer_outreach_email.ps && <p className="text-xs italic text-white/45">P.S. {data.influencer_outreach_email.ps}</p>}
          </div>
        </Section>
      )}
      {data.referral_program_copy && (
        <Section icon="🎁" title="Referral Program Landing Page Copy">
          <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-black text-white text-base">{data.referral_program_copy.headline}</h4>
                <p className="text-sm text-white/55 mt-1">{data.referral_program_copy.subheadline}</p>
              </div>
              <CopyBtn text={`${data.referral_program_copy.headline}\n${data.referral_program_copy.subheadline}\n\n${data.referral_program_copy.how_it_works?.join('\n')}\n\n${data.referral_program_copy.reward_copy}\n\n${data.referral_program_copy.cta}`} label="Copy All" />
            </div>
            <div className="space-y-2 mb-4">
              {data.referral_program_copy.how_it_works?.map((step: string, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background: 'rgba(255,107,26,0.2)', color: '#FF6B1A' }}>{i + 1}</div>
                  <span className="text-sm text-white/65">{step}</span>
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-white/80 mb-3">{data.referral_program_copy.reward_copy}</p>
            <div className="inline-block px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(255,107,26,0.18)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.35)' }}>{data.referral_program_copy.cta}</div>
          </div>
        </Section>
      )}
      {data.testimonial_request && (
        <Section icon="⭐" title="Testimonial Request Message">
          <ContentCard title="Testimonial Ask" badge="WhatsApp / Email" text={data.testimonial_request.text} meta={`Follow-up: ${data.testimonial_request.follow_up}`} />
        </Section>
      )}
    </>
  );
}

// ─── Main page ─────────────────────────────────────────────────
const CAMPAIGN_TABS: { key: CampaignType; icon: string; label: string; description: string }[] = [
  { key: 'social', icon: '📣', label: 'Social Media', description: 'WhatsApp · Instagram · Facebook · LinkedIn' },
  { key: 'ads', icon: '🎯', label: 'Ad Campaign', description: 'Google Ads · Meta Ads · Audience targeting' },
  { key: 'email', icon: '📧', label: 'Email & SEO', description: '5-email drip · Blog posts · SEO articles' },
  { key: 'referral', icon: '🤝', label: 'Referral & Outreach', description: 'Influencers · Groups · Testimonials' },
];

const AUDIENCE_OPTIONS = [
  'Kirana store owners', 'Restaurant & food stall owners', 'Clothing boutique owners',
  'Salon & beauty parlour owners', 'Medical clinics & chemists', 'Coaching & tuition centres',
  'All Indian small business owners',
];

const TONE_OPTIONS = ['Friendly & conversational', 'Urgent & FOMO', 'Professional & credible', 'Story-driven & emotional'];

const HOOK_OPTIONS: Record<CampaignType, string[]> = {
  social: ['Festival season promotions', 'Save time on marketing', 'Free plan — no credit card', '₹299 is less than chai per day'],
  ads: ['Free trial CTA', 'Compete with big brands', 'AI content in your language', 'Limited-time offer'],
  email: ['Onboarding new users', 'Free to paid conversion', 'Re-engage inactive users', 'Festival campaign strategy'],
  referral: ['Earn free generations', 'Help business community', 'Become a PromoKit partner', 'Festival timing outreach'],
};

export default function MarketPage() {
  const [campaignType, setCampaignType] = useState<CampaignType>('social');
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[6]);
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [hook, setHook] = useState(HOOK_OPTIONS.social[0]);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<{ campaignType: CampaignType; data: any } | null>(null);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/marketing-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignType, audience, tone, hook }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setResult({ campaignType, data: json.data });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed. Check your API key.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-24" style={{ background: '#050508' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: 'rgba(255,107,26,0.1)', border: '1px solid rgba(255,107,26,0.25)', color: '#FF6B1A' }}>
            🤖 Marketing Agent
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            Promote{' '}
            <span style={{ background: 'linear-gradient(135deg, #FF6B1A, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              PromoKit
            </span>
          </h1>
          <p className="text-white/45 text-lg max-w-2xl">
            AI generates a complete marketing campaign — social posts, ad copy, email sequences, referral outreach — all ready to copy and post.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config panel */}
          <div className="lg:col-span-1 space-y-5">
            <div className="rounded-2xl p-5 sticky top-24" style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)' }}>

              {/* Campaign type */}
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Campaign Type</p>
                <div className="space-y-2">
                  {CAMPAIGN_TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => { setCampaignType(tab.key); setHook(HOOK_OPTIONS[tab.key][0]); setResult(null); }}
                      className="w-full rounded-xl p-3 text-left transition-all"
                      style={campaignType === tab.key
                        ? { background: 'rgba(255,107,26,0.12)', border: '1.5px solid rgba(255,107,26,0.4)' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tab.icon}</span>
                        <div>
                          <div className="text-sm font-bold" style={{ color: campaignType === tab.key ? '#FF6B1A' : 'rgba(255,255,255,0.8)' }}>{tab.label}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{tab.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience */}
              <div className="mb-4">
                <label className="form-label">Target Audience</label>
                <select
                  className="form-input w-full"
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  style={{ color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.05)' }}
                >
                  {AUDIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Tone */}
              <div className="mb-4">
                <label className="form-label">Tone</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TONE_OPTIONS.map(t => (
                    <button key={t} onClick={() => setTone(t)}
                      className="py-2 px-2 rounded-lg text-[11px] font-semibold transition-all text-center"
                      style={tone === t
                        ? { background: 'rgba(255,107,26,0.18)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.4)' }
                        : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hook */}
              <div className="mb-5">
                <label className="form-label">Campaign Hook</label>
                <div className="space-y-1.5">
                  {HOOK_OPTIONS[campaignType].map(h => (
                    <button key={h} onClick={() => setHook(h)}
                      className="w-full text-left py-2 px-3 rounded-lg text-xs transition-all"
                      style={hook === h
                        ? { background: 'rgba(255,107,26,0.12)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.35)' }
                        : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={generate}
                disabled={loading}
                className="w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 transition-all"
                style={loading
                  ? { background: 'rgba(255,107,26,0.1)', color: '#FF6B1A', border: '1.5px solid rgba(255,107,26,0.3)', cursor: 'wait' }
                  : { background: 'linear-gradient(135deg, #FF6B1A 0%, #FF9500 100%)', color: '#fff', boxShadow: '0 4px 24px rgba(255,107,26,0.4)' }}
              >
                {loading ? (
                  <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-18 0" strokeOpacity="0.3" strokeLinecap="round"/><path d="M12 3a9 9 0 019 9" strokeLinecap="round"/></svg>Agent is generating…</>
                ) : (
                  <>🤖 Generate Campaign</>
                )}
              </button>

              {loading && (
                <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Claude Sonnet is crafting your campaign…
                </p>
              )}
            </div>
          </div>

          {/* Results area */}
          <div className="lg:col-span-2">
            {error && (
              <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}>
                <p className="text-sm font-semibold" style={{ color: '#F87171' }}>⚠️ {error}</p>
              </div>
            )}

            {!result && !loading && (
              <div className="rounded-2xl p-10 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-black text-white mb-2">Ready to Promote PromoKit</h3>
                <p className="text-white/40 max-w-sm mx-auto">
                  Select your campaign type, target audience, and tone — then let AI generate a full ready-to-use marketing campaign.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  {CAMPAIGN_TABS.map(t => (
                    <button key={t.key} onClick={() => { setCampaignType(t.key); setHook(HOOK_OPTIONS[t.key][0]); }}
                      className="rounded-xl p-3 text-sm font-bold transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="h-3 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.06)', width: `${40 + i * 15}%` }} />
                    <div className="h-3 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.04)', width: '90%' }} />
                    <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', width: '75%' }} />
                  </div>
                ))}
              </div>
            )}

            {result && !loading && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CAMPAIGN_TABS.find(t => t.key === result.campaignType)?.icon}</span>
                    <h2 className="font-black text-white text-lg">{CAMPAIGN_TABS.find(t => t.key === result.campaignType)?.label} Campaign</h2>
                  </div>
                  <button onClick={() => setResult(null)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    ← New Campaign
                  </button>
                </div>

                {result.campaignType === 'social' && <SocialResults data={result.data} />}
                {result.campaignType === 'ads' && <AdsResults data={result.data} />}
                {result.campaignType === 'email' && <EmailResults data={result.data} />}
                {result.campaignType === 'referral' && <ReferralResults data={result.data} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
