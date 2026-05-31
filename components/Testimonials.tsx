const testimonials = [
  {
    name: 'Suresh Patel',
    business: 'Kirana Store Owner',
    city: 'Ahmedabad',
    avatar: '🛒',
    quote:
      'PromoKit saved me hours every week. My WhatsApp messages in Gujarati look so professional now. Customers actually read them!',
    gradient: 'from-orange-500/10 to-transparent',
  },
  {
    name: 'Priya Nair',
    business: 'Salon Owner',
    city: 'Chennai',
    avatar: '💈',
    quote:
      "I don't know English well but PromoKit writes perfect Tamil posts for my salon. My Instagram followers doubled in 2 months.",
    gradient: 'from-pink-500/10 to-transparent',
  },
  {
    name: 'Ravi Kumar',
    business: 'Restaurant Owner',
    city: 'Hyderabad',
    avatar: '🍛',
    quote:
      'My competitors spend ₹5000/month on a marketing agency. I spend ₹499 on PromoKit and get better results.',
    gradient: 'from-green-500/10 to-transparent',
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#FF6B1A">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-28 lg:py-36 relative overflow-hidden"
      style={{ background: '#000000' }}
    >
      {/* Orbs */}
      <div
        className="orb"
        style={{
          width: '600px',
          height: '600px',
          top: '-100px',
          left: '-100px',
          background: 'radial-gradient(circle, rgba(255,107,26,0.07) 0%, transparent 70%)',
        }}
      />
      <div
        className="orb"
        style={{
          width: '500px',
          height: '500px',
          bottom: '-100px',
          right: '-100px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ background: 'rgba(255,107,26,0.1)', border: '1px solid rgba(255,107,26,0.25)', color: '#FF6B1A' }}
          >
            Testimonials
          </div>
          <h2
            className="font-black leading-tight tracking-tight mb-4"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em' }}
          >
            Loved by businesses{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #FF6B1A, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              across India
            </span>{' '}
            🗺️
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Real business owners. Real results. From every corner of the country.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card relative overflow-hidden">
              {/* Subtle gradient accent */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,107,26,0.4), transparent)',
                }}
              />

              {/* Stars */}
              <div className="mb-5">
                <Stars />
              </div>

              {/* Quote */}
              <p
                className="text-base leading-relaxed mb-6 italic"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: 'rgba(255,107,26,0.1)',
                    border: '1px solid rgba(255,107,26,0.2)',
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    {t.business} · {t.city}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust stats */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          {[
            { val: '4.9/5', label: 'Average rating' },
            { val: '2,400+', label: 'Happy businesses' },
            { val: '98%', label: 'Would recommend' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="text-3xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #FF6B1A, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {s.val}
              </div>
              <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
