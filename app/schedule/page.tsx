'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Reminder = { id: string; title: string; date: string; content: string };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchedulePage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [today] = useState(new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTime, setNewTime] = useState('09:00');

  useEffect(() => {
    const stored = localStorage.getItem('promokit_reminders');
    if (stored) setReminders(JSON.parse(stored));
  }, []);

  function save(updated: Reminder[]) {
    setReminders(updated);
    localStorage.setItem('promokit_reminders', JSON.stringify(updated));
  }

  function addReminder() {
    if (!selectedDay || !newTitle) return;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}T${newTime}`;
    const updated = [...reminders, { id: Date.now().toString(), title: newTitle, date: dateStr, content: newContent }];
    save(updated);
    setNewTitle(''); setNewContent(''); setNewTime('09:00');
    setShowAdd(false);
  }

  function deleteReminder(id: string) {
    save(reminders.filter(r => r.id !== id));
  }

  // Calendar math
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function remindersForDay(day: number): Reminder[] {
    const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reminders.filter(r => r.date.startsWith(prefix));
  }

  const selectedReminders = selectedDay ? remindersForDay(selectedDay) : [];

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  }

  // Upcoming reminders
  const upcoming = reminders
    .map(r => ({ ...r, ts: new Date(r.date).getTime() }))
    .filter(r => r.ts >= today.getTime() - 86400000)
    .sort((a, b) => a.ts - b.ts)
    .slice(0, 10);

  return (
    <div className="min-h-screen pt-20 pb-24" style={{ background: '#050508' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/dashboard" className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>← Dashboard</Link>
            </div>
            <h1 className="text-3xl font-black text-white">Schedule Planner</h1>
            <p className="text-white/45 mt-1">Plan your promotional posts across the calendar</p>
          </div>
          <Link href="/create" className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm inline-block">
            + New PromoKit
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Month nav */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <h2 className="font-black text-white text-lg">{MONTHS[viewMonth]} {viewYear}</h2>
                <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 px-4 pt-3 pb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1 p-4">
                {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const rems = remindersForDay(day);
                  const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => { setSelectedDay(isSelected ? null : day); setShowAdd(false); }}
                      className="relative rounded-xl flex flex-col items-center justify-start py-2 transition-all duration-150"
                      style={{
                        minHeight: '56px',
                        background: isSelected ? 'rgba(255,107,26,0.18)' : isToday ? 'rgba(255,107,26,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isSelected ? 'rgba(255,107,26,0.5)' : isToday ? 'rgba(255,107,26,0.25)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      <span className="text-sm font-bold" style={{ color: isToday ? '#FF6B1A' : isSelected ? '#FF6B1A' : 'rgba(255,255,255,0.75)' }}>{day}</span>
                      {rems.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                          {rems.slice(0, 3).map(r => (
                            <div key={r.id} className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF6B1A' }} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day detail */}
            {selectedDay && (
              <div className="mt-4 rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">{MONTHS[viewMonth]} {selectedDay}, {viewYear}</h3>
                  <button
                    onClick={() => setShowAdd(true)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(255,107,26,0.15)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.3)' }}
                  >
                    + Add Reminder
                  </button>
                </div>

                {showAdd && (
                  <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="space-y-3">
                      <input
                        className="form-input w-full"
                        placeholder="Reminder title (e.g. Post Diwali offer)"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <input type="time" className="form-input flex-1" value={newTime} onChange={e => setNewTime(e.target.value)} />
                      </div>
                      <textarea
                        className="form-input w-full resize-none"
                        rows={2}
                        placeholder="Post content (optional)"
                        value={newContent}
                        onChange={e => setNewContent(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setShowAdd(false)} className="btn-ghost flex-1 py-2 rounded-lg text-sm font-semibold">Cancel</button>
                        <button onClick={addReminder} disabled={!newTitle} className="btn-primary flex-[2] py-2 rounded-lg text-sm font-bold" style={{ opacity: !newTitle ? 0.5 : 1 }}>Save</button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReminders.length === 0 && !showAdd && (
                  <p className="text-sm text-center py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>No reminders for this day</p>
                )}

                {selectedReminders.map(r => (
                  <div key={r.id} className="flex items-start justify-between gap-3 p-3 rounded-xl mb-2" style={{ background: 'rgba(255,107,26,0.06)', border: '1px solid rgba(255,107,26,0.18)' }}>
                    <div>
                      <p className="text-sm font-bold text-white">{r.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{new Date(r.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      {r.content && <p className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.55)' }}>{r.content}</p>}
                    </div>
                    <button onClick={() => deleteReminder(r.id)} className="text-xs px-2 py-1 rounded transition-colors flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar — upcoming */}
          <div>
            <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold text-white mb-4 text-sm">📋 Upcoming Reminders</h3>
              {upcoming.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-white/35 text-sm mb-3">No upcoming reminders</p>
                  <p className="text-white/25 text-xs">Schedule posts from Results page or click a date above</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcoming.map(r => {
                    const d = new Date(r.date);
                    const days = Math.round((d.getTime() - today.getTime()) / 86400000);
                    return (
                      <div key={r.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{r.title}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                              {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{
                            background: days <= 1 ? 'rgba(255,107,26,0.2)' : 'rgba(255,255,255,0.06)',
                            color: days <= 1 ? '#FF6B1A' : 'rgba(255,255,255,0.35)',
                          }}>
                            {days === 0 ? 'Today' : days === 1 ? 'Tmrw' : `${days}d`}
                          </span>
                        </div>
                        {r.content && <p className="text-[10px] mt-1.5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.42)' }}>{r.content}</p>}
                        <button onClick={() => deleteReminder(r.id)} className="mt-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Delete</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl p-4" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                💡 <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Tip:</strong> Schedule reminders from the Results page after generating PromoKit content — content is auto-attached.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
