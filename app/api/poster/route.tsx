import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

// ── Font cache (persists in worker across requests) ──────────────────────────
const fontCache = new Map<string, ArrayBuffer>()

const LOCAL_FONTS: Record<string, Record<number, string>> = {
  'Poppins': { 700: 'Poppins-Bold.ttf', 900: 'Poppins-Black.ttf' },
  'Noto Sans Devanagari': { 700: 'NotoSansDevanagari-Bold.ttf' },
  'Noto Sans Telugu': { 700: 'NotoSansTelugu-Bold.ttf' },
  'Noto Sans Tamil': { 700: 'NotoSansTamil-Bold.ttf' },
  'Noto Sans Kannada': { 700: 'NotoSansKannada-Bold.ttf' },
  'Noto Sans Bengali': { 700: 'NotoSansBengali-Bold.ttf' },
}

function loadLocalFont(family: string, weight: number): ArrayBuffer | null {
  const key = `${family}-${weight}`
  if (fontCache.has(key)) return fontCache.get(key)!
  try {
    const fileName = LOCAL_FONTS[family]?.[weight]
    if (!fileName) return null
    const buf = fs.readFileSync(path.join(process.cwd(), 'public/fonts', fileName))
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
    fontCache.set(key, ab)
    return ab
  } catch { return null }
}

// ── Template definitions ─────────────────────────────────────────────────────
const TEMPLATES: Record<string, {
  bgFrom: string; bgMid: string; bgTo: string
  hdrFrom: string; hdrTo: string
  accent: string; accentMuted: string; accentBorder: string
  pillColor: string; textSub: string; footerBg: string
}> = {
  saffron: {
    bgFrom: '#1a0800', bgMid: '#2d1000', bgTo: '#1a0800',
    hdrFrom: '#FF6B1A', hdrTo: '#FF9500',
    accent: '#FF6B1A', accentMuted: 'rgba(255,107,26,0.15)', accentBorder: 'rgba(255,107,26,0.45)',
    pillColor: '#FFAB6A', textSub: 'rgba(255,210,170,0.78)', footerBg: 'rgba(0,0,0,0.42)',
  },
  diwali: {
    bgFrom: '#120800', bgMid: '#1E1000', bgTo: '#2A1500',
    hdrFrom: '#9A6700', hdrTo: '#FFD700',
    accent: '#FFD700', accentMuted: 'rgba(255,215,0,0.13)', accentBorder: 'rgba(255,215,0,0.45)',
    pillColor: '#FFE566', textSub: 'rgba(255,230,120,0.78)', footerBg: 'rgba(0,0,0,0.5)',
  },
  rose: {
    bgFrom: '#120008', bgMid: '#200010', bgTo: '#180010',
    hdrFrom: '#BE185D', hdrTo: '#F9A8D4',
    accent: '#EC4899', accentMuted: 'rgba(236,72,153,0.13)', accentBorder: 'rgba(236,72,153,0.45)',
    pillColor: '#F9A8D4', textSub: 'rgba(255,190,225,0.78)', footerBg: 'rgba(0,0,0,0.45)',
  },
  midnight: {
    bgFrom: '#020614', bgMid: '#0D1535', bgTo: '#060818',
    hdrFrom: '#1E3A8A', hdrTo: '#60A5FA',
    accent: '#3B82F6', accentMuted: 'rgba(59,130,246,0.13)', accentBorder: 'rgba(59,130,246,0.45)',
    pillColor: '#93C5FD', textSub: 'rgba(180,210,255,0.78)', footerBg: 'rgba(0,0,0,0.5)',
  },
  ocean: {
    bgFrom: '#010C12', bgMid: '#062030', bgTo: '#021018',
    hdrFrom: '#0E7490', hdrTo: '#22D3EE',
    accent: '#06B6D4', accentMuted: 'rgba(6,182,212,0.13)', accentBorder: 'rgba(6,182,212,0.45)',
    pillColor: '#67E8F9', textSub: 'rgba(150,240,255,0.78)', footerBg: 'rgba(0,0,0,0.45)',
  },
  emerald: {
    bgFrom: '#021208', bgMid: '#041E0E', bgTo: '#031510',
    hdrFrom: '#065F46', hdrTo: '#10B981',
    accent: '#10B981', accentMuted: 'rgba(16,185,129,0.13)', accentBorder: 'rgba(16,185,129,0.45)',
    pillColor: '#6EE7B7', textSub: 'rgba(150,255,210,0.78)', footerBg: 'rgba(0,0,0,0.45)',
  },
  violet: {
    bgFrom: '#080414', bgMid: '#14063A', bgTo: '#0A0420',
    hdrFrom: '#5B21B6', hdrTo: '#A78BFA',
    accent: '#8B5CF6', accentMuted: 'rgba(139,92,246,0.13)', accentBorder: 'rgba(139,92,246,0.45)',
    pillColor: '#C4B5FD', textSub: 'rgba(210,190,255,0.78)', footerBg: 'rgba(0,0,0,0.5)',
  },
  sunrise: {
    bgFrom: '#120400', bgMid: '#1E0800', bgTo: '#100A00',
    hdrFrom: '#DC2626', hdrTo: '#FBBF24',
    accent: '#F97316', accentMuted: 'rgba(249,115,22,0.13)', accentBorder: 'rgba(249,115,22,0.45)',
    pillColor: '#FCD34D', textSub: 'rgba(255,220,150,0.78)', footerBg: 'rgba(0,0,0,0.45)',
  },
  steel: {
    bgFrom: '#080808', bgMid: '#141414', bgTo: '#0A0A0A',
    hdrFrom: '#374151', hdrTo: '#9CA3AF',
    accent: '#9CA3AF', accentMuted: 'rgba(156,163,175,0.1)', accentBorder: 'rgba(156,163,175,0.35)',
    pillColor: '#D1D5DB', textSub: 'rgba(210,215,220,0.7)', footerBg: 'rgba(0,0,0,0.6)',
  },
}

