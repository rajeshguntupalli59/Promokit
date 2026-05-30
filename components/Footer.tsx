'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <footer style={{ background: '#000000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Newsletter bar */}
      <div
        className="w-full py-12"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0A0A0A' }}
      >
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h3 className="text-xl font-bold text-white mb-1">
              Get weekly marketing tips for your business
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>
              In Hindi or English — practical tips for Indian small businesses.
            </p>
          </div>

          {subscribed ? (
            <div
              className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
            >
              ✓ You&apos;re subscribed!
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex gap-3 w-full lg:w-auto min-w-0 lg:min-w-[460px]"
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button
                type="submit"
                className="btn-primary px-6 py-3.5 text-sm font-bold rounded-xl whitespace-nowrap flex-shrink-0"
              >
                Subscribe →
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #FF6B1A, #FFD700)',
                  boxShadow: '0 0 20px rgba(255,107,26,0.4)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                </svg>
              </div>
              <span
                className="font-black text-xl"
                style={{
                  background: 'linear-gradient(135deg, #FF6B1A, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                PromoKit
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs mb-6"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              AI-powered marketing content for Indian small businesses. Write promotions in your language, instantly.
            </p>
            {/* Social icons */}
            <div className="flex gap-2">
              {[
                { label: 'Twitter', icon: '𝕏' },
                { label: 'LinkedIn', icon: 'in' },
                { label: 'Instagram', icon: '📸' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 hover:scale-110"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4
              className="font-semibold text-sm mb-4"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              Product
            </h4>
            <ul className="space-y-2.5">
              {['Features', 'Pricing', 'Languages', 'How it Works'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)')}
                    onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4
              className="font-semibold text-sm mb-4"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              Support
            </h4>
            <ul className="space-y-2.5">
              {['FAQ', 'Contact', 'WhatsApp Support', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)')}
                    onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h4
              className="font-semibold text-sm mb-4"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              Languages
            </h4>
            <ul className="space-y-2.5">
              {[
                'हिन्दी',
                'తెలుగు',
                'தமிழ்',
                'मराठी',
                'ಕನ್ನಡ',
                'বাংলা',
                'English',
              ].map((lang) => (
                <li key={lang}>
                  <a
                    href="#"
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'rgba(255,255,255,0.4)', fontFamily: lang === 'English' ? 'Inter' : "'Noto Sans Devanagari', sans-serif" }}
                    onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)')}
                    onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)')}
                  >
                    {lang}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © 2026 PromoKit · Made with ❤️ for India 🇮🇳 · GST registered
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-sm transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
