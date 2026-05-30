'use client';

import { useState } from 'react';

const plans = [
  {
    name: 'Free',
    monthlyPrice: '₹0',
    annualPrice: '₹0',
    annualNote: 'forever free',
    period: 'forever',
    tagline: 'Perfect to try it out',
    color: '#6366F1',
    popular: false,
    features: [
      '3 PromoKit generations / month',
      '2 languages (Hindi + English)',
      'WhatsApp messages',
      'Instagram captions',
      'Basic text flyer',
      'No credit card needed',
    ],
    cta: 'Start Free →',
    ctaHref: '/create',
  },
  {
    name: 'Starter',
    monthlyPrice: '₹299',
    annualPrice: '₹207',
    annualNote: '₹2,490/yr · Save ₹1,098',
    period: '/month',
    tagline: 'For active small businesses',
    color: '#FF6B1A',
    popular: true,
    features: [
      'Unlimited generations',
      'All 7 Indian languages',
      'WhatsApp + Instagram + Facebook',
      'Google Business description',
      'Festival offer templates (20+)',
      'Downloadable PDF flyers',
      'QR digital profile page',
      'Priority support',
    ],
    cta: 'Get Starter →',
    ctaHref: '/create',
  },
  {
    name: 'Growth',
    monthlyPrice: '₹699',
    annualPrice: '₹499',
    annualNote: '₹5,990/yr · Save ₹2,398',
    period: '/month',
    tagline: 'For serious business growth',
    color: '#22C55E',
    popular: false,
    features: [
      'Everything in Starter',
      '5 business profiles',
      'Scheduled WhatsApp broadcasts',
      'Customer response templates',
      'Monthly marketing calendar',
      'Analytics & reach tracking',
      'Branded flyer with logo',
      'Dedicated account manager',
    ],
    cta: 'Get Growth →',
    ctaHref: '/create',
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-28 lg:py-36 relative overflow-hidden" style={{ background: '#000000' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(255,107,26,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-12">
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
            Transparent.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #22C55E, #4ADE80)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Affordable.
            </span>{' '}
            No surprises.
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Less than a cup of chai per day. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center justify-center">
            <div className="billing-toggle">
              <button
                className={annual ? '' : 'active'}
                onClick={() => setAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={annual ? 'active' : ''}
                onClick={() => setAnnual(true)}
              >
                Annual
                <span
                  className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold"
                  style={
                    annual
                      ? { background: 'rgba(255,255,255,0.2)', color: 'white' }
                      : { background: 'rgba(34,197,94,0.2)', color: '#22C55E' }
                  }
                >
                  Save 2 months
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 card-hover`}
              style={
                plan.popular
                  ? {
                      background: 'linear-gradient(145deg, #1a0e08, #120a18)',
                      border: '1px solid rgba(255,107,26,0.45)',
                      boxShadow: '0 0 50px rgba(255,107,26,0.18)',
                    }
                  : {
                      background: '#111111',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
              }
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="popular-badge">Most Popular</span>
                </div>
              )}

              <div className="mb-7">
                <div className="text-sm font-semibold mb-2" style={{ color: plan.color }}>
                  {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-white">
                    {annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  {plan.monthlyPrice !== '₹0' && (
                    <span className="text-white/40 text-sm pb-2">{plan.period}</span>
                  )}
                </div>
                {annual && plan.annualNote && (
                  <p className="text-xs font-medium mt-1" style={{ color: '#22C55E' }}>
                    {plan.annualNote}
                  </p>
                )}
                <p className="text-white/40 text-sm mt-2">{plan.tagline}</p>
                {plan.popular && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'rgba(255,107,26,0.7)' }}
                  >
                    Most teams start here
                  </p>
                )}
              </div>

              <div
                className="h-px mb-7"
                style={{ background: `linear-gradient(90deg, ${plan.color}40, transparent)` }}
              />

              <ul className="space-y-3.5 mb-9">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-white/70">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: plan.color }}
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.popular ? (
                <div className="animated-border">
                  <a
                    href={plan.ctaHref}
                    className="block text-center w-full py-4 font-bold text-sm text-white"
                    style={{ borderRadius: '14px' }}
                  >
                    {plan.cta}
                  </a>
                </div>
              ) : (
                <a
                  href={plan.ctaHref}
                  className="block text-center w-full py-4 rounded-xl font-bold text-sm transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {plan.cta}
                </a>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm mt-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
          All prices in Indian Rupees (INR) · GST applicable · Cancel anytime
        </p>
      </div>
    </section>
  );
}
