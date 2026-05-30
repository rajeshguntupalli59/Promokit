'use client';

import { useState } from 'react';
import Link from 'next/link';

type PlanKey = 'free' | 'starter' | 'growth';

const PLANS = [
  {
    key: 'free' as PlanKey,
    name: 'Free',
    price: { monthly: '₹0', annual: '₹0' },
    annualNote: 'forever free',
    tagline: 'Try it — no card needed',
    color: '#6366F1',
    popular: false,
    cta: 'Start Free →',
    ctaHref: '/create',
  },
  {
    key: 'starter' as PlanKey,
    name: 'Starter',
    price: { monthly: '₹299', annual: '₹207' },
    annualNote: '₹2,490/yr · Save ₹1,098',
    tagline: 'For active small businesses',
    color: '#FF6B1A',
    popular: true,
    cta: 'Get Starter →',
    ctaHref: '/auth/signup',
  },
  {
    key: 'growth' as PlanKey,
    name: 'Growth',
    price: { monthly: '₹699', annual: '₹499' },
    annualNote: '₹5,990/yr · Save ₹2,398',
    tagline: 'Scale your business fast',
    color: '#22C55E',
    popular: false,
    cta: 'Get Growth →',
    ctaHref: '/auth/signup',
  },
];

// Feature rows for the comparison table
// value: true = included, false = not included, string = custom label
type FeatureValue = boolean | string;
type FeatureRow = {
  label: string;
  category?: string;
  free: FeatureValue;
  starter: FeatureValue;
  growth: FeatureValue;
};

const FEATURES: FeatureRow[] = [
  // Core generation
  { label: 'AI generations / month', category: 'Core', free: '3', starter: 'Unlimited', growth: 'Unlimited' },
  { label: 'WhatsApp messages (3 versions)', category: 'Core', free: true, starter: true, growth: true },
  { label: 'Instagram captions (3 versions)', category: 'Core', free: true, starter: true, growth: true },
  { label: 'Facebook posts (2 versions)', category: 'Core', free: true, starter: true, growth: true },
  { label: 'Google Business description', category: 'Core', free: true, starter: true, growth: true },
  { label: 'WhatsApp direct share button', category: 'Core', free: true, starter: true, growth: true },
  // Languages
  { label: 'Languages available', category: 'Languages', free: '4 (Hindi, Telugu, Tamil, English)', starter: 'All 7', growth: 'All 7' },
  { label: 'Marathi, Kannada, Bengali', category: 'Languages', free: false, starter: true, growth: true },
  // Poster & flyer
  { label: 'Poster templates', category: 'Poster', free: '3 basic', starter: 'All 9 templates', growth: 'All 9 templates' },
  { label: 'Festive, Modern, Elegant, Nature themes', category: 'Poster', free: false, starter: true, growth: true },
  { label: 'Special offer / price list on poster', category: 'Poster', free: false, starter: true, growth: true },
  { label: 'QR code (WhatsApp scan-to-chat)', category: 'Poster', free: false, starter: true, growth: true },
  { label: 'Animated poster preview', category: 'Poster', free: false, starter: true, growth: true },
  { label: 'PNG poster download (3× resolution)', category: 'Poster', free: true, starter: true, growth: true },
  { label: 'PDF flyer export (print-ready)', category: 'Poster', free: false, starter: true, growth: true },
  { label: 'Business logo on poster', category: 'Poster', free: false, starter: false, growth: true },
  // Business management
  { label: 'Schedule reminders', category: 'Management', free: false, starter: true, growth: true },
  { label: 'Generation history (re-open any promo)', category: 'Management', free: false, starter: true, growth: true },
  { label: 'Save business profiles', category: 'Management', free: false, starter: 'Up to 3', growth: 'Unlimited' },
  { label: 'Load saved business into form', category: 'Management', free: false, starter: true, growth: true },
  // Broadcast & growth
  { label: 'WhatsApp broadcast contact list', category: 'Growth Tools', free: false, starter: false, growth: true },
  { label: 'Customer collection landing page', category: 'Growth Tools', free: false, starter: false, growth: true },
  { label: 'Referral rewards (earn free generations)', category: 'Growth Tools', free: false, starter: false, growth: true },
];

const CATEGORIES = ['Core', 'Languages', 'Poster', 'Management', 'Growth Tools'];

