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

type PriceItem = { name: string; price: string; original: string };

type ResultPayload = {
  success: boolean;
  data: GeneratedData;
  business: {
    businessName: string;
    businessType: string;
    location: string;
    whatsapp: string;
    language: string;
    logoUrl?: string;
    offerEnabled?: boolean;
    offerOccasion?: string;
    offerBadge?: string;
    offerValidTill?: string;
    offerItems?: PriceItem[];
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

function MessageCard({ text, index, showShare }: { text: string; index: number; showShare?: boolean }) {
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
        <div className="flex items-center gap-2">
          {showShare && (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(text)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366', border: '1px solid rgba(37,211,102,0.25)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share
            </a>
          )}
          <CopyButton text={text} />
        </div>
      </div>
      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}

type Reminder = { id: string; title: string; date: string; content: string }

function ReminderModal({ content, onClose }: { content: string; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [saved, setSaved] = useState(false)

  function save() {
    if (!date) return
    const reminders: Reminder[] = JSON.parse(localStorage.getItem('promokit_reminders') ?? '[]')
    reminders.push({ id: Date.now().toString(), title: title || 'Post reminder', date, content })
    localStorage.setItem('promokit_reminders', JSON.stringify(reminders))
    setSaved(true)
    setTimeout(onClose, 1200)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#141424', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        {saved ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-bold text-white">Reminder saved!</p>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-white text-base mb-4">⏰ Set Reminder</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="form-label">Label (optional)</label>
                <input className="form-input" placeholder="Post on Instagram" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Remind me on *</label>
                <input className="form-input" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().slice(0,16)} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={save} disabled={!date} className="btn-primary flex-[2] py-2.5 rounded-xl text-sm font-bold" style={{ opacity: !date ? 0.5 : 1 }}>Save Reminder</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

type FlyerTemplate =
  | 'saffron' | 'diwali' | 'rose' | 'midnight' | 'ocean'
  | 'emerald' | 'violet' | 'sunrise' | 'steel';

type TemplateConfig = {
  label: string;
  emoji: string;
  category: string;
  bg: string;
  headerBg: string;
  accent: string;
  accentMuted: string;
  border: string;
  textSecondary: string;
  pillColor: string;
  footerBg: string;
  pattern: 'dots' | 'diagonal' | 'waves' | 'mesh' | 'mandala' | 'none';
  patternColor: string;
};

const FLYER_TEMPLATES: Record<FlyerTemplate, TemplateConfig> = {
  saffron: {
    label: 'Saffron Festive', emoji: '🧡', category: 'Festive',
    bg: 'linear-gradient(160deg, #1a0800 0%, #2d1000 60%, #1a0800 100%)',
    headerBg: 'linear-gradient(135deg, #FF6B1A 0%, #FF9500 100%)',
    accent: '#FF6B1A', accentMuted: 'rgba(255,107,26,0.18)',
    border: '2px solid rgba(255,107,26,0.55)',
    textSecondary: 'rgba(255,255,255,0.62)',
    pillColor: '#FF9A4A', footerBg: 'rgba(0,0,0,0.32)',
    pattern: 'dots', patternColor: 'rgba(255,107,26,0.07)',
  },
  diwali: {
    label: 'Diwali Gold', emoji: '🪔', category: 'Festive',
    bg: 'linear-gradient(160deg, #120800 0%, #1E1000 50%, #2A1500 100%)',
    headerBg: 'linear-gradient(135deg, #B8860B 0%, #FFD700 50%, #DAA520 100%)',
    accent: '#FFD700', accentMuted: 'rgba(255,215,0,0.15)',
    border: '2px solid rgba(255,215,0,0.5)',
    textSecondary: 'rgba(255,220,100,0.7)',
    pillColor: '#FFD700', footerBg: 'rgba(0,0,0,0.4)',
    pattern: 'mandala', patternColor: 'rgba(255,215,0,0.05)',
  },
  rose: {
    label: 'Rose Bloom', emoji: '🌸', category: 'Elegant',
    bg: 'linear-gradient(160deg, #120008 0%, #200010 50%, #180010 100%)',
    headerBg: 'linear-gradient(135deg, #BE185D 0%, #EC4899 60%, #F472B6 100%)',
    accent: '#EC4899', accentMuted: 'rgba(236,72,153,0.15)',
    border: '2px solid rgba(236,72,153,0.5)',
    textSecondary: 'rgba(255,200,230,0.65)',
    pillColor: '#F9A8D4', footerBg: 'rgba(0,0,0,0.35)',
    pattern: 'diagonal', patternColor: 'rgba(236,72,153,0.06)',
  },
  midnight: {
    label: 'Midnight Pro', emoji: '💙', category: 'Modern',
    bg: 'linear-gradient(160deg, #020614 0%, #0D1535 50%, #060818 100%)',
    headerBg: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 70%, #60A5FA 100%)',
    accent: '#3B82F6', accentMuted: 'rgba(59,130,246,0.15)',
    border: '2px solid rgba(59,130,246,0.5)',
    textSecondary: 'rgba(180,210,255,0.65)',
    pillColor: '#93C5FD', footerBg: 'rgba(0,0,0,0.4)',
    pattern: 'mesh', patternColor: 'rgba(59,130,246,0.06)',
  },
  ocean: {
    label: 'Ocean Breeze', emoji: '🌊', category: 'Modern',
    bg: 'linear-gradient(160deg, #010C12 0%, #062030 50%, #021018 100%)',
    headerBg: 'linear-gradient(135deg, #0E7490 0%, #06B6D4 65%, #22D3EE 100%)',
    accent: '#06B6D4', accentMuted: 'rgba(6,182,212,0.15)',
    border: '2px solid rgba(6,182,212,0.48)',
    textSecondary: 'rgba(150,240,255,0.65)',
    pillColor: '#67E8F9', footerBg: 'rgba(0,0,0,0.38)',
    pattern: 'waves', patternColor: 'rgba(6,182,212,0.07)',
  },
  emerald: {
    label: 'Emerald Fresh', emoji: '💚', category: 'Nature',
    bg: 'linear-gradient(160deg, #021208 0%, #041E0E 50%, #031510 100%)',
    headerBg: 'linear-gradient(135deg, #065F46 0%, #059669 60%, #10B981 100%)',
    accent: '#10B981', accentMuted: 'rgba(16,185,129,0.15)',
    border: '2px solid rgba(16,185,129,0.48)',
    textSecondary: 'rgba(150,255,210,0.65)',
    pillColor: '#6EE7B7', footerBg: 'rgba(0,0,0,0.35)',
    pattern: 'dots', patternColor: 'rgba(16,185,129,0.07)',
  },
  violet: {
    label: 'Violet Premium', emoji: '💜', category: 'Elegant',
    bg: 'linear-gradient(160deg, #080414 0%, #14063A 50%, #0A0420 100%)',
    headerBg: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #A78BFA 100%)',
    accent: '#8B5CF6', accentMuted: 'rgba(139,92,246,0.15)',
    border: '2px solid rgba(139,92,246,0.5)',
    textSecondary: 'rgba(210,190,255,0.65)',
    pillColor: '#C4B5FD', footerBg: 'rgba(0,0,0,0.4)',
    pattern: 'diagonal', patternColor: 'rgba(139,92,246,0.07)',
  },
  sunrise: {
    label: 'Sunrise Energy', emoji: '🌅', category: 'Festive',
    bg: 'linear-gradient(160deg, #120400 0%, #1E0800 40%, #100A00 100%)',
    headerBg: 'linear-gradient(135deg, #DC2626 0%, #F97316 40%, #FBBF24 100%)',
    accent: '#F97316', accentMuted: 'rgba(249,115,22,0.15)',
    border: '2px solid rgba(249,115,22,0.52)',
    textSecondary: 'rgba(255,220,150,0.65)',
    pillColor: '#FCD34D', footerBg: 'rgba(0,0,0,0.38)',
    pattern: 'waves', patternColor: 'rgba(249,115,22,0.06)',
  },
  steel: {
    label: 'Urban Steel', emoji: '🏙️', category: 'Modern',
    bg: 'linear-gradient(160deg, #080808 0%, #141414 50%, #0A0A0A 100%)',
    headerBg: 'linear-gradient(135deg, #374151 0%, #6B7280 60%, #9CA3AF 100%)',
    accent: '#9CA3AF', accentMuted: 'rgba(156,163,175,0.12)',
    border: '2px solid rgba(156,163,175,0.35)',
    textSecondary: 'rgba(210,210,220,0.6)',
    pillColor: '#D1D5DB', footerBg: 'rgba(0,0,0,0.5)',
    pattern: 'mesh', patternColor: 'rgba(156,163,175,0.05)',
  },
};

const TEMPLATE_CATEGORIES = ['All', 'Festive', 'Modern', 'Elegant', 'Nature'];

// SVG pattern overlays — rendered as inline background-image data URIs
function svgPattern(type: TemplateConfig['pattern'], color: string): string {
  const enc = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
  switch (type) {
    case 'dots':
      return enc(`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='2' cy='2' r='1.5' fill='${color}'/></svg>`);
    case 'diagonal':
      return enc(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><line x1='0' y1='16' x2='16' y2='0' stroke='${color}' stroke-width='1.2'/></svg>`);
    case 'waves':
      return enc(`<svg xmlns='http://www.w3.org/2000/svg' width='40' height='12'><path d='M0 6 Q10 0 20 6 Q30 12 40 6' fill='none' stroke='${color}' stroke-width='1.2'/></svg>`);
    case 'mesh':
      return enc(`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><line x1='0' y1='0' x2='20' y2='20' stroke='${color}' stroke-width='0.8'/><line x1='20' y1='0' x2='0' y2='20' stroke='${color}' stroke-width='0.8'/></svg>`);
    case 'mandala':
      return enc(`<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='16' fill='none' stroke='${color}' stroke-width='0.8'/><circle cx='20' cy='20' r='10' fill='none' stroke='${color}' stroke-width='0.8'/><circle cx='20' cy='20' r='4' fill='none' stroke='${color}' stroke-width='0.8'/></svg>`);
    default:
      return 'none';
  }
}

// Templates available on free plan
const FREE_TEMPLATES: FlyerTemplate[] = ['saffron', 'diwali', 'midnight']

function UpgradeGate({ label, requiredPlan = 'starter', children }: { label: string; requiredPlan?: 'starter' | 'growth'; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div style={{ opacity: 0.3, pointerEvents: 'none', userSelect: 'none' }}>{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
        <span className="text-xl">🔒</span>
        <p className="text-xs font-bold text-white/90 text-center px-2">{label}</p>
        <a
          href="/#pricing"
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: requiredPlan === 'growth' ? 'rgba(34,197,94,0.2)' : 'rgba(255,107,26,0.2)', color: requiredPlan === 'growth' ? '#22C55E' : '#FF6B1A', border: `1px solid ${requiredPlan === 'growth' ? 'rgba(34,197,94,0.4)' : 'rgba(255,107,26,0.4)'}` }}
        >
          Upgrade to {requiredPlan === 'growth' ? 'Growth' : 'Starter'} →
        </a>
      </div>
    </div>
  )
}

export default function ResultsDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('WhatsApp');
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [plan, setPlan] = useState<string>('free');
  const [flyerTemplate, setFlyerTemplate] = useState<FlyerTemplate>('saffron');
  const [templateCategory, setTemplateCategory] = useState('All');
  const [downloading, setDownloading] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [reminderContent, setReminderContent] = useState<string | null>(null);
  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('promokit_result');
    const storedPlan = localStorage.getItem('promokit_plan') ?? 'free';
    setPlan(storedPlan);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResult(parsed);
        if (parsed.plan) setPlan(parsed.plan);
      } catch {
        // ignore
      }
    }
  }, []);

  const isPaid = plan === 'starter' || plan === 'growth';
  const isGrowth = plan === 'growth';

  function buildPosterParams(extra?: Record<string, string>) {
    if (!result) return new URLSearchParams();
    const offerItems = result.business.offerItems?.filter(it => it.name) ?? [];
    return new URLSearchParams({
      name: result.business.businessName,
      type: result.business.businessType,
      location: result.business.location ?? '',
      whatsapp: result.business.whatsapp ?? '',
      tagline: result.data.flyerTagline ?? '',
      highlight: result.data.flyerHighlight ?? '',
      template: flyerTemplate,
      language: result.business.language ?? 'English',
      offerBadge: result.business.offerEnabled ? (result.business.offerBadge ?? '') : '',
      offerOccasion: result.business.offerEnabled ? (result.business.offerOccasion ?? '') : '',
      offerValidTill: result.business.offerEnabled ? (result.business.offerValidTill ?? '') : '',
      offerItems: result.business.offerEnabled && offerItems.length ? JSON.stringify(offerItems) : '',
      qr: result.business.whatsapp ? '1' : '',
      logoUrl: result.business.logoUrl ?? '',
      ...extra,
    });
  }

  const downloadFlyer = async () => {
    if (!result || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/poster?${buildPosterParams()}`);
      if (!res.ok) throw new Error('render failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${result.business.businessName}-poster.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      if (flyerRef.current) {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(flyerRef.current, { scale: 3, useCORS: true, backgroundColor: null });
        const link = document.createElement('a');
        link.download = `${result.business.businessName}-poster.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } finally {
      setDownloading(false);
    }
  };

  const downloadPdf = async () => {
    if (!result || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/poster?${buildPosterParams()}`);
      if (!res.ok) throw new Error('render failed');
      const blob = await res.blob();
      const dataUrl = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210, H = W * (1350 / 1080);
      const top = (297 - H) / 2;
      pdf.addImage(dataUrl, 'PNG', 0, Math.max(0, top), W, Math.min(H, 297));
      pdf.save(`${result.business.businessName}-poster.pdf`);
    } catch {
      alert('PDF export failed. Try PNG download instead.');
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
              <div key={i}>
                <MessageCard text={msg} index={i} showShare />
                <div className="flex justify-end mt-1.5">
                  <button
                    onClick={() => setReminderContent(msg)}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
                    style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)' }}
                  >
                    ⏰ Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'Instagram':
        return (
          <div className="space-y-4">
            {(data.instagram || []).map((caption, i) => (
              <div key={i}>
                <MessageCard text={caption} index={i} />
                <div className="flex justify-end mt-1.5">
                  <button
                    onClick={() => setReminderContent(caption)}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
                    style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)' }}
                  >
                    ⏰ Schedule
                  </button>
                </div>
              </div>
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
          .split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
        const visibleTemplates = (Object.keys(FLYER_TEMPLATES) as FlyerTemplate[])
          .filter(k => templateCategory === 'All' || FLYER_TEMPLATES[k].category === templateCategory);

        return (
          <div>
            {/* Category filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {TEMPLATE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategory(cat)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={
                    templateCategory === cat
                      ? { background: 'rgba(255,107,26,0.18)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.4)' }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Template thumbnail gallery */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
              {visibleTemplates.map(key => {
                const t = FLYER_TEMPLATES[key];
                const active = flyerTemplate === key;
                const locked = !isPaid && !FREE_TEMPLATES.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => { if (!locked) setFlyerTemplate(key) }}
                    className="relative rounded-xl overflow-hidden transition-all duration-200 group"
                    style={{
                      aspectRatio: '3/4',
                      background: t.bg,
                      border: active ? `2px solid ${t.accent}` : locked ? '2px solid rgba(255,255,255,0.04)' : '2px solid rgba(255,255,255,0.08)',
                      boxShadow: active ? `0 0 18px ${t.accent}44` : 'none',
                      transform: active ? 'scale(1.04)' : 'scale(1)',
                      opacity: locked ? 0.55 : 1,
                      cursor: locked ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1/3" style={{ background: t.headerBg }} />
                    {t.pattern !== 'none' && (
                      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: svgPattern(t.pattern, t.patternColor) }} />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 px-1">
                      <div className="text-lg">{t.emoji}</div>
                      <div className="text-white/80 text-[9px] font-bold text-center leading-tight mt-0.5">{t.label}</div>
                    </div>
                    {locked && (
                      <div className="absolute top-1 left-1 text-[8px] font-bold px-1 py-0.5 rounded" style={{ background: 'rgba(255,107,26,0.8)', color: '#fff' }}>
                        Starter
                      </div>
                    )}
                    {active && !locked && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: t.accent }}>
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {!isPaid && (
              <div className="text-center mb-4">
                <a href="/#pricing" className="text-xs font-semibold" style={{ color: 'rgba(255,107,26,0.7)' }}>
                  🔒 6 more premium templates — Upgrade to Starter →
                </a>
              </div>
            )}

            {/* Animated toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Preview
              </span>
              {isPaid ? (
                <button
                  onClick={() => setAnimated(a => !a)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={
                    animated
                      ? { background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.35)' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  {animated ? '✨ Animated ON' : '✨ Animate'}
                </button>
              ) : (
                <a href="/#pricing" className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  🔒 Animate — Starter
                </a>
              )}
            </div>

            {/* Poster canvas */}
            <div
              ref={flyerRef}
              className={`rounded-3xl overflow-hidden mb-6 relative${animated ? ' poster-animated' : ''}`}
              style={{
                background: tpl.bg,
                border: tpl.border,
                maxWidth: '440px',
                margin: '0 auto 24px',
                boxShadow: animated
                  ? `0 8px 80px ${tpl.accent}66, 0 0 40px ${tpl.accent}33`
                  : `0 8px 60px ${tpl.accent}44, 0 0 0 1px ${tpl.accent}11`,
                transition: 'box-shadow 0.6s ease',
              }}
            >
              {/* Pattern overlay */}
              {tpl.pattern !== 'none' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ backgroundImage: svgPattern(tpl.pattern, tpl.patternColor), zIndex: 0 }}
                />
              )}

              {/* Header band */}
              <div
                className="relative flex items-center justify-center py-8 px-6 overflow-hidden"
                style={{ background: tpl.headerBg, zIndex: 1 }}
              >
                {/* Large decorative circle top-right */}
                <div
                  className="absolute top-0 right-0 w-36 h-36 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)', transform: 'translate(35%, -35%)' }}
                />
                {/* Small circle bottom-left */}
                <div
                  className="absolute bottom-0 left-0 w-24 h-24 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.12)', transform: 'translate(-35%, 35%)' }}
                />
                {/* Inner ring decorations */}
                <div
                  className="absolute top-3 left-3 w-12 h-12 rounded-full border"
                  style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                />
                <div
                  className="absolute bottom-3 right-3 w-8 h-8 rounded-full border"
                  style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                />
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-xl"
                    style={{
                      background: 'rgba(255,255,255,0.28)',
                      color: '#fff',
                      border: '2px solid rgba(255,255,255,0.5)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {initials}
                  </div>
                  <div className="text-center">
                    <div
                      className="text-white font-black leading-tight tracking-wide"
                      style={{ fontSize: 'clamp(14px, 4vw, 18px)', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
                    >
                      {business.businessName}
                    </div>
                    <div
                      className="font-semibold mt-1"
                      style={{ color: 'rgba(255,255,255,0.82)', fontSize: '11px', letterSpacing: '0.08em' }}
                    >
                      {business.businessType.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="relative px-7 py-7 text-center" style={{ zIndex: 1 }}>
                {/* Offer badge — dynamic or default */}
                <div
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black mb-5 tracking-wider"
                  style={{
                    background: tpl.accentMuted,
                    color: tpl.pillColor,
                    border: `1px solid ${tpl.accent}55`,
                    letterSpacing: '0.12em',
                  }}
                >
                  {business.offerEnabled && business.offerBadge
                    ? `✦ ${business.offerBadge.toUpperCase()} ✦`
                    : '✦ SPECIAL OFFER ✦'}
                </div>

                {/* AI headline */}
                <div
                  className="font-black leading-tight mb-2"
                  style={{
                    color: '#FFFFFF',
                    fontSize: 'clamp(17px, 5vw, 22px)',
                    textShadow: `0 0 30px ${tpl.accent}55`,
                  }}
                >
                  {data.flyerTagline || 'Quality Products at Best Prices!'}
                </div>

                {/* Gradient divider */}
                <div
                  className="my-5 h-px"
                  style={{ background: `linear-gradient(90deg, transparent 0%, ${tpl.accent}99 50%, transparent 100%)` }}
                />

                {/* AI highlight */}
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: tpl.textSecondary }}
                >
                  {data.flyerHighlight || 'Visit us today for exclusive deals on all products.'}
                </p>

                {/* Price list — shown when offer has items */}
                {business.offerEnabled && business.offerItems && business.offerItems.some(it => it.name) && (
                  <div
                    className="rounded-xl px-4 py-3 mb-5 text-left"
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${tpl.accent}33` }}
                  >
                    {business.offerOccasion && (
                      <div
                        className="text-center text-xs font-bold mb-2 tracking-wider"
                        style={{ color: tpl.pillColor }}
                      >
                        {business.offerOccasion.toUpperCase()} SPECIAL
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {business.offerItems.filter(it => it.name).map((it, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white/80">{it.name}</span>
                          <div className="flex items-center gap-1.5">
                            {it.original && (
                              <span className="text-xs line-through" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                ₹{it.original}
                              </span>
                            )}
                            {it.price && (
                              <span className="text-xs font-black" style={{ color: tpl.pillColor }}>
                                ₹{it.price}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {business.offerValidTill && (
                      <div
                        className="text-center text-xs mt-2 pt-2"
                        style={{ color: 'rgba(255,255,255,0.35)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        Valid till {business.offerValidTill}
                      </div>
                    )}
                  </div>
                )}

                {/* Contact strip */}
                <div
                  className="rounded-2xl px-5 py-4 space-y-2.5"
                  style={{
                    background: tpl.accentMuted,
                    border: `1px solid ${tpl.accent}33`,
                  }}
                >
                  {business.location && (
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: '#fff' }}>
                      <span>📍</span>
                      <span>{business.location}</span>
                    </div>
                  )}
                  {business.whatsapp && (
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: '#fff' }}>
                      <span>📲</span>
                      <span>{business.whatsapp}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer bar */}
              <div
                className="relative px-6 py-3 flex items-center justify-center gap-2"
                style={{
                  background: tpl.footerBg,
                  borderTop: `1px solid ${tpl.accent}22`,
                  zIndex: 1,
                }}
              >
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: tpl.accent, opacity: 0.8 }}
                >
                  ⚡ Generated by PromoKit AI
                </span>
              </div>
            </div>

            {/* Download buttons */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-3">
                <button
                  onClick={downloadFlyer}
                  disabled={downloading}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                >
                  {downloading ? (
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3"/>
                      <path d="M12 3a9 9 0 019 9" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {downloading ? 'Preparing…' : 'PNG (3×)'}
                </button>

                {isPaid ? (
                  <button
                    onClick={downloadPdf}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    PDF
                  </button>
                ) : (
                  <a href="/#pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    🔒 PDF — Starter
                  </a>
                )}
              </div>

              {!isPaid && (
                <div className="text-center px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,107,26,0.06)', border: '1px solid rgba(255,107,26,0.15)' }}>
                  <p className="text-xs font-medium" style={{ color: 'rgba(255,107,26,0.8)' }}>
                    🔒 Free plan · <a href="/#pricing" className="font-bold underline">Upgrade to Starter</a> for PDF, QR code, all templates, all languages &amp; unlimited generations
                  </p>
                </div>
              )}

              {isPaid && (
                <p className="text-xs text-white/25">WhatsApp QR included · Print-ready PDF · Share directly</p>
              )}
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
      {reminderContent && <ReminderModal content={reminderContent} onClose={() => setReminderContent(null)} />}
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
