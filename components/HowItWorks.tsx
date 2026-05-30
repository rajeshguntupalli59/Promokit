const steps = [
  {
    number: '01',
    icon: '📝',
    title: 'Enter Details',
    description: 'Tell us your business name, what you sell, and your location. Takes 60 seconds.',
    color: '#FF6B1A',
  },
  {
    number: '02',
    icon: '🌐',
    title: 'Pick Language',
    description: 'Choose from Hindi, Telugu, Tamil, Marathi, Kannada, Bengali, or English.',
    color: '#6366F1',
  },
  {
    number: '03',
    icon: '🤖',
    title: 'AI Generates',
    description: 'Our AI writes WhatsApp messages, Instagram captions, and flyers — instantly.',
    color: '#22C55E',
  },
  {
    number: '04',
    icon: '🚀',
    title: 'Share & Grow',
    description: 'Copy, download, and share. Watch customers walk through your door.',
    color: '#FF6B1A',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-28 lg:py-36 relative overflow-hidden"
      style={{ background: '#000000' }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none dot-grid" style={{ opacity: 0.35 }} />

      {/* Orb */}
      <div
        className="orb"
        style={{
          width: '600px',
          height: '600px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ background: 'rgba(255,107,26,0.1)', border: '1px solid rgba(255,107,26,0.25)', color: '#FF6B1A' }}
          >
            How It Works
          </div>
          <h2
            className="font-black leading-tight tracking-tight"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em' }}
          >
            From zero to promotions{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #FF6B1A, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              in 4 steps.
            </span>
          </h2>
          <p
            className="text-lg mt-4 max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            No technical knowledge needed. No design software. Just your phone and 2 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-10 z-10"
                  style={{
                    left: 'calc(50% + 52px)',
                    right: 'calc(-50% + 20px)',
                    height: '2px',
                    borderTop: '2px dashed rgba(255,107,26,0.3)',
                  }}
                />
              )}

              <div
                className="card-hover rounded-2xl p-7 h-full relative overflow-hidden"
                style={{
                  background: '#111111',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'default',
                }}
              >
                {/* Big faint step number behind */}
                <div
                  className="absolute right-4 bottom-2 font-black select-none pointer-events-none"
                  style={{
                    fontSize: '120px',
                    lineHeight: 1,
                    color: 'rgba(255,255,255,0.04)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 flex-shrink-0 relative z-10"
                  style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                >
                  {step.icon}
                </div>

                <h3 className="text-lg font-bold text-white mb-2 relative z-10">{step.title}</h3>
                <p
                  className="text-sm leading-relaxed relative z-10"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <a
            href="/create"
            className="btn-primary inline-flex items-center gap-2 px-9 py-5 text-base font-bold rounded-2xl"
          >
            Try It Now — Free →
          </a>
          <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No credit card. No signup email. Just results.
          </p>
        </div>
      </div>
    </section>
  );
}
