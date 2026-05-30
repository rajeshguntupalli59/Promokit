'use client';

import { useState, useRef, useEffect } from 'react';

type VideoStyle = 'cinematic' | 'festival' | 'slide' | 'story' | 'neon' | 'particle' | 'glamour' | 'impact';
type AspectRatio = '9:16' | '1:1' | '16:9';
type Duration = 10 | 15 | 30;

interface VideoCreatorProps {
  business: {
    businessName: string;
    businessType: string;
    location?: string;
    whatsapp?: string;
    offerEnabled?: boolean;
    offerBadge?: string;
    offerOccasion?: string;
    offerValidTill?: string;
    offerItems?: { name: string; price: string; original: string }[];
    logoUrl?: string;
  };
  content: {
    flyerTagline: string;
    flyerHighlight: string;
    whatsapp: string[];
  };
  plan: string;
}

const VIDEO_STYLES: Record<VideoStyle, {
  label: string;
  emoji: string;
  description: string;
  minPlan: 'starter' | 'growth';
  colors: { bg1: string; bg2: string; accent: string; accent2: string; particle: string[] };
}> = {
  cinematic: {
    label: 'Cinematic Gold', emoji: '🎬',
    description: 'Dark luxury with golden typography',
    minPlan: 'starter',
    colors: { bg1: '#0A0500', bg2: '#1A0E00', accent: '#FFD700', accent2: '#FF9500', particle: ['#FFD700', '#FFA500', '#FF6B1A'] },
  },
  festival: {
    label: 'Festival Burst', emoji: '🎊',
    description: 'Vibrant confetti with celebration energy',
    minPlan: 'starter',
    colors: { bg1: '#1A0800', bg2: '#2D1500', accent: '#FF6B1A', accent2: '#FFD700', particle: ['#FFD700', '#FF6B1A', '#FF4444', '#00FF88', '#FF88FF'] },
  },
  slide: {
    label: 'Smooth Slide', emoji: '✨',
    description: 'Clean corporate with progress bar',
    minPlan: 'starter',
    colors: { bg1: '#020614', bg2: '#0D1535', accent: '#3B82F6', accent2: '#60A5FA', particle: ['#3B82F6', '#60A5FA'] },
  },
  story: {
    label: 'Story Mode', emoji: '📱',
    description: 'Vertical story format with orbs',
    minPlan: 'starter',
    colors: { bg1: '#0A0414', bg2: '#14063A', accent: '#8B5CF6', accent2: '#C4B5FD', particle: ['#8B5CF6', '#A78BFA'] },
  },
  neon: {
    label: 'Neon Glow', emoji: '⚡',
    description: 'Cyberpunk electric with glitch FX',
    minPlan: 'growth',
    colors: { bg1: '#000510', bg2: '#000A20', accent: '#00FFCC', accent2: '#FF00FF', particle: ['#00FFCC', '#FF00FF', '#FFFF00'] },
  },
  particle: {
    label: 'Particle Wave', emoji: '🌊',
    description: 'Ocean particles flowing in waves',
    minPlan: 'growth',
    colors: { bg1: '#000C18', bg2: '#001428', accent: '#06B6D4', accent2: '#0EA5E9', particle: ['#06B6D4', '#38BDF8', '#7DD3FC', '#BAE6FD'] },
  },
  glamour: {
    label: 'Rose Glamour', emoji: '💅',
    description: 'Rose gold for beauty & fashion brands',
    minPlan: 'growth',
    colors: { bg1: '#120008', bg2: '#1E0010', accent: '#F472B6', accent2: '#FBB6CE', particle: ['#F472B6', '#FB7185', '#FCD34D', '#A78BFA'] },
  },
  impact: {
    label: 'Bold Impact', emoji: '💥',
    description: 'High-contrast kinetic typography',
    minPlan: 'growth',
    colors: { bg1: '#000000', bg2: '#0A0A0A', accent: '#FF3333', accent2: '#FF6600', particle: ['#FF3333', '#FF6600', '#FFCC00'] },
  },
};

// ─────────────────────────────────────────────
// Particle class
// ─────────────────────────────────────────────
class Particle {
  x: number; y: number; vx: number; vy: number;
  color: string; size: number; life: number; maxLife: number;
  rotation: number; rotationSpeed: number; shape: 'rect' | 'circle' | 'star';

  constructor(w: number, h: number, colors: string[], fromBottom = false) {
    this.x = Math.random() * w;
    this.y = fromBottom ? h + 20 : -20;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = fromBottom ? -(Math.random() * 3 + 1) : (Math.random() * 3 + 1);
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.size = Math.random() * 10 + 3;
    this.life = 0;
    this.maxLife = Math.random() * 180 + 60;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.15;
    this.shape = ['rect', 'circle', 'star'][Math.floor(Math.random() * 3)] as 'rect' | 'circle' | 'star';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.07;
    this.vx *= 0.99;
    this.rotation += this.rotationSpeed;
    this.life++;
    return this.life < this.maxLife;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, 1 - this.life / this.maxLife);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? this.size / 2 : this.size / 4;
        i === 0 ? ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r) : ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    }
    ctx.restore();
  }
}

// ─────────────────────────────────────────────
// Utility functions
// ─────────────────────────────────────────────
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t: number) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function clamp01(t: number) { return Math.max(0, Math.min(1, t)); }
function fadeIn(t: number, start: number, dur = 0.15) { return easeOut(clamp01((t - start) / dur)); }
function fadeOut(t: number, end: number, dur = 0.12) { return clamp01((end - t) / dur); }
function alpha(t: number, inStart: number, outEnd: number) { return Math.min(fadeIn(t, inStart), fadeOut(t, outEnd)); }

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = word; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// ─────────────────────────────────────────────
// Drawing engines
// ─────────────────────────────────────────────
type DrawCtx = {
  ctx: CanvasRenderingContext2D;
  t: number; w: number; h: number;
  colors: typeof VIDEO_STYLES['cinematic']['colors'];
  business: VideoCreatorProps['business'];
  content: VideoCreatorProps['content'];
  particles: Particle[];
};

