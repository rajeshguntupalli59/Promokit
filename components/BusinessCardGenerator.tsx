'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  business: {
    businessName: string;
    businessType: string;
    location?: string;
    whatsapp?: string;
    logoUrl?: string;
  };
  plan: string;
}

type CardStyle = 'classic' | 'modern' | 'neon' | 'minimal';

const CARD_STYLES: Record<CardStyle, {
  label: string; emoji: string;
  bg: string; accent: string; text: string; sub: string;
}> = {
  classic: { label: 'Classic Gold', emoji: '🟡', bg: '#0A0500', accent: '#FFD700', text: '#FFFFFF', sub: 'rgba(255,215,0,0.6)' },
  modern: { label: 'Modern Blue', emoji: '💙', bg: '#020614', accent: '#3B82F6', text: '#FFFFFF', sub: 'rgba(96,165,250,0.65)' },
  neon: { label: 'Neon Glow', emoji: '⚡', bg: '#000510', accent: '#00FFCC', text: '#FFFFFF', sub: 'rgba(0,255,204,0.55)' },
  minimal: { label: 'Clean White', emoji: '⬜', bg: '#FFFFFF', accent: '#111111', text: '#111111', sub: 'rgba(0,0,0,0.45)' },
};

export default function BusinessCardGenerator({ business, plan }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cardStyle, setCardStyle] = useState<CardStyle>('classic');
  const [downloading, setDownloading] = useState(false);

  const isPaid = plan === 'starter' || plan === 'growth';

  const W = 1050, H = 600;
  const scale = 0.55;

  function drawCard(ctx: CanvasRenderingContext2D, s: CardStyle) {
    const { bg, accent, text, sub } = CARD_STYLES[s];
    ctx.clearRect(0, 0, W, H);

    // Background
    if (s === 'modern') {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#020614'); grad.addColorStop(1, '#0D1535');
      ctx.fillStyle = grad;
    } else if (s === 'classic') {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#0A0500'); grad.addColorStop(1, '#1A0E00');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bg;
    }
    ctx.fillRect(0, 0, W, H);

    // Decorative left stripe
    if (s !== 'minimal') {
      const stripeGrd = ctx.createLinearGradient(0, 0, 0, H);
      stripeGrd.addColorStop(0, accent); stripeGrd.addColorStop(1, accent + '44');
      ctx.fillStyle = stripeGrd;
      ctx.fillRect(0, 0, W * 0.012, H);
    }

    // Top right accent circle
    if (s !== 'minimal') {
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.arc(W * 0.85, H * 0.2, H * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Initials circle / logo box
    const initials = business.businessName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const cx = W * 0.12, cy = H * 0.42, r = H * 0.22;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = s === 'minimal' ? accent : accent + '22';
    ctx.fill();
    if (s !== 'minimal') {
      ctx.strokeStyle = accent; ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.font = `900 ${r * 0.85}px sans-serif`;
    ctx.fillStyle = s === 'minimal' ? '#FFF' : accent;
    ctx.textAlign = 'center';
    ctx.fillText(initials, cx, cy + r * 0.28);

    // Business name
    ctx.font = `900 ${H * 0.12}px sans-serif`;
    ctx.fillStyle = text;
    ctx.textAlign = 'left';
    ctx.shadowColor = s !== 'minimal' ? accent : 'transparent';
    ctx.shadowBlur = s !== 'minimal' ? 12 : 0;
    ctx.fillText(business.businessName, W * 0.25, H * 0.38);
    ctx.shadowBlur = 0;

    // Business type
    ctx.font = `500 ${H * 0.065}px sans-serif`;
    ctx.fillStyle = sub;
    ctx.fillText(business.businessType, W * 0.25, H * 0.52);

    // Divider
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = accent; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.25, H * 0.58); ctx.lineTo(W * 0.78, H * 0.58);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Contact info
    ctx.font = `${H * 0.055}px sans-serif`;
    ctx.fillStyle = s === 'minimal' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)';
    const contacts = [
      business.whatsapp && `📲 ${business.whatsapp}`,
      business.location && `📍 ${business.location}`,
    ].filter(Boolean) as string[];
    contacts.forEach((c, i) => ctx.fillText(c, W * 0.25, H * 0.68 + i * H * 0.1));

    // PromoKit watermark
    ctx.globalAlpha = 0.22;
    ctx.font = `${H * 0.042}px sans-serif`;
    ctx.fillStyle = accent;
    ctx.textAlign = 'right';
    ctx.fillText('⚡ PromoKit AI', W * 0.94, H * 0.94);
    ctx.globalAlpha = 1;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (ctx) drawCard(ctx, cardStyle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardStyle, business.businessName]);

  async function download() {
    const canvas = canvasRef.current;
    if (!canvas || downloading) return;
    setDownloading(true);
    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url; a.download = `${business.businessName}-business-card.png`; a.click();
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Card Style</p>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {(Object.entries(CARD_STYLES) as [CardStyle, typeof CARD_STYLES[CardStyle]][]).map(([key, s]) => (
          <button
            key={key}
            onClick={() => setCardStyle(key)}
            className="rounded-xl py-2.5 px-2 text-xs font-bold transition-all text-center"
            style={cardStyle === key
              ? { background: `${s.accent}22`, color: s.accent, border: `1.5px solid ${s.accent}88` }
              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.08)' }}
          >
            <div className="text-lg mb-0.5">{s.emoji}</div>
            {s.label}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="flex justify-center mb-5">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            width: W * scale, height: H * scale,
            boxShadow: `0 8px 40px ${CARD_STYLES[cardStyle].accent}44`,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: W * scale, height: H * scale, display: 'block' }}
          />
        </div>
      </div>

      {/* Download */}
      {isPaid ? (
        <div className="flex justify-center">
          <button
            onClick={download}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #FF6B1A, #FF9500)', color: '#fff', boxShadow: '0 4px 20px rgba(255,107,26,0.3)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {downloading ? 'Saving…' : 'Download PNG Business Card'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <a href="/#pricing" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm" style={{ background: 'rgba(255,107,26,0.1)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.25)' }}>
            🔒 Download — Upgrade to Starter
          </a>
        </div>
      )}

      <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
        High-res PNG · Share on WhatsApp, Instagram, print · 1050×600px
      </p>
    </div>
  );
}
