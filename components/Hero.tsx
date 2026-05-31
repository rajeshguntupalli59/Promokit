'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ paddingTop: '80px', background: '#000000' }}
    >
      {/* Dramatic glowing orbs */}
      <div
        className="orb"
        style={{
          width: '900px',
          height: '900px',
          top: '-300px',
          right: '-200px',
          background: 'radial-gradient(circle, rgba(255,107,26,0.18) 0%, transparent 60%)',
        }}
      />
      <div
        className="orb"
        style={{
          width: '700px',
          height: '700px',
          bottom: '-200px',
          left: '-200px',
          background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 60%)',
        }}
      />
      <div
        className="orb"
        style={{
          width: '500px',
          height: '500px',
          top: '40%',
          left: '30%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none dot-grid"
        style={{ opacity: 0.4 }}
      />

      <div className="relative z-10 flex-1 flex items-center w-full max-w-screen-xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-20 items-center w-full">

          {/* Left: Copy */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="mb-8 inline-block">
              <div
                className="badge-shimmer inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  border: '1px solid rgba(255,107,26,0.35)',
                  color: '#FF8C42',
                }}
              >
                <span className="text-base">✦</span>
                Introducing PromoKit 2.0
              </div>
            </div>

            {/* H1 */}
            <h1
              className="font-black leading-[1.04] tracking-tight mb-8"
              style={{ fontSize: 'clamp(3rem, 6vw, 6rem)', letterSpacing: '-0.04em' }}
            >
              <span className="block text-white">Your Business.</span>
              <span
                className="block"
                style={{
                  background: 'linear-gradient(135deg, #FF6B1A 0%, #FFD700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Your Language.
              </span>
              <span className="block text-white">Your Customers.</span>
            </h1>

            <p
              className="mb-10 leading-relaxed max-w-lg"
              style={{ fontSize: '18px', color: 'rgba(255,255,255,0.55)' }}
            >
              The only AI tool built for Indian small businesses. Generate promotions in{' '}
              <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                Hindi, Telugu, Tamil
              </span>{' '}
              and 4 more languages — in under 2 minutes.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/create"
                className="btn-primary inline-flex items-center justify-center gap-2 px-9 py-5 text-lg font-bold rounded-2xl"
              >
                Start for Free →
              </Link>
              <a
                href="#how-it-works"
                className="btn-ghost inline-flex items-center justify-center gap-2 px-9 py-5 text-lg font-semibold rounded-2xl"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#FF6B1A' }}>
                  <circle cx="12" cy="12" r="10" fill="rgba(255,107,26,0.15)" />
                  <path d="M10 8l6 4-6 4V8z" fill="#FF6B1A" />
                </svg>
                Watch Demo
              </a>
            </div>

            {/* Trust row */}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Works on all your channels
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: 'WhatsApp', color: '#25D366', emoji: '💬' },
                  { label: 'Instagram', color: '#E1306C', emoji: '📸' },
                  { label: 'Facebook', color: '#1877F2', emoji: '👍' },
                  { label: 'Google Business', color: '#4285F4', emoji: '🔍' },
                ].map((ch) => (
                  <div key={ch.label} className="trust-icon">
                    <span>{ch.emoji}</span>
                    <span>{ch.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Browser window mockup */}
          <div
            className="hidden lg:flex justify-end animate-fade-in-up"
            style={{ animationDelay: '0.25s' }}
          >
            <div className="animate-float w-full max-w-[620px] relative">
              {/* Glow behind */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255,107,26,0.25) 0%, transparent 65%)',
                  filter: 'blur(50px)',
                  transform: 'scale(1.2)',
                }}
              />

              {/* Animated border wrapper */}
              <div className="animated-border">
                {/* Browser chrome */}
                <div className="browser-window">
                  {/* Title bar */}
                  <div className="browser-titlebar">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                      <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                      <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                    </div>
                    <div className="browser-url">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                      promokit.in/results
                    </div>
                    <div className="w-16" />
                  </div>

                  {/* Browser content */}
                  <div className="browser-content">
                    {/* App header */}
                    <div
                      className="flex items-center justify-between px-5 py-3 border-b"
                      style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f0f0f' }}
                    >
                      <div>
                        <div className="text-sm font-bold text-white">🎉 Your PromoKit is Ready!</div>
                        <div className="text-xs" style={{ color: 'rgba(255,107,26,0.8)' }}>
                          Ram Kirana Store — Kukatpally, Hyderabad
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div
                          className="px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}
                        >
                          Share Link
                        </div>
                        <div
                          className="px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{ background: 'rgba(255,107,26,0.12)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.2)' }}
                        >
                          Regenerate
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div
                      className="flex gap-0 border-b px-5"
                      style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#080808' }}
                    >
                      {['💬 WhatsApp', '📸 Instagram', '👍 Facebook', '📍 Google', '🖼️ Flyer'].map((tab, i) => (
                        <div
                          key={tab}
                          className="px-3 py-2.5 text-xs font-semibold whitespace-nowrap"
                          style={
                            i === 0
                              ? { color: '#FF6B1A', borderBottom: '2px solid #FF6B1A', marginBottom: '-1px' }
                              : { color: 'rgba(255,255,255,0.35)' }
                          }
                        >
                          {tab}
                        </div>
                      ))}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3" style={{ background: '#030303' }}>
                      <div
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                      >
                        3 Messages Generated
                      </div>

                      {/* Message 1 */}
                      <div
                        className="rounded-xl p-4"
                        style={{ background: '#0f1a12', border: '1px solid rgba(34,197,94,0.15)' }}
                      >
                        <div className="text-sm leading-relaxed" style={{ color: '#e9edef' }}>
                          🛒 <strong style={{ color: '#4ade80' }}>राम किराना स्टोर</strong> में आपका स्वागत है!
                          <br />
                          आज का खास ऑफर — चावल 25kg सिर्फ ₹850 🎉
                          <br />
                          📍 कुकटपल्ली · 📞 98765 43210
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            WhatsApp ready · Hindi
                          </span>
                          <div
                            className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                            style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}
                          >
                            Copy ✓
                          </div>
                        </div>
                      </div>

                      {/* Message 2 */}
                      <div
                        className="rounded-xl p-4"
                        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <div className="text-sm leading-relaxed text-white/70">
                          🎊 <strong className="text-white">दीपावली स्पेशल</strong> — इस हफ्ते 10% अतिरिक्त छूट! सिर्फ 5 दिन बाकी ⏰
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            Festival template · Hindi
                          </span>
                          <div
                            className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                          >
                            Copy
                          </div>
                        </div>
                      </div>

                      {/* Upsell */}
                      <div
                        className="rounded-xl p-3 flex items-center justify-between"
                        style={{ background: 'linear-gradient(135deg, rgba(255,107,26,0.08), rgba(255,140,66,0.04))', border: '1px solid rgba(255,107,26,0.2)' }}
                      >
                        <span className="text-xs text-white/60">
                          ⚡ Upgrade for <strong className="text-white">unlimited</strong> messages in all 7 languages
                        </span>
                        <span className="text-xs font-bold ml-3 whitespace-nowrap" style={{ color: '#FF6B1A' }}>
                          ₹499/mo →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Section divider */}
      <div className="section-divider" />

      {/* Stats bar */}
      <div
        className="relative z-10 w-full"
        style={{ background: 'rgba(10,10,10,0.8)' }}
      >
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-6 grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { val: '2,400+', label: 'Businesses' },
            { val: '7', label: 'Languages' },
            { val: '₹0', label: 'To Start' },
            { val: '2 min', label: 'Setup Time' },
            { val: '63M', label: 'SMBs in India' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="text-2xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #FF6B1A, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {s.val}
              </div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section divider bottom */}
      <div className="section-divider" />
    </section>
  );
}