function drawCinematic({ ctx, t, w, h, colors, business, content }: DrawCtx) {
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, colors.bg1);
  bgGrad.addColorStop(1, colors.bg2);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Radial vignette
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Golden horizontal lines
  const lineA = alpha(t, 0.05, 0.95);
  ctx.globalAlpha = lineA * 0.55;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.32); ctx.lineTo(w * 0.92, h * 0.32); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.68); ctx.lineTo(w * 0.92, h * 0.68); ctx.stroke();
  ctx.globalAlpha = 1;

  // Business type label
  ctx.globalAlpha = alpha(t, 0.1, 0.9);
  ctx.font = `600 ${w * 0.022}px sans-serif`;
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText(business.businessType.toUpperCase(), w / 2, h * 0.38);
  ctx.globalAlpha = 1;

  // Business name — typewriter
  if (t > 0.15) {
    const np = clamp01((t - 0.15) / 0.3);
    const name = business.businessName.slice(0, Math.floor(business.businessName.length * easeOut(np)));
    ctx.globalAlpha = alpha(t, 0.15, 0.9);
    ctx.font = `900 ${w * 0.074}px sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 20;
    ctx.fillText(name, w / 2, h * 0.5);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Tagline slide up
  if (t > 0.45) {
    const tp = clamp01((t - 0.45) / 0.2);
    const y = h * 0.6 - (1 - easeOut(tp)) * h * 0.06;
    ctx.globalAlpha = alpha(t, 0.45, 0.9);
    ctx.font = `${w * 0.028}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.textAlign = 'center';
    wrapText(ctx, content.flyerTagline || '', w * 0.72).forEach((l, i) => ctx.fillText(l, w / 2, y + i * w * 0.036));
    ctx.globalAlpha = 1;
  }

  // Offer badge
  if (business.offerEnabled && business.offerBadge && t > 0.62) {
    const bp = clamp01((t - 0.62) / 0.15);
    ctx.globalAlpha = alpha(t, 0.62, 0.9);
    const bw = w * 0.56, bh = h * 0.052;
    roundRect(ctx, w / 2 - bw / 2, h * 0.7 - bh / 2, bw, bh, bh / 2);
    ctx.fillStyle = colors.accent + '28'; ctx.fill();
    ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = `bold ${w * 0.024}px sans-serif`;
    ctx.fillStyle = colors.accent;
    ctx.textAlign = 'center';
    ctx.fillText(`✦ ${business.offerBadge.toUpperCase()} ✦`, w / 2, h * 0.7 + w * 0.007);
    ctx.globalAlpha = 1;
    void bp;
  }

  // Contact
  if (t > 0.74) {
    ctx.globalAlpha = alpha(t, 0.74, 0.92);
    ctx.font = `${w * 0.024}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    const contact = [business.location, business.whatsapp].filter(Boolean).join(' · ');
    if (contact) ctx.fillText(contact, w / 2, h * 0.88);
    ctx.globalAlpha = 1;
  }

  ctx.globalAlpha = 0.28;
  ctx.font = `${w * 0.017}px sans-serif`;
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText('⚡ PromoKit AI', w / 2, h * 0.96);
  ctx.globalAlpha = 1;
}

function drawFestival({ ctx, t, w, h, colors, business, content, particles }: DrawCtx) {
  const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * 0.8);
  bg.addColorStop(0, '#2D1500');
  bg.addColorStop(1, '#0A0200');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Spawn and draw particles
  if (t < 0.88) {
    while (particles.length < 90) particles.push(new Particle(w, h, colors.particle));
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].update()) { particles.splice(i, 1); continue; }
    particles[i].draw(ctx);
  }

  // Pulsing mandala circles
  const pulse = 0.1 + Math.sin(t * Math.PI * 4) * 0.04;
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.5;
  [0.44, 0.32, 0.2].forEach(r => {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * r + Math.sin(t * Math.PI * 3) * w * 0.012, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // Occasion
  if (business.offerOccasion && t > 0.05) {
    ctx.globalAlpha = alpha(t, 0.05, 0.9);
    ctx.font = `bold ${w * 0.03}px sans-serif`;
    ctx.fillStyle = colors.accent;
    ctx.textAlign = 'center';
    ctx.fillText(business.offerOccasion.toUpperCase() + ' SPECIAL', w / 2, h * 0.24);
    ctx.globalAlpha = 1;
  }

  // Business name with glow
  if (t > 0.12) {
    ctx.globalAlpha = alpha(t, 0.12, 0.9);
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 28;
    ctx.font = `900 ${w * 0.082}px sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(business.businessName, w / 2, h * 0.48);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Offer text
  if (t > 0.34) {
    const tp = clamp01((t - 0.34) / 0.2);
    const y = h * 0.6 - (1 - easeOut(tp)) * h * 0.04;
    ctx.globalAlpha = alpha(t, 0.34, 0.88);
    ctx.font = `bold ${w * 0.03}px sans-serif`;
    ctx.fillStyle = colors.accent;
    ctx.textAlign = 'center';
    ctx.fillText(business.offerBadge || content.flyerTagline || '', w / 2, y);
    ctx.globalAlpha = 1;
  }

  // Price list
  const items = (business.offerItems || []).filter(i => i.name).slice(0, 4);
  if (items.length && t > 0.5) {
    ctx.globalAlpha = alpha(t, 0.5, 0.88);
    items.forEach((item, idx) => {
      const y = h * 0.67 + idx * h * 0.058;
      ctx.font = `${w * 0.024}px sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.textAlign = 'left';
      ctx.fillText(`• ${item.name}`, w * 0.18, y);
      if (item.price) {
        ctx.fillStyle = colors.accent;
        ctx.textAlign = 'right';
        ctx.fillText(`₹${item.price}`, w * 0.82, y);
      }
    });
    ctx.globalAlpha = 1;
  }

  // WhatsApp
  if (t > 0.7 && business.whatsapp) {
    ctx.globalAlpha = alpha(t, 0.7, 0.92);
    ctx.font = `${w * 0.022}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText(`📲 ${business.whatsapp}`, w / 2, h * 0.92);
    ctx.globalAlpha = 1;
  }

  ctx.globalAlpha = 0.3;
  ctx.font = `${w * 0.016}px sans-serif`;
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText('⚡ PromoKit AI', w / 2, h * 0.97);
  ctx.globalAlpha = 1;
}

function drawSlide({ ctx, t, w, h, colors, business, content }: DrawCtx) {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, colors.bg1); bg.addColorStop(1, colors.bg2);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  // Dot grid
  ctx.globalAlpha = 0.055;
  ctx.fillStyle = colors.accent;
  const gs = w * 0.055;
  for (let x = gs / 2; x < w; x += gs)
    for (let y = gs / 2; y < h; y += gs) {
      ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill();
    }
  ctx.globalAlpha = 1;

  // Header band slides from top
  if (t > 0.06) {
    const hp = clamp01((t - 0.06) / 0.22);
    const hh = h * 0.14;
    const headerY = -hh + easeOut(hp) * hh;
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, colors.accent); grad.addColorStop(1, colors.accent + '88');
    ctx.fillStyle = grad;
    ctx.fillRect(0, headerY, w, hh);
    ctx.globalAlpha = easeOut(hp);
    ctx.font = `bold ${w * 0.026}px sans-serif`;
    ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
    ctx.fillText(business.businessType.toUpperCase(), w / 2, headerY + hh * 0.64);
    ctx.globalAlpha = 1;
  }

  // Main name slides from right
  if (t > 0.22) {
    const cp = clamp01((t - 0.22) / 0.28);
    ctx.save();
    ctx.translate((1 - easeOut(cp)) * w * 0.28, 0);
    ctx.globalAlpha = alpha(t, 0.22, 0.88);
    ctx.font = `900 ${w * 0.076}px sans-serif`;
    ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
    wrapText(ctx, business.businessName, w * 0.82).forEach((l, i) => ctx.fillText(l, w / 2, h * 0.38 + i * w * 0.088));
    ctx.restore();
  }

  // Accent line expands
  if (t > 0.42) {
    const dp = clamp01((t - 0.42) / 0.16);
    ctx.globalAlpha = alpha(t, 0.42, 0.9);
    ctx.strokeStyle = colors.accent; ctx.lineWidth = 3;
    const lw = easeOut(dp) * w * 0.52;
    ctx.beginPath(); ctx.moveTo(w / 2 - lw / 2, h * 0.55); ctx.lineTo(w / 2 + lw / 2, h * 0.55); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Tagline
  if (t > 0.52) {
    ctx.globalAlpha = alpha(t, 0.52, 0.9);
    ctx.font = `${w * 0.028}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.68)'; ctx.textAlign = 'center';
    wrapText(ctx, content.flyerTagline || '', w * 0.72).forEach((l, i) => ctx.fillText(l, w / 2, h * 0.62 + i * w * 0.036));
    ctx.globalAlpha = 1;
  }

  // Contact
  if (t > 0.72) {
    ctx.globalAlpha = alpha(t, 0.72, 0.9);
    ctx.font = `${w * 0.024}px sans-serif`;
    ctx.fillStyle = colors.accent; ctx.textAlign = 'center';
    if (business.whatsapp) ctx.fillText(`📲 ${business.whatsapp}`, w / 2, h * 0.82);
    if (business.location) { ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText(`📍 ${business.location}`, w / 2, h * 0.87); }
    ctx.globalAlpha = 1;
  }

  // Progress bar
  const bh = h * 0.008;
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(0, h - bh, w, bh);
  const pg = ctx.createLinearGradient(0, 0, w * t, 0);
  pg.addColorStop(0, colors.accent); pg.addColorStop(1, colors.accent + 'AA');
  ctx.fillStyle = pg; ctx.fillRect(0, h - bh, w * t, bh);

  ctx.globalAlpha = 0.28; ctx.font = `${w * 0.017}px sans-serif`;
  ctx.fillStyle = colors.accent; ctx.textAlign = 'center';
  ctx.fillText('⚡ PromoKit AI', w / 2, h * 0.96); ctx.globalAlpha = 1;
}

function drawStory({ ctx, t, w, h, colors, business, content }: DrawCtx) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#1A0830'); bg.addColorStop(0.5, '#0A0420'); bg.addColorStop(1, '#050010');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  // Animated gradient orbs
  const o1 = ctx.createRadialGradient(
    w * (0.28 + Math.sin(t * Math.PI * 2) * 0.14), h * (0.28 + Math.cos(t * Math.PI * 1.5) * 0.1),
    0, w / 2, h / 2, w * 0.55);
  o1.addColorStop(0, colors.accent + '30'); o1.addColorStop(1, 'transparent');
  ctx.fillStyle = o1; ctx.fillRect(0, 0, w, h);

  const o2 = ctx.createRadialGradient(
    w * (0.72 + Math.cos(t * Math.PI * 2) * 0.12), h * (0.72 + Math.sin(t * Math.PI * 1.7) * 0.1),
    0, w / 2, h / 2, w * 0.45);
  o2.addColorStop(0, colors.accent2 + '22'); o2.addColorStop(1, 'transparent');
  ctx.fillStyle = o2; ctx.fillRect(0, 0, w, h);

  // Business name scale-in
  if (t > 0.08) {
    const np = clamp01((t - 0.08) / 0.24);
    const s = 0.7 + easeOut(np) * 0.3;
    ctx.save();
    ctx.translate(w / 2, h * 0.3);
    ctx.scale(s, s);
    ctx.globalAlpha = alpha(t, 0.08, 0.88);
    ctx.font = `900 ${w * 0.088}px sans-serif`;
    ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
    ctx.shadowColor = colors.accent; ctx.shadowBlur = 22;
    wrapText(ctx, business.businessName, w * 0.82).forEach((l, i) => ctx.fillText(l, 0, i * w * 0.1));
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Business type pill
  if (t > 0.32) {
    ctx.globalAlpha = alpha(t, 0.32, 0.9);
    const pw = w * 0.58, ph = h * 0.044;
    const px = w / 2, py = h * 0.52;
    roundRect(ctx, px - pw / 2, py - ph / 2, pw, ph, ph / 2);
    ctx.fillStyle = colors.accent + '22'; ctx.fill();
    ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = `bold ${w * 0.025}px sans-serif`;
    ctx.fillStyle = colors.accent; ctx.textAlign = 'center';
    ctx.fillText(business.businessType.toUpperCase(), px, py + w * 0.007);
    ctx.globalAlpha = 1;
  }

  // Tagline
  if (t > 0.44) {
    const tp = clamp01((t - 0.44) / 0.2);
    const y = h * 0.63 - (1 - easeOut(tp)) * h * 0.04;
    ctx.globalAlpha = alpha(t, 0.44, 0.9);
    ctx.font = `${w * 0.028}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.textAlign = 'center';
    wrapText(ctx, content.flyerTagline || '', w * 0.78).forEach((l, i) => ctx.fillText(l, w / 2, y + i * w * 0.036));
    ctx.globalAlpha = 1;
  }

  // CTA pulse button
  if (t > 0.65) {
    const bp = clamp01((t - 0.65) / 0.16);
    const pulse = 1 + Math.sin(t * Math.PI * 7) * 0.018;
    ctx.save();
    ctx.translate(w / 2, h * 0.82);
    ctx.scale(pulse, pulse);
    ctx.globalAlpha = easeOut(bp);
    const bw = w * 0.62, bh2 = h * 0.056;
    const grd = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
    grd.addColorStop(0, colors.accent); grd.addColorStop(1, colors.accent2);
    ctx.fillStyle = grd;
    ctx.shadowColor = colors.accent; ctx.shadowBlur = 18;
    roundRect(ctx, -bw / 2, -bh2 / 2, bw, bh2, bh2 / 2);
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.font = `bold ${w * 0.027}px sans-serif`;
    ctx.fillStyle = '#000'; ctx.textAlign = 'center';
    ctx.fillText(business.whatsapp ? `📲 ${business.whatsapp}` : 'Contact Us Now', 0, w * 0.008);
    ctx.restore(); ctx.globalAlpha = 1;
  }

  ctx.globalAlpha = 0.28; ctx.font = `${w * 0.017}px sans-serif`;
  ctx.fillStyle = colors.accent; ctx.textAlign = 'center';
  ctx.fillText('⚡ PromoKit AI', w / 2, h * 0.97); ctx.globalAlpha = 1;
}

function drawNeon({ ctx, t, w, h, colors, business, content, particles }: DrawCtx) {
  ctx.fillStyle = '#000510'; ctx.fillRect(0, 0, w, h);

  // Scanlines
  ctx.globalAlpha = 0.035;
  for (let y = 0; y < h; y += 4) { ctx.fillStyle = colors.accent; ctx.fillRect(0, y, w, 1); }
  ctx.globalAlpha = 1;

  // Pulsing neon border
  const bp2 = 0.5 + Math.sin(t * Math.PI * 8) * 0.45;
  ctx.globalAlpha = bp2 * 0.45;
  ctx.strokeStyle = colors.accent; ctx.lineWidth = 4;
  ctx.shadowColor = colors.accent; ctx.shadowBlur = 22;
  ctx.strokeRect(w * 0.04, h * 0.04, w * 0.92, h * 0.92);
  ctx.shadowBlur = 0; ctx.globalAlpha = 1;

  // Glitch business name
  if (t > 0.1) {
    const np = clamp01((t - 0.1) / 0.22);
    const isGlitch = t > 0.28 && t < 0.31;
    const gx = isGlitch ? (Math.random() - 0.5) * w * 0.018 : 0;

    ctx.globalAlpha = alpha(t, 0.1, 0.9);
    ctx.save();
    ctx.globalAlpha *= 0.28;
    ctx.fillStyle = '#FF00FF'; ctx.font = `900 ${w * 0.076}px monospace`;
    ctx.textAlign = 'center'; ctx.fillText(business.businessName, w / 2 + 4 + gx, h * 0.42 - 2);
    ctx.fillStyle = '#00FFFF'; ctx.fillText(business.businessName, w / 2 - 4 + gx, h * 0.42 + 2);
    ctx.restore();

    ctx.globalAlpha = alpha(t, 0.1, 0.9) * easeOut(np);
    ctx.fillStyle = '#FFF'; ctx.font = `900 ${w * 0.076}px monospace`;
    ctx.textAlign = 'center';
    ctx.shadowColor = colors.accent; ctx.shadowBlur = 28;
    ctx.fillText(business.businessName, w / 2, h * 0.42);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }

  // Neon divider
  if (t > 0.33) {
    const dp = clamp01((t - 0.33) / 0.12);
    ctx.globalAlpha = alpha(t, 0.33, 0.9) * (0.65 + Math.sin(t * Math.PI * 10) * 0.35);
    ctx.strokeStyle = colors.accent; ctx.lineWidth = 2;
    ctx.shadowColor = colors.accent; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.moveTo(w * 0.18, h * 0.52); ctx.lineTo(w * 0.82, h * 0.52); ctx.stroke();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1; void dp;
  }

  // Typewriter tagline
  if (t > 0.42) {
    const tp = clamp01((t - 0.42) / 0.28);
    const shown = (content.flyerTagline || '').slice(0, Math.floor((content.flyerTagline || '').length * easeOut(tp)));
    ctx.globalAlpha = alpha(t, 0.42, 0.9);
    ctx.font = `${w * 0.027}px monospace`;
    ctx.fillStyle = colors.accent; ctx.textAlign = 'center';
    ctx.shadowColor = colors.accent; ctx.shadowBlur = 10;
    ctx.fillText(shown + (tp < 1 ? '▌' : ''), w / 2, h * 0.6);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }

  // Contact
  if (t > 0.69 && business.whatsapp) {
    ctx.globalAlpha = alpha(t, 0.69, 0.9);
    ctx.font = `bold ${w * 0.026}px monospace`;
    ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
    ctx.shadowColor = colors.accent2; ctx.shadowBlur = 16;
    ctx.fillText(`[ ${business.whatsapp} ]`, w / 2, h * 0.78);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }

  // Spark particles
  if (t < 0.9 && Math.random() < 0.4) particles.push(new Particle(w, h, colors.particle));
  for (let i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].update()) { particles.splice(i, 1); continue; }
    ctx.shadowColor = particles[i].color; ctx.shadowBlur = 6;
    particles[i].draw(ctx);
    ctx.shadowBlur = 0;
  }

  ctx.globalAlpha = 0.38; ctx.font = `${w * 0.017}px monospace`;
  ctx.fillStyle = colors.accent; ctx.shadowColor = colors.accent; ctx.shadowBlur = 8;
  ctx.textAlign = 'center'; ctx.fillText('⚡ PromoKit AI', w / 2, h * 0.97);
  ctx.shadowBlur = 0; ctx.globalAlpha = 1;
}