// Map language to Google Fonts family name
const LANG_FONT: Record<string, string> = {
  Hindi: 'Noto Sans Devanagari',
  Marathi: 'Noto Sans Devanagari',
  Telugu: 'Noto Sans Telugu',
  Tamil: 'Noto Sans Tamil',
  Kannada: 'Noto Sans Kannada',
  Bengali: 'Noto Sans Bengali',
}

type PriceItem = { name: string; price: string; original: string }

async function fetchBase64(url: string): Promise<string | null> {
  try {
    const r = await fetch(url)
    if (!r.ok) return null
    const buf = await r.arrayBuffer()
    const b64 = Buffer.from(buf).toString('base64')
    const ct = r.headers.get('content-type') ?? 'image/png'
    return `data:${ct};base64,${b64}`
  } catch { return null }
}

export async function GET(req: NextRequest) {
  try {
  const p = req.nextUrl.searchParams
  const businessName = p.get('name') || 'Your Business'
  const businessType = p.get('type') || ''
  const location = p.get('location') || ''
  const whatsapp = p.get('whatsapp') || ''
  const tagline = p.get('tagline') || 'Quality Products at the Best Prices'
  const highlight = p.get('highlight') || 'Visit us today for exclusive deals on all products.'
  const template = p.get('template') || 'saffron'
  const language = p.get('language') || 'English'
  const offerBadge = p.get('offerBadge') || ''
  const offerOccasion = p.get('offerOccasion') || ''
  const offerValidTill = p.get('offerValidTill') || ''
  let offerItems: PriceItem[] = []
  try {
    const raw = p.get('offerItems') || ''
    if (raw) offerItems = JSON.parse(raw)
  } catch { offerItems = [] }
  const hasOffer = !!(offerBadge || offerItems.length)
  const showQr = p.get('qr') === '1' && whatsapp
  const logoUrl = p.get('logoUrl') || ''

  const tpl = TEMPLATES[template] ?? TEMPLATES.saffron

  const initials = businessName
    .split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || 'BZ'

  // Fetch QR + logo + fonts in parallel
  const fontFamily = LANG_FONT[language]

  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : ''
  const qrApiUrl = showQr ? `${req.nextUrl.origin}/api/qr?url=${encodeURIComponent(waLink)}` : ''

  const poppins700 = loadLocalFont('Poppins', 700)
  const poppins900 = loadLocalFont('Poppins', 900)
  const localFont700 = fontFamily ? loadLocalFont(fontFamily, 700) : null
  const [qrData, logoData] = await Promise.all([
    qrApiUrl ? fetchBase64(qrApiUrl) : Promise.resolve(null),
    logoUrl ? fetchBase64(logoUrl) : Promise.resolve(null),
  ])

  const fonts: { name: string; data: ArrayBuffer; weight: 100|200|300|400|500|600|700|800|900; style: 'normal'|'italic' }[] = []
  if (poppins700) fonts.push({ name: 'Poppins', data: poppins700, weight: 700, style: 'normal' })
  if (poppins900) fonts.push({ name: 'Poppins', data: poppins900, weight: 900, style: 'normal' })
  if (localFont700 && fontFamily) fonts.push({ name: fontFamily, data: localFont700, weight: 700, style: 'normal' })

  const W = 1080, H = 1350

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: W,
          height: H,
          background: `linear-gradient(160deg, ${tpl.bgFrom} 0%, ${tpl.bgMid} 50%, ${tpl.bgTo} 100%)`,
          fontFamily: fontFamily ? `'${fontFamily}', 'Poppins', sans-serif` : "'Poppins', sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── HEADER BAND ─────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 80px 56px',
            background: `linear-gradient(135deg, ${tpl.hdrFrom} 0%, ${tpl.hdrTo} 100%)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Large decorative circle — top right */}
          <div style={{
            position: 'absolute', top: -100, right: -100,
            width: 300, height: 300, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
          }} />
          {/* Medium decorative circle — bottom left */}
          <div style={{
            position: 'absolute', bottom: -70, left: -70,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,255,255,0.10)',
          }} />
          {/* Small inner ring — top left */}
          <div style={{
            position: 'absolute', top: 28, left: 28,
            width: 80, height: 80, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.2)',
            display: 'flex',
          }} />
          {/* Small inner ring — bottom right */}
          <div style={{
            position: 'absolute', bottom: 22, right: 22,
            width: 56, height: 56, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.18)',
            display: 'flex',
          }} />

          {/* Logo: uploaded image or initials fallback */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 130,
              height: 130,
              borderRadius: 30,
              background: logoData ? 'transparent' : 'rgba(255,255,255,0.24)',
              border: '3px solid rgba(255,255,255,0.5)',
              fontSize: 52,
              fontWeight: 900,
              color: '#fff',
              marginBottom: 24,
              letterSpacing: '0.04em',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
          >
            {logoData
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={logoData} style={{ width: 130, height: 130, objectFit: 'cover' }} alt="" />
              : initials}
          </div>

          {/* Business name */}
          <div
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: '#fff',
              textAlign: 'center',
              lineHeight: 1.15,
              letterSpacing: '0.015em',
              textShadow: '0 2px 12px rgba(0,0,0,0.25)',
              maxWidth: 860,
            }}
          >
            {businessName}
          </div>

          {/* Business type */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.85)',
              marginTop: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {businessType}
          </div>
        </div>

        {/* ── BODY ────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '54px 80px 48px',
            flex: 1,
          }}
        >
          {/* Offer badge — dynamic or default */}
          <div
            style={{
              display: 'flex',
              padding: '12px 36px',
              borderRadius: 60,
              background: tpl.accentMuted,
              border: `1.5px solid ${tpl.accentBorder}`,
              color: tpl.pillColor,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.18em',
              marginBottom: 44,
            }}
          >
            {hasOffer && offerBadge ? `✦  ${offerBadge.toUpperCase()}  ✦` : '✦  SPECIAL OFFER  ✦'}
          </div>

          {/* AI-generated headline */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: '#fff',
              textAlign: 'center',
              lineHeight: 1.18,
              marginBottom: 36,
              maxWidth: 900,
            }}
          >
            {tagline}
          </div>

          {/* Gradient divider */}
          <div
            style={{
              width: 640,
              height: 2,
              background: `linear-gradient(90deg, transparent 0%, ${tpl.accent} 50%, transparent 100%)`,
              marginBottom: 36,
              display: 'flex',
            }}
          />

          {/* AI-generated highlight */}
          <div
            style={{
              fontSize: 26,
              color: tpl.textSub,
              textAlign: 'center',
              lineHeight: 1.55,
              marginBottom: hasOffer && offerItems.length ? 32 : 52,
              maxWidth: 860,
              fontWeight: 400,
            }}
          >
            {highlight}
          </div>

          {/* Price list card — only when offer items are present */}
          {hasOffer && offerItems.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                padding: '28px 48px',
                borderRadius: 24,
                background: 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${tpl.accentBorder}`,
                marginBottom: 32,
              }}
            >
              {offerOccasion && (
                <div style={{
                  fontSize: 16, fontWeight: 700, color: tpl.pillColor,
                  letterSpacing: '0.18em', textAlign: 'center', marginBottom: 20,
                  display: 'flex', justifyContent: 'center',
                }}>
                  {offerOccasion.toUpperCase()} SPECIAL
                </div>
              )}
              {offerItems.map((it, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: i > 0 ? 14 : 0,
                    marginTop: i > 0 ? 14 : 0,
                    borderTop: i > 0 ? `1px solid rgba(255,255,255,0.08)` : 'none',
                  }}
                >
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{it.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {it.original && (
                      <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>
                        ₹{it.original}
                      </span>
                    )}
                    {it.price && (
                      <span style={{ fontSize: 26, fontWeight: 900, color: tpl.pillColor }}>₹{it.price}</span>
                    )}
                  </div>
                </div>
              ))}
              {offerValidTill && (
                <div style={{
                  fontSize: 16, color: 'rgba(255,255,255,0.4)', textAlign: 'center',
                  marginTop: 20, paddingTop: 16,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', justifyContent: 'center',
                }}>
                  Valid till {offerValidTill}
                </div>
              )}
            </div>
          )}

          {/* Contact strip */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              gap: 24,
              padding: '28px 48px',
              borderRadius: 24,
              background: tpl.accentMuted,
              border: `1.5px solid ${tpl.accentBorder}`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
              {location && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  fontSize: 24, fontWeight: 700, color: '#fff',
                }}>
                  <span>📍</span>
                  <span>{location}</span>
                </div>
              )}
              {whatsapp && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  fontSize: 24, fontWeight: 700, color: '#fff',
                }}>
                  <span>📲</span>
                  <span>{whatsapp}</span>
                </div>
              )}
            </div>
            {qrData && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrData} style={{ width: 100, height: 100, borderRadius: 12 }} alt="" />
                <span style={{ fontSize: 13, color: tpl.pillColor, fontWeight: 700, letterSpacing: '0.05em' }}>
                  Scan to chat
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: tpl.footerBg,
            borderTop: `1px solid ${tpl.accentBorder}`,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: tpl.accent,
              letterSpacing: '0.16em',
              opacity: 0.85,
            }}
          >
            GENERATED BY PROMOKIT AI
          </span>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts,
    }
  )
  } catch (err) {
    console.error('[poster]', err)
    return new Response('Poster generation failed', { status: 500 })
  }
}