function Check({ value, planColor }: { value: FeatureValue; planColor: string }) {
  if (value === false) return (
    <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '18px' }}>—</span>
  );
  if (value === true) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: planColor }}>
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return <span className="text-xs font-semibold" style={{ color: planColor }}>{value}</span>;
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-28 lg:py-36 relative overflow-hidden" style={{ background: '#000000' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,107,26,0.06) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' }}
          >
            Pricing
          </div>
          <h2
            className="font-black leading-tight tracking-tight mb-4"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em' }}
          >
            Simple plans.{' '}
            <span style={{ background: 'linear-gradient(135deg, #FF6B1A, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Real results.
            </span>
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Less than a cup of chai per day. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center justify-center">
            <div className="billing-toggle">
              <button className={annual ? '' : 'active'} onClick={() => setAnnual(false)}>Monthly</button>
              <button className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>
                Annual
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold" style={annual ? { background: 'rgba(255,255,255,0.2)', color: 'white' } : { background: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>
                  Save 2 months
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map(plan => (
            <div
              key={plan.key}
              className="relative rounded-2xl p-8 card-hover flex flex-col"
              style={
                plan.popular
                  ? { background: 'linear-gradient(145deg, #1a0e08, #120a18)', border: '1px solid rgba(255,107,26,0.45)', boxShadow: '0 0 50px rgba(255,107,26,0.18)' }
                  : { background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="popular-badge">Most Popular</span>
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm font-bold mb-2" style={{ color: plan.color }}>{plan.name}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-white">
                    {annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  {plan.key !== 'free' && (
                    <span className="text-white/40 text-sm pb-2">/mo</span>
                  )}
                </div>
                {annual && plan.annualNote && (
                  <p className="text-xs font-medium mt-1" style={{ color: '#22C55E' }}>{plan.annualNote}</p>
                )}
                {plan.key === 'free' && (
                  <p className="text-xs font-medium mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>forever free</p>
                )}
                <p className="text-white/40 text-sm mt-2">{plan.tagline}</p>
              </div>

              {/* Plan highlights */}
              <div className="space-y-2.5 mb-8 flex-1">
                {plan.key === 'free' && [
                  '3 generations / month',
                  'Hindi, Telugu, Tamil, English',
                  '3 poster templates',
                  'WhatsApp + Instagram + Facebook',
                  'Google Business description',
                  'PNG download',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: plan.color, flexShrink: 0 }}>
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </div>
                ))}
                {plan.key === 'starter' && [
                  'Unlimited generations',
                  'All 7 Indian languages',
                  'All 9 poster templates',
                  'Special offer / price list',
                  'QR code on poster',
                  'PDF flyer export',
                  'Animated poster preview',
                  'Save up to 3 businesses',
                  'Generation history (50 entries)',
                  'Schedule post reminders',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: plan.color, flexShrink: 0 }}>
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </div>
                ))}
                {plan.key === 'growth' && [
                  'Everything in Starter',
                  'Business logo on poster',
                  'WhatsApp broadcast list',
                  'Customer contact collection page',
                  'Referral rewards (earn free gens)',
                  'Unlimited saved businesses',
                  'Priority AI generation',
                ].map((f, i) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: i === 0 ? 'rgba(255,255,255,0.3)' : plan.color, flexShrink: 0 }}>
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </div>
                ))}
              </div>

              <div className="h-px mb-6" style={{ background: `linear-gradient(90deg, ${plan.color}40, transparent)` }} />

              {plan.popular ? (
                <div className="animated-border">
                  <Link href={plan.ctaHref} className="block text-center w-full py-3.5 font-bold text-sm text-white" style={{ borderRadius: '14px' }}>
                    {plan.cta}
                  </Link>
                </div>
              ) : (
                <Link
                  href={plan.ctaHref}
                  className="block text-center w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div>
          <h3 className="text-center font-black text-xl text-white mb-8">
            Full Feature Comparison
          </h3>

          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Table header */}
            <div className="grid grid-cols-4 px-6 py-4" style={{ background: '#0D0D0D', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-sm font-bold text-white/40">Feature</div>
              {PLANS.map(p => (
                <div key={p.key} className="text-center">
                  <span className="text-sm font-black" style={{ color: p.color }}>{p.name}</span>
                  <div className="text-xs mt-0.5 font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {annual ? p.price.annual : p.price.monthly}{p.key !== 'free' ? '/mo' : ''}
                  </div>
                </div>
              ))}
            </div>

            {/* Rows by category */}
            {CATEGORIES.map(cat => {
              const rows = FEATURES.filter(f => f.category === cat);
              return (
                <div key={cat}>
                  {/* Category header */}
                  <div className="px-6 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {cat}
                    </span>
                  </div>

                  {rows.map((row, i) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-4 px-6 py-3.5 items-center"
                      style={{
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <div className="text-sm pr-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {row.label}
                      </div>
                      {PLANS.map(p => (
                        <div key={p.key} className="flex justify-center">
                          <Check value={row[p.key]} planColor={p.color} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-sm mt-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
          All prices in Indian Rupees (INR) · GST applicable · Cancel anytime
        </p>
      </div>
    </section>
  );
}