function drawParticleWave({ ctx, t, w, h, colors, business, content, particles }: DrawCtx) {
  // Deep ocean background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#000C18'); bg.addColorStop(1, '#001428');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  // Wave particle field
  const time = t * Math.PI * 6;
  if (t < 0.9) {
    for (let i = 0; i < 3; i++) particles.push(new Particle(w, h, colors.particle));
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    // Apply wave force
    p.vx += Math.sin(p.y / (h * 0.08) + time) * 0.08;
    if (!p.update()) { particles.splice(i, 1); continue; }
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    grd.addColorStop(0, p.color); grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife) * 0.6;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Wave lines
  ctx.globalAlpha = 0.18;
  for (let row = 0; row < 8; row++) {
    ctx.beginPath();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 4) {
      const y = h * (0.3 + row * 0.055) + Math.sin(x / (w * 0.06) + time + row * 0.5) * h * 0.02;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Central card with blur effect
  if (t > 0.15) {
    const cp = clamp01((t - 0.15) / 0.25);
    ctx.globalAlpha = alpha(t, 0.15, 0.9);
    const cw = w * 0.78, ch = h * 0.42;
    const cx = w / 2 - cw / 2, cy = h / 2 - ch / 2;
    ctx.fillStyle = 'rgba(0,20,40,0.72)';
    ctx.strokeStyle = colors.accent + '66'; ctx.lineWidth = 1.5;
    roundRect(ctx, cx, cy, cw, ch, w * 0.04);
    ctx.fill(); ctx.stroke();
    ctx.globalAlpha = alpha(t, 0.15, 0.9) * easeOut(cp);
    ctx.font = `900 ${w * 0.072}px sans-serif`;
    ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
    ctx.shadowColor = colors.accent; ctx.shadowBlur = 20;
    ctx.fillText(business.businessName, w / 2, h / 2 - h * 0.04);
    ctx.shadowBlur = 0;
    ctx.font = `${w * 0.026}px sans-serif`;
    ctx.fillStyle = colors.accent;
    ctx.fillText(business.businessType.toUpperCase(), w / 2, h / 2 + h * 0.04);
    ctx.globalAlpha = 1;
  }

  // Tagline
  if (t > 0.48) {
    ctx.globalAlpha = alpha(t, 0.48, 0.9);
    ctx.font = `${w * 0.026}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.textAlign = 'center';
    wrapText(ctx, content.flyerTagline || '', w * 0.7).forEach((l, i) => ctx.fillText(l, w / 2, h * 0.7 + i * w * 0.034));
    ctx.globalAlpha = 1;
  }

  // Contact
  if (t > 0.72) {
    ctx.globalAlpha = alpha(t, 0.72, 0.9);
    ctx.font = `${w * 0.022}px sans-serif`;
    ctx.fillStyle = colors.accent; ctx.textAlign = 'center';
    if (business.whatsapp) ctx.fillText(`📲 ${business.whatsapp}`, w / 2, h * 0.88);
    ctx.globalAlpha = 1;
  }

  ctx.globalAlpha = 0.28; ctx.font = `${w * 0.017}px sans-serif`;
  ctx.fillStyle = colors.accent; ctx.textAlign = 'center';
  ctx.fillText('⚡ PromoKit AI', w / 2, h * 0.96); ctx.globalAlpha = 1;
}

function drawGlamour({ ctx, t, w, h, colors, business, content, particles }: DrawCtx) {
  // Rose gold background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#180010'); bg.addColorStop(0.5, '#220014'); bg.addColorStop(1, '#0F000A');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  // Shimmer overlay
  const shimmerX = (t * 2 % 1) * w * 1.5 - w * 0.25;
  const shim = ctx.createLinearGradient(shimmerX - w * 0.15, 0, shimmerX + w * 0.15, h);
  shim.addColorStop(0, 'transparent');
  shim.addColorStop(0.5, 'rgba(255,200,200,0.04)');
  shim.addColorStop(1, 'transparent');
  ctx.fillStyle = shim; ctx.fillRect(0, 0, w, h);

  // Diagonal gold lines
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = colors.accent; ctx.lineWidth = 1;
  for (let i = -h; i < w + h; i += w * 0.05) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Glam sparkle particles from bottom up
  if (t < 0.9) {
    while (particles.length < 60) particles.push(new Particle(w, h, colors.particle, true));
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].update()) { particles.splice(i, 1); continue; }
    particles[i].draw(ctx);
  }

  // Rose circle decoration
  ctx.globalAlpha = 0.08 + Math.sin(t * Math.PI * 3) * 0.03;
  ctx.strokeStyle = colors.accent; ctx.lineWidth = 2;
  [0.35, 0.22].forEach(r => {
    ctx.beginPath(); ctx.arc(w / 2, h * 0.42, w * r, 0, Math.PI * 2); ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // Business name with glamour font feel
  if (t > 0.12) {
    ctx.globalAlpha = alpha(t, 0.12, 0.9);
    ctx.font = `900 ${w * 0.072}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'transparent';
    const nameGrad = ctx.createLinearGradient(w * 0.2, h * 0.42, w * 0.8, h * 0.45);
    nameGrad.addColorStop(0, '#F9A8D4');
    nameGrad.addColorStop(0.5, '#FBB6CE');
    nameGrad.addColorStop(1, colors.accent);
    ctx.fillStyle = nameGrad;
    ctx.shadowColor = colors.accent; ctx.shadowBlur = 24;
    ctx.fillText(business.businessName, w / 2, h * 0.45);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }

  // Elegant divider with diamonds
  if (t > 0.38) {
    ctx.globalAlpha = alpha(t, 0.38, 0.9);
    ctx.strokeStyle = colors.accent + '88'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w * 0.18, h * 0.52); ctx.lineTo(w * 0.38, h * 0.52); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.62, h * 0.52); ctx.lineTo(w * 0.82, h * 0.52); ctx.stroke();
    // Diamond
    ctx.save(); ctx.translate(w / 2, h * 0.52); ctx.rotate(Math.PI / 4);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(-w * 0.012, -w * 0.012, w * 0.024, w * 0.024);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Type label
  if (t > 0.28) {
    ctx.globalAlpha = alpha(t, 0.28, 0.9);
    ctx.font = `300 ${w * 0.022}px Georgia, serif`;
    ctx.fillStyle = 'rgba(255,200,220,0.6)'; ctx.textAlign = 'center';
    ctx.fillText(business.businessType, w / 2, h * 0.56);
    ctx.globalAlpha = 1;
  }

  // Tagline
  if (t > 0.5) {
    ctx.globalAlpha = alpha(t, 0.5, 0.9);
    ctx.font = `italic ${w * 0.028}px Georgia, serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.textAlign = 'center';
    wrapText(ctx, content.flyerTagline || '', w * 0.72).forEach((l, i) => ctx.fillText(l, w / 2, h * 0.62 + i * w * 0.036));
    ctx.globalAlpha = 1;
  }

  // CTA
  if (t > 0.7 && business.whatsapp) {
    ctx.globalAlpha = alpha(t, 0.7, 0.9);
    const bw = w * 0.55, bh3 = h * 0.048;
    const grd = ctx.createLinearGradient(w / 2 - bw / 2, 0, w / 2 + bw / 2, 0);
    grd.addColorStop(0, '#BE185D'); grd.addColorStop(1, colors.accent);
    ctx.fillStyle = grd;
    roundRect(ctx, w / 2 - bw / 2, h * 0.78 - bh3 / 2, bw, bh3, bh3 / 2);
    ctx.fill();
    ctx.font = `bold ${w * 0.024}px sans-serif`;
    ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
    ctx.fillText(`📲 ${business.whatsapp}`, w / 2, h * 0.78 + w * 0.007);
    ctx.globalAlpha = 1;
  }

  ctx.globalAlpha = 0.28; ctx.font = `italic ${w * 0.016}px Georgia, serif`;
  ctx.fillStyle = colors.accent; ctx.textAlign = 'center';
  ctx.fillText('⚡ PromoKit AI', w / 2, h * 0.96); ctx.globalAlpha = 1;
}

function drawImpact({ ctx, t, w, h, colors, business, content }: DrawCtx) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);

  // Accent stripe
  if (t > 0.05) {
    const sp = clamp01((t - 0.05) / 0.18);
    ctx.globalAlpha = easeOut(sp);
    const stripeH = h * 0.12;
    const stripeGrd = ctx.createLinearGradient(0, 0, w, 0);
    stripeGrd.addColorStop(0, colors.accent); stripeGrd.addColorStop(0.6, colors.accent2); stripeGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = stripeGrd;
    ctx.fillRect(0, h * 0.44, w, stripeH);
    ctx.globalAlpha = 1;
  }

  // Business type — small upper label
  if (t > 0.1) {
    ctx.globalAlpha = alpha(t, 0.1, 0.92);
    ctx.font = `bold ${w * 0.02}px sans-serif`;
    ctx.fillStyle = colors.accent; ctx.textAlign = 'left';
    ctx.fillText('▶  ' + business.businessType.toUpperCase(), w * 0.08, h * 0.4);
    ctx.globalAlpha = 1;
  }

  // Big bold name — slides from left
  if (t > 0.18) {
    const np = clamp01((t - 0.18) / 0.22);
    ctx.save();
    ctx.translate(-(1 - easeOut(np)) * w * 0.35, 0);
    ctx.globalAlpha = alpha(t, 0.18, 0.9);
    ctx.font = `900 ${w * 0.1}px Impact, sans-serif`;
    ctx.fillStyle = '#FFF'; ctx.textAlign = 'left';
    ctx.fillText(business.businessName.toUpperCase(), w * 0.08, h * 0.57);
    ctx.restore();
  }

  // High-contrast tagline — bold white on accent
  if (t > 0.42) {
    const tp = clamp01((t - 0.42) / 0.18);
    ctx.save();
    ctx.translate((1 - easeOut(tp)) * w * 0.25, 0);
    ctx.globalAlpha = alpha(t, 0.42, 0.9);
    ctx.font = `bold ${w * 0.032}px sans-serif`;
    ctx.fillStyle = colors.accent2; ctx.textAlign = 'left';
    wrapText(ctx, content.flyerTagline || '', w * 0.75).forEach((l, i) => ctx.fillText(l, w * 0.08, h * 0.67 + i * w * 0.038));
    ctx.restore();
  }

  // Offer badge — bold box
  if (business.offerBadge && business.offerEnabled && t > 0.58) {
    ctx.globalAlpha = alpha(t, 0.58, 0.9);
    const boxW = w * 0.55, boxH = h * 0.058;
    ctx.fillStyle = colors.accent;
    ctx.fillRect(w * 0.08, h * 0.78 - boxH / 2, boxW, boxH);
    ctx.font = `900 ${w * 0.028}px Impact, sans-serif`;
    ctx.fillStyle = '#000'; ctx.textAlign = 'center';
    ctx.fillText(business.offerBadge.toUpperCase(), w * 0.08 + boxW / 2, h * 0.78 + w * 0.008);
    ctx.globalAlpha = 1;
  }

  // WhatsApp
  if (t > 0.72 && business.whatsapp) {
    ctx.globalAlpha = alpha(t, 0.72, 0.9);
    ctx.font = `bold ${w * 0.026}px sans-serif`;
    ctx.fillStyle = '#25D366'; ctx.textAlign = 'left';
    ctx.fillText(`📲 ${business.whatsapp}`, w * 0.08, h * 0.9);
    ctx.globalAlpha = 1;
  }

  // Vertical accent bar
  if (t > 0.08) {
    ctx.globalAlpha = alpha(t, 0.08, 0.92) * 0.7;
    ctx.fillStyle = colors.accent;
    ctx.fillRect(w * 0.04, h * 0.35, w * 0.012, h * 0.5);
    ctx.globalAlpha = 1;
  }

  ctx.globalAlpha = 0.25; ctx.font = `${w * 0.017}px sans-serif`;
  ctx.fillStyle = colors.accent; ctx.textAlign = 'right';
  ctx.fillText('⚡ PromoKit AI', w * 0.94, h * 0.97); ctx.globalAlpha = 1;
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function VideoCreator({ business, content, plan }: VideoCreatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const styleRef = useRef<VideoStyle>('cinematic');
  const durationRef = useRef<number>(15);

  const [style, setStyle] = useState<VideoStyle>('cinematic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [duration, setDuration] = useState<Duration>(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exported, setExported] = useState(false);

  useEffect(() => { styleRef.current = style; }, [style]);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  const isPaid = plan === 'starter' || plan === 'growth';
  const isGrowth = plan === 'growth';

  const SIZES: Record<AspectRatio, { w: number; h: number }> = {
    '9:16': { w: 720, h: 1280 },
    '1:1': { w: 1080, h: 1080 },
    '16:9': { w: 1920, h: 1080 },
  };

  const canvasSize = SIZES[aspectRatio];
  const previewScale = aspectRatio === '16:9' ? 0.33 : aspectRatio === '1:1' ? 0.36 : 0.28;

  function drawFrame(ctx: CanvasRenderingContext2D, t: number, s: VideoStyle) {
    const { w, h } = canvasSize;
    const colors = VIDEO_STYLES[s].colors;
    const dc: DrawCtx = { ctx, t, w, h, colors, business, content, particles: particlesRef.current };
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, colors.bg1); bg.addColorStop(1, colors.bg2);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    if (s === 'cinematic') drawCinematic(dc);
    else if (s === 'festival') drawFestival(dc);
    else if (s === 'slide') drawSlide(dc);
    else if (s === 'story') drawStory(dc);
    else if (s === 'neon') drawNeon(dc);
    else if (s === 'particle') drawParticleWave(dc);
    else if (s === 'glamour') drawGlamour(dc);
    else if (s === 'impact') drawImpact(dc);
  }

  const animate = (timestamp: number) => {
    if (!canvasRef.current) return;
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = (timestamp - startTimeRef.current) / 1000;
    const t = Math.min(elapsed / durationRef.current, 1);
    setProgress(t);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) drawFrame(ctx, t, styleRef.current);
    if (t < 1) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    }
  };

  // Draw static first frame on config change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;
    particlesRef.current = [];
    const ctx = canvas.getContext('2d');
    if (ctx) drawFrame(ctx, 0, style);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, aspectRatio, business.businessName]);

  function startPlayback() {
    cancelAnimationFrame(animRef.current);
    particlesRef.current = [];
    startTimeRef.current = 0;
    setIsPlaying(true);
    setProgress(0);
    animRef.current = requestAnimationFrame(animate);
  }

  function stopPlayback() {
    cancelAnimationFrame(animRef.current);
    setIsPlaying(false);
  }

  async function exportVideo() {
    if (!canvasRef.current) return;
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : null;
    if (!mimeType) { alert('Video export requires Chrome or Edge browser.'); return; }

    chunksRef.current = [];
    const stream = canvasRef.current.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${business.businessName}-promo-${style}.webm`; a.click();
      URL.revokeObjectURL(url);
      setIsRecording(false); setExported(true);
      setTimeout(() => setExported(false), 3500);
    };
    setIsRecording(true);
    recorder.start();
    cancelAnimationFrame(animRef.current);
    particlesRef.current = [];
    startTimeRef.current = 0;
    setProgress(0);
    setIsPlaying(true);
    animRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const accentColor = VIDEO_STYLES[style].colors.accent;

  if (!isPaid) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ background: 'rgba(255,107,26,0.05)', border: '1px solid rgba(255,107,26,0.18)' }}>
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-2xl font-black text-white mb-3">Video Creator</h3>
        <p className="text-white/50 mb-2">Create stunning animated promo videos in seconds.</p>
        <p className="text-white/35 text-sm mb-6">8 animation styles · 3 aspect ratios · 30s duration · WebM download</p>
        <a href="/#pricing" className="btn-primary inline-block px-7 py-3 rounded-xl font-bold">Upgrade to Starter →</a>
      </div>
    );
  }

  return (
    <div>
      {/* Style grid */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Animation Style</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.entries(VIDEO_STYLES) as [VideoStyle, typeof VIDEO_STYLES[VideoStyle]][]).map(([key, s]) => {
            const locked = s.minPlan === 'growth' && !isGrowth;
            const active = style === key;
            return (
              <button
                key={key}
                onClick={() => { if (!locked) { setStyle(key); stopPlayback(); setProgress(0); particlesRef.current = []; } }}
                className="relative rounded-xl p-3 text-left transition-all duration-150"
                style={{
                  background: active ? `${s.colors.accent}1A` : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${active ? s.colors.accent + '88' : 'rgba(255,255,255,0.07)'}`,
                  opacity: locked ? 0.52 : 1,
                  cursor: locked ? 'not-allowed' : 'pointer',
                  boxShadow: active ? `0 0 16px ${s.colors.accent}22` : 'none',
                }}
              >
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className="text-xs font-bold" style={{ color: active ? s.colors.accent : 'rgba(255,255,255,0.75)' }}>{s.label}</div>
                <div className="text-[10px] leading-tight mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.description}</div>
                {locked && (
                  <div className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.85)', color: '#fff' }}>Growth</div>
                )}
                {active && (
                  <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: s.colors.accent }}>
                    <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canvas preview */}
        <div className="flex flex-col items-center">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              width: canvasSize.w * previewScale,
              height: canvasSize.h * previewScale,
              boxShadow: `0 0 60px ${accentColor}44, 0 0 0 1px ${accentColor}22`,
            }}
          >
            <canvas
              ref={canvasRef}
              width={canvasSize.w}
              height={canvasSize.h}
              style={{ width: canvasSize.w * previewScale, height: canvasSize.h * previewScale, display: 'block' }}
            />
            {(isPlaying || progress > 0) && (
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full" style={{ width: `${progress * 100}%`, background: accentColor, transition: 'none' }} />
              </div>
            )}
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={isPlaying ? stopPlayback : startPlayback}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
              style={{ background: accentColor, boxShadow: `0 0 18px ${accentColor}55` }}
            >
              {isPlaying
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>}
            </button>
            <button
              onClick={() => { stopPlayback(); setProgress(0); particlesRef.current = []; const ctx = canvasRef.current?.getContext('2d'); if (ctx) drawFrame(ctx, 0, style); }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 12a9 9 0 109-9 9 9 0 00-9 9"/>
                <polyline points="3 8 3 12 7 12"/>
              </svg>
            </button>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{Math.round(progress * duration)}s / {duration}s</span>
          </div>
        </div>

        {/* Settings panel */}
        <div className="space-y-5">
          {/* Format */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Format</p>
            <div className="flex gap-2">
              {(['9:16', '1:1', '16:9'] as AspectRatio[]).map(ar => (
                <button
                  key={ar}
                  onClick={() => { setAspectRatio(ar); stopPlayback(); setProgress(0); }}
                  className="flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center"
                  style={aspectRatio === ar
                    ? { background: 'rgba(255,107,26,0.16)', color: '#FF6B1A', border: '1.5px solid rgba(255,107,26,0.4)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(255,255,255,0.08)' }}
                >
                  <span>{ar === '9:16' ? '📱' : ar === '1:1' ? '⬛' : '🖥️'} {ar}</span>
                  <span className="text-[9px] font-normal opacity-55 mt-0.5">{ar === '9:16' ? 'Reels/Stories' : ar === '1:1' ? 'Feed/Square' : 'YouTube'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Duration</p>
            <div className="flex gap-2">
              {([10, 15, 30] as Duration[]).map(d => (
                <button key={d} onClick={() => { setDuration(d); stopPlayback(); setProgress(0); }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={duration === d
                    ? { background: 'rgba(255,107,26,0.16)', color: '#FF6B1A', border: '1.5px solid rgba(255,107,26,0.4)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Content summary */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Content Preview</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex gap-2"><span style={{ color: 'rgba(255,255,255,0.3)' }}>Business:</span><span className="font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{business.businessName}</span></div>
              <div className="flex gap-2"><span style={{ color: 'rgba(255,255,255,0.3)' }}>Type:</span><span style={{ color: 'rgba(255,255,255,0.55)' }}>{business.businessType}</span></div>
              <div className="flex gap-2"><span style={{ color: 'rgba(255,255,255,0.3)' }}>Tagline:</span><span className="line-clamp-2" style={{ color: 'rgba(255,255,255,0.55)' }}>{content.flyerTagline || '—'}</span></div>
              {business.offerEnabled && business.offerBadge && (
                <div className="flex gap-2"><span style={{ color: 'rgba(255,255,255,0.3)' }}>Offer:</span><span className="font-semibold" style={{ color: accentColor }}>{business.offerBadge}</span></div>
              )}
            </div>
          </div>

          {/* Export */}
          <div>
            <button
              onClick={exportVideo}
              disabled={isRecording}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200"
              style={isRecording
                ? { background: 'rgba(255,107,26,0.1)', color: '#FF6B1A', border: '1.5px solid rgba(255,107,26,0.3)', cursor: 'wait' }
                : exported
                ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1.5px solid rgba(34,197,94,0.35)' }
                : { background: 'linear-gradient(135deg, #FF6B1A 0%, #FF9500 100%)', color: '#fff', boxShadow: '0 4px 24px rgba(255,107,26,0.35)' }}
            >
              {isRecording ? (
                <><svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-18 0" strokeLinecap="round" strokeOpacity="0.3"/><path d="M12 3a9 9 0 019 9" strokeLinecap="round"/></svg>Recording… {Math.round(progress * duration)}s / {duration}s</>
              ) : exported ? (
                <>✅ Saved to Downloads!</>
              ) : (
                <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/></svg>Export {duration}s Video (.webm)</>
              )}
            </button>
            <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(255,255,255,0.22)' }}>
              WebM · Chrome/Edge · WhatsApp, Instagram &amp; YouTube ready
            </p>
          </div>

          <div className="rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
              💡 <strong style={{ color: 'rgba(255,255,255,0.55)' }}>How to use:</strong> Click ▶ to preview animation, then <em>Export</em> to record &amp; auto-download. The animation plays through once and saves automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
