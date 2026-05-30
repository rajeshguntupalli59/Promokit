'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Festival {
  name: string;
  date: string; // YYYY-MM-DD
  emoji: string;
  type: 'major' | 'regional' | 'commercial';
  promo: string; // promo hook idea
}

// Indian festivals — rolling list covering every month of the year
const FESTIVALS: Festival[] = [
  // May–June
  { name: 'Eid ul-Adha', date: '2026-05-27', emoji: '🌙', type: 'major', promo: 'Bakrid special — sacrifice on old prices, celebrate with deals' },
  { name: 'World Environment Day', date: '2026-06-05', emoji: '🌿', type: 'commercial', promo: 'Go green sale — eco-friendly products and sustainable deals' },
  { name: "Father's Day", date: '2026-06-21', emoji: '👨', type: 'commercial', promo: 'Celebrate dad — gifting offers and special packages for the best dads' },
  { name: 'Rath Yatra', date: '2026-06-26', emoji: '🛕', type: 'major', promo: 'Auspicious Rath Yatra offer — holy day, holy deals' },
  // July
  { name: 'Guru Purnima', date: '2026-07-19', emoji: '🙏', type: 'major', promo: 'Honor your teachers — share a thank-you message with your loyal customers' },
  // August
  { name: 'Friendship Day', date: '2026-08-02', emoji: '🤝', type: 'commercial', promo: 'Friends who shop together save together — refer a friend deal' },
  { name: 'Raksha Bandhan', date: '2026-08-29', emoji: '🪢', type: 'major', promo: 'Gifting offers for siblings — the perfect rakhi present' },
  { name: 'Independence Day', date: '2026-08-15', emoji: '🇮🇳', type: 'major', promo: 'Freedom sale — special discounts to celebrate independence' },
  { name: 'Janmashtami', date: '2026-08-05', emoji: '🦚', type: 'major', promo: 'Krishna-inspired joy — festival offer with a divine twist' },
  // September
  { name: 'Ganesh Chaturthi', date: '2026-09-16', emoji: '🐘', type: 'major', promo: 'Ganpati Bappa blessing sale — auspicious new beginnings' },
  { name: 'Onam', date: '2026-09-23', emoji: '🌸', type: 'regional', promo: 'Harvest happiness — Kerala-style grand deals for Onam' },
  // October
  { name: 'Navratri Begins', date: '2026-10-10', emoji: '🪔', type: 'major', promo: 'Nine days, nine offers — a new deal each day of Navratri' },
  { name: 'Dussehra', date: '2026-10-20', emoji: '🏹', type: 'major', promo: 'Vijay Dashami victory sale — defeat old prices today' },
  { name: 'Diwali', date: '2026-11-08', emoji: '🎆', type: 'major', promo: "Festival of lights — brighten someone's day with your product" },
  { name: 'Bhai Dooj', date: '2026-11-11', emoji: '🧡', type: 'major', promo: 'Brother-sister bond — combo gifts and special packages' },
  // November–December
  { name: 'Guru Nanak Jayanti', date: '2026-11-24', emoji: '☬', type: 'major', promo: 'Spread the light — charitable offer or community giveaway' },
  { name: 'Christmas', date: '2026-12-25', emoji: '🎄', type: 'commercial', promo: 'Santa-approved deals — gifts and year-end special offers' },
  // 2027 starts
  { name: 'New Year 2027', date: '2027-01-01', emoji: '🎉', type: 'commercial', promo: 'New year new you — fresh start deals and January specials' },
  { name: 'Makar Sankranti', date: '2027-01-14', emoji: '🪁', type: 'major', promo: 'Uttarayan kite sale — soar high with our special offers' },
  { name: 'Republic Day', date: '2027-01-26', emoji: '🇮🇳', type: 'major', promo: 'Proud to be Indian — patriotic offer to celebrate the republic' },
  { name: "Valentine's Day", date: '2027-02-14', emoji: '❤️', type: 'commercial', promo: 'Love sale — couples offer, gifting ideas, and romantic deals' },
];

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function FestivalPlanner({ businessName, businessType }: { businessName: string; businessType: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const upcoming = FESTIVALS
    .map(f => ({ ...f, days: daysUntil(f.date) }))
    .filter(f => f.days >= -2 && f.days <= 60)
    .sort((a, b) => a.days - b.days)
    .slice(0, 8);

  if (!upcoming.length) return null;

  function getPromoUrl(festival: Festival) {
    const params = new URLSearchParams({
      festival: festival.name,
      businessName,
      businessType,
    });
    return `/create?${params}`;
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📅</span>
        <div>
          <h4 className="font-bold text-white text-sm">Upcoming Festival Calendar</h4>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>Plan promos ahead — never miss a festive opportunity</p>
        </div>
      </div>

      <div className="space-y-2">
        {upcoming.map(f => {
          const isToday = f.days === 0;
          const isSoon = f.days <= 7;
          const isExpanded = expanded === f.name;

          return (
            <div key={f.name}>
              <button
                onClick={() => setExpanded(isExpanded ? null : f.name)}
                className="w-full rounded-xl p-3 text-left transition-all"
                style={{
                  background: isToday ? 'rgba(255,107,26,0.12)' : isSoon ? 'rgba(255,107,26,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isToday ? 'rgba(255,107,26,0.4)' : isSoon ? 'rgba(255,107,26,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{f.emoji}</span>
                    <div>
                      <span className="text-sm font-bold" style={{ color: isToday ? '#FF6B1A' : 'rgba(255,255,255,0.85)' }}>{f.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
                          background: isToday ? 'rgba(255,107,26,0.25)' : isSoon ? 'rgba(255,107,26,0.12)' : 'rgba(255,255,255,0.06)',
                          color: isToday ? '#FF6B1A' : isSoon ? 'rgba(255,107,26,0.8)' : 'rgba(255,255,255,0.35)',
                        }}>
                          {isToday ? 'TODAY' : f.days === 1 ? 'Tomorrow' : `${f.days}d`}
                        </span>
                        {f.type === 'major' && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,215,0,0.1)', color: 'rgba(255,215,0,0.7)' }}>MAJOR</span>}
                      </div>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="mx-2 mb-1 rounded-b-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none' }}>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    💡 <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Promo idea:</strong> {f.promo}
                  </p>
                  <Link
                    href={getPromoUrl(f)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(255,107,26,0.15)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.3)' }}
                  >
                    Generate {f.name} Promo →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
