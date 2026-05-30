'use client';

import { useState } from 'react';

interface Props {
  captions: { whatsapp: string[]; instagram: string[]; facebook: string[] };
  business: { businessName: string; businessType: string; language: string };
  plan: string;
}

type Platform = 'whatsapp' | 'instagram' | 'facebook';
type Tone = 'Urgent' | 'Emotional' | 'Funny' | 'Professional' | 'Story';

const TONES: { key: Tone; label: string; description: string }[] = [
  { key: 'Urgent', label: '🔥 Urgent', description: 'FOMO, time pressure, scarcity' },
  { key: 'Emotional', label: '💛 Emotional', description: 'Connection, trust, story' },
  { key: 'Funny', label: '😂 Funny', description: 'Witty, relatable, shareable' },
  { key: 'Professional', label: '💼 Professional', description: 'Authority, expertise, trust' },
  { key: 'Story', label: '📖 Story', description: 'Narrative arc, before/after' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
      style={copied
        ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function CaptionOptimizer({ captions, business, plan }: Props) {
  const [platform, setPlatform] = useState<Platform>('whatsapp');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [tone, setTone] = useState<Tone>('Urgent');
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [error, setError] = useState('');

  const isPaid = plan === 'starter' || plan === 'growth';
  const sourceList = captions[platform] || [];
  const selected = sourceList[selectedIdx] || '';

  async function optimize() {
    if (!selected || loading) return;
    setLoading(true);
    setError('');
    setVariants([]);
    try {
      const res = await fetch('/api/optimize-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: selected, platform, tone, language: business.language, businessName: business.businessName, businessType: business.businessType }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setVariants(json.variants || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to optimize. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isPaid) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,107,26,0.05)', border: '1px solid rgba(255,107,26,0.18)' }}>
        <div className="text-5xl mb-3">🧠</div>
        <h3 className="text-xl font-black text-white mb-2">Caption Optimizer</h3>
        <p className="text-white/50 mb-5">A/B test your captions — AI rewrites them in 5 different tones to maximize engagement.</p>
        <a href="/#pricing" className="btn-primary inline-block px-6 py-3 rounded-xl font-bold">Upgrade to Starter →</a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Platform selector */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Select Platform</p>
        <div className="flex gap-2">
          {(['whatsapp', 'instagram', 'facebook'] as Platform[]).map(p => (
            <button key={p} onClick={() => { setPlatform(p); setSelectedIdx(0); setVariants([]); }}
              className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all"
              style={platform === p
                ? { background: 'rgba(255,107,26,0.18)', color: '#FF6B1A', border: '1.5px solid rgba(255,107,26,0.4)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
              {p === 'whatsapp' ? '💬' : p === 'instagram' ? '📸' : '👥'} {p}
            </button>
          ))}
        </div>
      </div>

      {/* Original caption selector */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Original Caption to Optimize</p>
        <div className="space-y-2">
          {sourceList.map((cap, i) => (
            <button
              key={i}
              onClick={() => { setSelectedIdx(i); setVariants([]); }}
              className="w-full text-left rounded-xl p-3.5 transition-all"
              style={selectedIdx === i
                ? { background: 'rgba(255,107,26,0.1)', border: '1.5px solid rgba(255,107,26,0.4)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5"
                  style={{ background: selectedIdx === i ? 'rgba(255,107,26,0.3)' : 'rgba(255,255,255,0.08)', color: selectedIdx === i ? '#FF6B1A' : 'rgba(255,255,255,0.4)' }}>
                  {i + 1}
                </div>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.65)' }}>{cap}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tone selector */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Optimization Tone</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TONES.map(t => (
            <button key={t.key} onClick={() => setTone(t.key)}
              className="rounded-xl p-2.5 text-left transition-all"
              style={tone === t.key
                ? { background: 'rgba(255,107,26,0.15)', border: '1.5px solid rgba(255,107,26,0.4)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.07)' }}>
              <div className="text-sm mb-0.5">{t.label}</div>
              <div className="text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.38)' }}>{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Optimize button */}
      <button
        onClick={optimize}
        disabled={loading || !selected}
        className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
        style={loading
          ? { background: 'rgba(255,107,26,0.1)', color: '#FF6B1A', border: '1.5px solid rgba(255,107,26,0.3)', cursor: 'wait' }
          : { background: 'linear-gradient(135deg, #FF6B1A, #FF9500)', color: '#fff', boxShadow: '0 4px 20px rgba(255,107,26,0.3)' }}
      >
        {loading
          ? <><svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-18 0" strokeOpacity="0.3" strokeLinecap="round"/><path d="M12 3a9 9 0 019 9" strokeLinecap="round"/></svg>Optimizing with AI…</>
          : <>🧠 Generate 3 Optimized Variants</>}
      </button>

      {error && <p className="text-sm text-center" style={{ color: '#F87171' }}>{error}</p>}

      {/* Variants */}
      {variants.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
            3 {tone} Variants
          </p>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(255,107,26,0.12)', color: '#FF6B1A' }}>
                    Variant {i + 1}
                  </span>
                  <CopyButton text={v} />
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.78)' }}>{v}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            A/B test these on your audience and see which gets more responses
          </p>
        </div>
      )}
    </div>
  );
}
