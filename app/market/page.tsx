'use client';

import { useState, useEffect, useCallback } from 'react';

type CampaignType = 'social' | 'ads' | 'email' | 'referral';

type ScheduledPost = {
  id: string;
  platform: string;
  content: string;
  media_url?: string;
  scheduled_at: string;
  status: 'pending' | 'published' | 'error';
  published_at?: string;
  error_message?: string;
  platform_post_id?: string;
};

const PLATFORM_OPTIONS = [
  { value: 'facebook', label: 'Facebook', color: '#1877F2' },
  { value: 'instagram', label: 'Instagram', color: '#E1306C' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { value: 'twitter', label: 'Twitter / X', color: '#1DA1F2' },
];

// ─── Schedule modal ────────────────────────────────────────────
function ScheduleModal({
  text, defaultPlatform, onClose
}: { text: string; defaultPlatform: string; onClose: () => void }) {
  const [platform, setPlatform] = useState(defaultPlatform);
  const [scheduledAt, setScheduledAt] = useState(() => {
    const d = new Date(Date.now() + 30 * 60 * 1000);
    // Convert to local time for datetime-local input (toISOString is always UTC)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function save() {
    setSaving(true); setErr('');
    try {
      const res = await fetch('/api/marketing-agent/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, content: text, scheduled_at: new Date(scheduledAt).toISOString() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to schedule');
      setDone(true);
      setTimeout(onClose, 1500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.12)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-white text-base">📅 Schedule Post</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 text-lg">✕</button>
        </div>

        {done ? (
          <div className="py-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-bold text-white">Post scheduled!</p>
          </div>
        ) : (
          <>
            <div className="rounded-xl p-3 mb-5 text-sm text-white/60 leading-relaxed" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {text.length > 200 ? text.slice(0, 200) + '…' : text}
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.35)' }}>Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORM_OPTIONS.map(p => (
                  <button key={p.value} onClick={() => setPlatform(p.value)}
                    className="py-2 px-3 rounded-lg text-xs font-bold transition-all"
                    style={platform === p.value
                      ? { background: `${p.color}22`, color: p.color, border: `1.5px solid ${p.color}66` }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.35)' }}>Publish At</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', colorScheme: 'dark' }}
              />
            </div>

            {err && <p className="text-xs mb-3" style={{ color: '#F87171' }}>⚠️ {err}</p>}

            <button onClick={save} disabled={saving}
              className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2"
              style={saving
                ? { background: 'rgba(255,107,26,0.1)', color: '#FF6B1A', border: '1.5px solid rgba(255,107,26,0.3)' }
                : { background: 'linear-gradient(135deg, #FF6B1A, #FF9500)', color: '#fff' }}>
              {saving ? 'Scheduling…' : '📅 Schedule Post'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

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
function ContentCard({ title, badge, badgeColor, text, meta, onSchedule }: {
  title: string; badge?: string; badgeColor?: string;
  text: string; meta?: string; onSchedule?: () => void;
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {onSchedule && (
            <button
              onClick={onSchedule}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,107,26,0.1)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.25)' }}
            >
              📅 Schedule
            </button>
          )}
          <CopyBtn text={text} />
        </div>
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
function SocialResults({ data, onSchedule }: { data: any; onSchedule: (text: string, platform: string) => void }) {
  return (
    <>
      <Section icon="💬" title="WhatsApp Messages">
        {data.whatsapp_messages?.map((m: { text: string; hook: string }, i: number) => (
          <ContentCard key={i} title={`Message ${i + 1}`} badge="WhatsApp" text={m.text} meta={`Why it works: ${m.hook}`} />
        ))}
      </Section>
      <Section icon="📸" title="Instagram Captions">
        {data.instagram_posts?.map((p: { caption: string; hashtags: string; hook: string }, i: number) => (
          <ContentCard key={i} title={`Post ${i + 1}`} badge="Instagram" badgeColor="#E1306C" text={`${p.caption}\n\n${p.hashtags}`} meta={p.hook} onSchedule={() => onSchedule(`${p.caption}\n\n${p.hashtags}`, 'instagram')} />
        ))}
      </Section>
      <Section icon="👥" title="Facebook Posts">
        {data.facebook_posts?.map((p: { text: string; hook: string }, i: number) => (
          <ContentCard key={i} title={`Post ${i + 1}`} badge="Facebook" badgeColor="#1877F2" text={p.text} meta={p.hook} onSchedule={() => onSchedule(p.text, 'facebook')} />
        ))}
      </Section>
      {data.linkedin_post && (
        <Section icon="💼" title="LinkedIn Post">
          <ContentCard title="LinkedIn" badge="LinkedIn" badgeColor="#0A66C2" text={data.linkedin_post.text} meta={data.linkedin_post.hook} onSchedule={() => onSchedule(data.linkedin_post.text, 'linkedin')} />
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
function AdsResults({ data, onSchedule }: { data: any; onSchedule: (text: string, platform: string) => void }) {
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
                <button onClick={() => onSchedule(ad.primary_text, 'facebook')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(255,107,26,0.1)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.25)' }}>📅 Schedule</button>
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
function EmailResults({ data }: { data: any; onSchedule?: (text: string, platform: string) => void }) {
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
function ReferralResults({ data, onSchedule }: { data: any; onSchedule: (text: string, platform: string) => void }) {
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
  social: ['Festival season promotions', 'Save time on marketing', 'Free plan — no credit card', '₹499 for unlimited AI marketing'],
  ads: ['Free trial CTA', 'Compete with big brands', 'AI content in your language', 'Limited-time offer'],
  email: ['Onboarding new users', 'Free to paid conversion', 'Re-engage inactive users', 'Festival campaign strategy'],
  referral: ['Earn free generations', 'Help business community', 'Become a PromoKit partner', 'Festival timing outreach'],
};

// ─── Queue view ────────────────────────────────────────────────
function QueueView() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketing-agent/schedule');
      if (res.ok) { const j = await res.json(); setPosts(j.posts ?? []); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function deletePost(id: string) {
    setDeleting(id);
    await fetch(`/api/marketing-agent/schedule?id=${id}`, { method: 'DELETE' });
    setPosts(p => p.filter(x => x.id !== id));
    setDeleting(null);
  }

  const statusColor = (s: string) =>
    s === 'published' ? '#22C55E' : s === 'error' ? '#F87171' : '#FF6B1A';
  const statusBg = (s: string) =>
    s === 'published' ? 'rgba(34,197,94,0.1)' : s === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(255,107,26,0.1)';
  const platformColor = (p: string) =>
    ({ facebook: '#1877F2', instagram: '#E1306C', linkedin: '#0A66C2', twitter: '#1DA1F2' })[p] ?? '#888';

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="h-3 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.06)', width: '60%' }} />
          <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', width: '80%' }} />
        </div>
      ))}
    </div>
  );

  if (posts.length === 0) return (
    <div className="rounded-2xl p-10 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
      <div className="text-5xl mb-3">📅</div>
      <h3 className="font-black text-white text-base mb-2">No scheduled posts yet</h3>
      <p className="text-white/40 text-sm">Generate a campaign and click <strong className="text-white/60">📅 Schedule</strong> on any post.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-white text-base">Scheduled Queue ({posts.length})</h3>
        <button onClick={fetchPosts} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>↺ Refresh</button>
      </div>
      {posts.map(post => (
        <div key={post.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: `${platformColor(post.platform)}22`, color: platformColor(post.platform), border: `1px solid ${platformColor(post.platform)}44` }}>
                  {post.platform}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: statusBg(post.status), color: statusColor(post.status), border: `1px solid ${statusColor(post.status)}44` }}>
                  {post.status}
                </span>
                <span className="text-[10px] text-white/35">
                  {post.status === 'published' && post.published_at
                    ? `Published ${new Date(post.published_at).toLocaleString()}`
                    : `Scheduled: ${new Date(post.scheduled_at).toLocaleString()}`}
                </span>
              </div>
              <p className="text-sm text-white/65 leading-relaxed line-clamp-3">{post.content}</p>
              {post.error_message && <p className="text-xs mt-2" style={{ color: '#F87171' }}>Error: {post.error_message}</p>}
            </div>
            {post.status === 'pending' && (
              <button onClick={() => deletePost(post.id)} disabled={deleting === post.id}
                className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(248,113,113,0.08)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                {deleting === post.id ? '…' : '✕'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketPage() {
  const [campaignType, setCampaignType] = useState<CampaignType>('social');
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[6]);
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [hook, setHook] = useState(HOOK_OPTIONS.social[0]);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<{ campaignType: CampaignType; data: any } | null>(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'generate' | 'queue'>('generate');
  const [scheduleModal, setScheduleModal] = useState<{ text: string; platform: string } | null>(null);

  function openSchedule(text: string, platform: string) {
    setScheduleModal({ text, platform });
  }

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
      {scheduleModal && (
        <ScheduleModal
          text={scheduleModal.text}
          defaultPlatform={scheduleModal.platform}
          onClose={() => setScheduleModal(null)}
        />
      )}

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: 'rgba(255,107,26,0.1)', border: '1px solid rgba(255,107,26,0.25)', color: '#FF6B1A' }}>
            🤖 Marketing Agent
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
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
            {/* View toggle */}
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => setViewMode('generate')}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={viewMode === 'generate'
                  ? { background: 'rgba(255,107,26,0.15)', color: '#FF6B1A', border: '1.5px solid rgba(255,107,26,0.4)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
                🤖 Generate
              </button>
              <button onClick={() => setViewMode('queue')}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={viewMode === 'queue'
                  ? { background: 'rgba(255,107,26,0.15)', color: '#FF6B1A', border: '1.5px solid rgba(255,107,26,0.4)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
                📅 Queue
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'queue' ? (
          <QueueView />
        ) : (
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

                  {result.campaignType === 'social' && <SocialResults data={result.data} onSchedule={openSchedule} />}
                  {result.campaignType === 'ads' && <AdsResults data={result.data} onSchedule={openSchedule} />}
                  {result.campaignType === 'email' && <EmailResults data={result.data} />}
                  {result.campaignType === 'referral' && <ReferralResults data={result.data} onSchedule={openSchedule} />}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
