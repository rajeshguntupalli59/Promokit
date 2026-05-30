import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import MarqueeBanner from '@/components/MarqueeBanner';
import HowItWorks from '@/components/HowItWorks';
import LivePreview from '@/components/LivePreview';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="noise-bg">
      <Nav />
      <Hero />
      <MarqueeBanner />
      <HowItWorks />
      <LivePreview />
      <Features />
      <Testimonials />
      <Pricing />

      {/* CTA Banner */}
      <section className="py-28 lg:py-36 px-6" style={{ background: '#000000' }}>
        <div
          className="max-w-4xl mx-auto rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0f0800, #08050f)',
            border: '1px solid rgba(255,107,26,0.2)',
          }}
        >
          {/* Orbs */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,107,26,0.14) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          <div className="relative z-10">
            <div className="text-5xl mb-5">🇮🇳</div>
            <h2
              className="font-black leading-tight tracking-tight text-white mb-5"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
            >
              63 million small businesses in India.
              <br />
              None of them have a marketing team.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #FF6B1A, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                You do now.
              </span>
            </h2>
            <p
              className="text-lg mb-9 max-w-2xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Join thousands of kirana stores, salons, restaurants, and boutiques already using PromoKit to grow their customer base.
            </p>
            <Link
              href="/create"
              className="btn-primary inline-flex items-center gap-2 px-10 py-5 text-lg font-bold rounded-2xl"
            >
              Start Free — No Credit Card Needed →
            </Link>
            <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Setup in 2 minutes · No technical skills · Works on any phone
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
