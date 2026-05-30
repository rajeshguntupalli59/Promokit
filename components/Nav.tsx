'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav glass-nav-scrolled' : 'glass-nav'
      }`}
      style={{ height: '72px' }}
    >
      {/* Animated gradient border-bottom on scroll */}
      {scrolled && (
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,107,26,0.6) 30%, rgba(255,215,0,0.5) 50%, rgba(255,107,26,0.6) 70%, transparent 100%)',
          }}
        />
      )}

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #FF6B1A, #FFD700)',
              boxShadow: '0 0 24px rgba(255,107,26,0.55)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" />
            </svg>
          </div>
          <span
            className="font-black text-xl tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #FF6B1A, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            PromoKit
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8">
          {[
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Languages', href: '#how-it-works' },
            { label: 'Blog', href: '#' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#fff')}
              onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium transition-colors duration-150 px-4 py-2 rounded-lg"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div
          className="lg:hidden px-6 py-6 flex flex-col gap-5"
          style={{
            background: 'rgba(0,0,0,0.98)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {[
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Languages', href: '#how-it-works' },
            { label: 'Blog', href: '#' },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-medium text-sm"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="btn-primary text-center px-6 py-3.5 text-sm font-bold rounded-full mt-2"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard →
            </Link>
          ) : (
            <Link
              href="/auth/signup"
              className="btn-primary text-center px-6 py-3.5 text-sm font-bold rounded-full mt-2"
              onClick={() => setMenuOpen(false)}
            >
              Get Started Free →
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
