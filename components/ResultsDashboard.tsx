'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type GeneratedData = {
  whatsapp: string[];
  instagram: string[];
  facebook: string[];
  google: string;
  flyerTagline: string;
  flyerHighlight: string;
};

type ResultPayload = {
  success: boolean;
  data: GeneratedData;
  business: {
    businessName: string;
    businessType: string;
    location: string;
    whatsapp: string;
    language: string;
  };
};

type Tab = 'WhatsApp' | 'Instagram' | 'Facebook' | 'Google' | 'Flyer';

const TABS: Tab[] = ['WhatsApp', 'Instagram', 'Facebook', 'Google', 'Flyer'];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
      style={
        copied
          ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
          : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }
      }
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied ✓
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function MessageCard({ text, index }: { text: string; index: number }) {
  return (
    <div
      className="rounded-xl p-5 group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded"
          style={{ background: 'rgba(255,107,26,0.12)', color: '#FF6B1A' }}
        >
          Version {index + 1}
        </span>
        <CopyButton text={text} />
      </div>
      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}

type FlyerTemplate = 'saffron' | 'midnight' | 'emerald';

const FLYER_TEMPLATES: Record<FlyerTemplate, {
  label: string;
  bg: string;
  headerBg: string;
  accent: string;
  accentMuted: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  pillBg: string;
  pillColor: string;
  footerBg: string;
}> = {
  saffron: {
    label: '🧡 Saffron Festive',
    bg: 'linear-gradient(160deg, #1a0800 0%, #2d1000 50%, #1a0800 100%)',
    headerBg: 'linear-gradient(135deg, #FF6B1A, #FF9500)',
    accent: '#FF6B1A',
    accentMuted: 'rgba(255,107,26,0.18)',
    border: '2px solid rgba(255,107,26,0.5)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    pillBg: 'rgba(255,107,26,0.22)',
    pillColor: '#FF9A4A',
    footerBg: 'rgba(0,0,0,0.3)',
  },
  midnight: {
    label: '💙 Midnight Pro',
    bg: 'linear-gradient(160deg, #060818 0%, #0D1535 50%, #060818 100%)',
    headerBg: 'linear-gradient(135deg, #3B5BDB, #6B8CEF)',
    accent: '#6B8CEF',
    accentMuted: 'rgba(107,140,239,0.18)',
    border: '2px solid rgba(107,140,239,0.45)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.6)',
    pillBg: 'rgba(107,140,239,0.2)',
    pillColor: '#A5B8FF',
    footerBg: 'rgba(0,0,0,0.35)',
  },
  emerald: {
    label: '💚 Emerald Fresh',
    bg: 'linear-gradient(160deg, #021208 0%, #041E0E 50%, #021208 100%)',
    headerBg: 'linear-gradient(135deg, #059669, #10B981)',
    accent: '#10B981',
    accentMuted: 'rgba(16,185,129,0.18)',
    border: '2px solid rgba(16,185,129,0.45)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.6)',
    pillBg: 'rgba(16,185,129,0.2)',
    pillColor: '#34D399',
    footerBg: 'rgba(0,0,0,0.35)',
  },
};

export default function ResultsDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('WhatsApp');
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [flyerTemplate, setFlyerTemplate] = useState<FlyerTemplate>('saffron');
  const [downloading, setDownloading] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('promokit_result');
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const downloadFlyer = async () => {
    if (!flyerRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(flyerRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `${result?.business.businessName ?? 'PromoKit'}-flyer.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050508' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-white mb-3">No results found</h2>
          <p className="text-white/40 mb-6">Please generate a PromoKit first.</p>
          <Link href="/create" className="btn-primary px-6 py-3 rounded-xl font-semibold inline-block">
            Create PromoKit →
          </Link>
        </div>
      </div>
    );
  }

  const { data, business } = result;

  const tabIcon: Record<Tab, string> = {
    WhatsApp: '💬',
    Instagram: '📸',
    Facebook: '👥',
    Google: '🔍',
    Flyer: '📄',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'WhatsApp':
        return (
          <div className="space-y-4">
            {(data.whatsapp || []).map((msg, i) => (
              <MessageCard key={i} text={msg} index={i} />
            ))}
          </div>
        );
      case 'Instagram':
        return (
          <div className="space-y-4">
            {(data.instagram || []).map((caption, i) => (
              <MessageCard key={i} text={caption} index={i} />
            ))}
          </div>
        );
      case 'Facebook':
        return (
          <div className="space-y-4">
            {(data.facebook || []).map((post, i) => (
              <MessageCard key={i} text={post} index={i} />
            ))}
          </div>
        );
      case 'Google':
        return (
          <div>
            <div
              className="rounded-xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔍</span>
                  <span className="text-sm font-semibold text-white/80">Google Business Description</span>
                </div>
                <CopyButton text={data.google || ''} />
              </div>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{data.google}</p>
              <div
                className="mt-4 p-3 rounded-lg"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <p className="text-xs text-white/40">
                  💡 <strong className="text-white/60">How to use:</strong> Go to Google Business Profile → Edit profile → Business description → Paste this text.
                </p>
              </div>
            </div>
          </div>
        );
      case 'Flyer': {
        const tpl = FLYER_TEMPLATES[flyerTemplate];
        const initials = business.businessName
          .split(' ')
          .slice(0, 2)
          .map((w: string) => w[0])
          .join('')
          .toUpperCase();
        return (
          <div>
            {/* Template picker */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {(Object.keys(FLYER_TEMPLATES) as FlyerTemplate[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setFlyerTemplate(key)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={
                    flyerTemplate === key
                      ? { background: 'rgba(255,107,26,0.2)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.5)' }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  {FLYER_TEMPLATES[key].label}
                </button>
              ))}
            </div>

            {/* Poster */}
            <div
              ref={flyerRef}
              className="rounded-3xl overflow-hidden mb-6"
              style={{
                background: tpl.bg,
                border: tpl.border,
                maxWidth: '440px',
                margin: '0 auto 24px',
                boxShadow: `0 0 60px ${tpl.accent}33`,
              }}
            >
              {/* Colour header band */}
              <div
                className="relative flex items-center justify-center py-7 px-6"
                style={{ background: tpl.headerBg }}
              >
                {/* Decorative circles */}
                <div
                  className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-20"
                  style={{ background: 'rgba(255,255,255,0.3)', transform: 'translate(30%, -30%)' }}
                />
                <div
                  className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-15"
                  style={{ background: 'rgba(255,255,255,0.3)', transform: 'translate(-30%, 30%)' }}
                />
                {/* Logo circle */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg"
                    style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', border: '2px solid rgba(255,255,255,0.4)' }}
                  >
                    {initials}
                  </div>
                  <div className="text-center">
                    <div className="text-white text-lg font-black leading-tight tracking-wide">{business.businessName}</div>
                    <div className="text-white/80 text-xs font-medium mt-0.5">{business.businessType}</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-7 py-6 text-center">
                {/* Offer pill */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
                  style={{ background: tpl.pillBg, color: tpl.pillColor, border: `1px solid ${tpl.accent}55` }}
                >
                  ✦ SPECIAL OFFER ✦
                </div>

                {/* Main headline — AI-generated flyerTagline */}
                <div
                  className="text-2xl font-black leading-tight mb-3"
                  style={{ color: tpl.textPrimary }}
                >
                  {data.flyerTagline || 'Quality Products at Best Prices!'}
                </div>

                {/* Divider */}
                <div
                  className="h-px my-4"
                  style={{ background: `linear-gradient(90deg, transparent, ${tpl.accent}66, transparent)` }}
                />

                {/* Highlight — AI-generated flyerHighlight */}
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: tpl.textSecondary }}
                >
                  {data.flyerHighlight || 'Visit us today for exclusive deals on all products.'}
                </p>

                {/* Contact strip */}
                <div
                  className="rounded-2xl px-5 py-4 space-y-2"
                  style={{ background: tpl.accentMuted, border: `1px solid ${tpl.accent}33` }}
                >
                  {business.location && (
                    <div className="flex items-center justify-center gap-2 text-sm font-medium" style={{ color: tpl.textPrimary }}>
                      <span>📍</span> {business.location}
                    </div>
                  )}
                  {business.whatsapp && (
                    <div className="flex items-center justify-center gap-2 text-sm font-medium" style={{ color: tpl.textPrimary }}>
                      <span>📲</span> {business.whatsapp}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                className="px-6 py-3 flex items-center justify-center"
                style={{ background: tpl.footerBg, borderTop: `1px solid ${tpl.accent}22` }}
              >
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: tpl.accent, opacity: 0.7 }}>
                  ⚡ Generated by PromoKit AI
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={downloadFlyer}
                disabled={downloading}
                className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                      <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
                    </svg>
                    Preparing…
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Download Poster (PNG)
                  </>
                )}
              </button>
              <p className="text-xs text-white/25">High-resolution · 3× scale · Ready to share on WhatsApp & Instagram</p>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24" style={{ background: '#050508' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Your PromoKit is Ready!
          </h1>
          <p className="text-white/50 text-lg">
            {business.businessName} · {business.language}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard?.writeText(url);
              }}
              className="btn-ghost inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              🔗 Share Link
            </button>
            <Link
              href="/create"
              className="btn-ghost inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              🔄 Regenerate
            </Link>
          </div>
        </div>

        {/* Tab navigation */}
        <div
          className="flex overflow-x-auto mb-6 rounded-xl"
          style={{
            background: '#141424',
            border: '1px solid rgba(255,255,255,0.07)',
            scrollbarWidth: 'none',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-200 whitespace-nowrap px-2"
              style={
                activeTab === tab
                  ? {
                      color: '#FF6B1A',
                      borderBottom: '2px solid #FF6B1A',
                      background: 'rgba(255,107,26,0.06)',
                    }
                  : {
                      color: 'rgba(255,255,255,0.4)',
                      borderBottom: '2px solid transparent',
                    }
              }
            >
              {tabIcon[tab]} {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          className="rounded-2xl p-5 sm:p-7"
          style={{ background: '#141424', border: '1px solid rgba(255,255,255,0.07)', minHeight: '300px' }}
        >
          {renderContent()}
        </div>

        {/* Upsell banner */}
        <div
          className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,26,0.12), rgba(99,102,241,0.08))',
            border: '1px solid rgba(255,107,26,0.25)',
          }}
        >
          <div>
            <div className="font-bold text-white text-lg mb-1">⭐ Upgrade to Starter — ₹299/mo</div>
            <p className="text-white/50 text-sm">
              Unlimited generations · All 7 languages · Festival templates · PDF flyers · QR page
            </p>
          </div>
          <Link
            href="/#pricing"
            className="btn-primary whitespace-nowrap px-6 py-3 rounded-xl font-bold text-sm flex-shrink-0"
          >
            Upgrade Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
