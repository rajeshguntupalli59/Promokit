'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import RazorpayButton from './RazorpayButton'
import FestivalPlanner from '../FestivalPlanner'

type Profile = {
  id: string
  email: string
  plan: string
  generations_this_month: number
  billing_period_start: string
  referral_code?: string
  referral_credits?: number
  created_at: string
}

type Business = {
  id: string
  name: string
  type: string
  description: string
  location: string
  language: string
  tone: string
  created_at: string
}

type Generation = {
  id: string
  business_name: string
  created_at: string
  content: Record<string, unknown>
}

type User = { id: string; email?: string; user_metadata?: { full_name?: string } }
type Reminder = { id: string; title: string; date: string; content: string }

interface Props {
  user: User
  profile: Profile | null
  businesses: Business[]
  generations: Generation[]
}

const PLAN_LIMIT: Record<string, number> = { free: 3, starter: 999999, growth: 999999 }

const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',       icon: '⚡' },
  { id: 'businesses',   label: 'My Businesses',  icon: '🏪' },
  { id: 'generations',  label: 'History',        icon: '🕐' },
  { id: 'settings',     label: 'Settings',       icon: '⚙️' },
]

const NAV_LINKS = [
  { label: 'Smart Calendar',   icon: '📅', href: '/schedule',   minPlan: 'starter' },
  { label: 'Marketing Agent',  icon: '🤖', href: '/market',     minPlan: 'starter' },
  { label: 'Broadcast',        icon: '📣', href: '/broadcast',  minPlan: 'growth'  },
]

const TOOLS = [
  { icon: '🎨', label: 'Generate Content',   desc: 'WhatsApp · Instagram · Poster', href: '/create',   minPlan: 'free',    color: '#FF6B1A' },
  { icon: '🎬', label: 'Video / Reel',        desc: '8 animated styles',             href: '/create',   minPlan: 'starter', color: '#A855F7' },
  { icon: '🪪', label: 'Business Card',       desc: '4 premium designs',             href: '/create',   minPlan: 'starter', color: '#3B82F6' },
  { icon: '🧠', label: 'Caption Optimizer',   desc: 'AI A/B test 5 tones',           href: '/create',   minPlan: 'starter', color: '#22C55E' },
  { icon: '#️⃣', label: 'Hashtag Pack',        desc: 'Industry-specific sets',        href: '/create',   minPlan: 'free',    color: '#EC4899' },
  { icon: '🎉', label: 'Festival Planner',    desc: '60-day promo calendar',         href: '/schedule', minPlan: 'starter', color: '#F59E0B' },
  { icon: '🤖', label: 'Marketing Agent',     desc: 'Full campaign generator',       href: '/market',   minPlan: 'starter', color: '#6366F1' },
  { icon: '📅', label: 'Auto-Schedule',       desc: 'Post to 4 platforms',           href: '/market',   minPlan: 'starter', color: '#14B8A6' },
]

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const CHECKLIST = [
  { key: 'generated',  label: 'Generate your first promo',    href: '/create'   },
  { key: 'video',      label: 'Try the Video / Reel creator', href: '/create'   },
  { key: 'scheduled',  label: 'Schedule a social media post', href: '/market'   },
  { key: 'agent',      label: 'Run the Marketing Agent',      href: '/market'   },
  { key: 'referred',   label: 'Invite a friend (referral)',   href: '/dashboard#settings' },
]

function OnboardingChecklist({ generations }: { generations: number }) {
  const [done, setDone] = useState<Record<string, boolean>>({})
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem('promokit_checklist') ?? '{}')) } catch { /* */ }
  }, [])
  const allDone = CHECKLIST.every(c => done[c.key] || (c.key === 'generated' && generations > 0))
  if (allDone) return null
  return (
    <div className="rounded-2xl p-5 mb-8" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
      <p className="text-sm font-black text-white mb-4">🚀 Get started — {CHECKLIST.filter(c => done[c.key] || (c.key === 'generated' && generations > 0)).length} / {CHECKLIST.length} done</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {CHECKLIST.map(c => {
          const isDone = done[c.key] || (c.key === 'generated' && generations > 0)
          return (
            <Link key={c.key} href={c.href}
              onClick={() => {
                const next = { ...done, [c.key]: true }
                setDone(next)
                localStorage.setItem('promokit_checklist', JSON.stringify(next))
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
              style={isDone
                ? { background: 'rgba(34,197,94,0.08)', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                style={isDone ? { background: 'rgba(34,197,94,0.3)', color: '#22C55E' } : { background: 'rgba(255,255,255,0.1)' }}>
                {isDone ? '✓' : ''}
              </span>
              {c.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function ToolsGrid({ plan }: { plan: string }) {
  const canAccess = (minPlan: string) => {
    if (minPlan === 'free') return true
    if (minPlan === 'starter') return plan !== 'free'
    return plan === 'growth'
  }
  return (
    <section className="mb-10">
      <h2 className="text-base font-black text-white mb-4">All Tools</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TOOLS.map(t => {
          const locked = !canAccess(t.minPlan)
          return (
            <Link key={t.label} href={locked ? '/#pricing' : t.href}
              className="group rounded-2xl p-4 flex flex-col gap-2 transition-all duration-200 relative overflow-hidden"
              style={locked
                ? { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', opacity: 0.55 }
                : { background: '#111', border: `1px solid rgba(255,255,255,0.07)` }}>
              {/* Glow on hover */}
              {!locked && <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" style={{ background: `radial-gradient(circle at 30% 30%, ${t.color}15, transparent 70%)` }} />}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 relative"
                style={{ background: locked ? 'rgba(255,255,255,0.06)' : `${t.color}18`, border: `1px solid ${locked ? 'rgba(255,255,255,0.06)' : t.color + '30'}` }}>
                {t.icon}
              </div>
              <div className="relative">
                <p className="text-sm font-bold text-white leading-tight">{t.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.desc}</p>
              </div>
              {locked && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded self-start" style={{ background: 'rgba(255,107,26,0.15)', color: '#FF6B1A' }}>
                  {t.minPlan === 'growth' ? 'Growth' : 'Starter'}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    free: 'rgba(255,255,255,0.15)',
    starter: 'rgba(255,107,26,0.3)',
    growth: 'rgba(99,102,241,0.35)',
  }
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{ background: colors[plan] ?? colors.free, color: '#fff' }}
    >
      {plan}
    </span>
  )
}

export default function DashboardClient({ user, profile, businesses, generations }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [upgradeSuccess, setUpgradeSuccess] = useState(false)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [referralCopied, setReferralCopied] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('promokit_reminders') ?? '[]'
      const all: Reminder[] = JSON.parse(raw)
      const upcoming = all.filter(r => new Date(r.date) > new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setReminders(upcoming)
    } catch { setReminders([]) }
  }, [])

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    const valid = NAV_ITEMS.map(n => n.id)
    if (hash && valid.includes(hash)) setActiveTab(hash)
  }, [])

  const plan = profile?.plan ?? 'free'
  const used = profile?.generations_this_month ?? 0
  const limit = PLAN_LIMIT[plan]
  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const showUpgradeBanner = plan === 'free' && used >= 2

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#000' }}>
      {/* Sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40"
        style={{
          width: '240px',
          background: '#0A0A0A',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF6B1A, #FFD700)', boxShadow: '0 0 16px rgba(255,107,26,0.45)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" />
            </svg>
          </div>
          <span
            className="font-black text-lg tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #FF6B1A, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            PromoKit
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150"
              style={{
                background: activeTab === item.id ? 'rgba(255,107,26,0.12)' : 'transparent',
                color: activeTab === item.id ? '#FF6B1A' : 'rgba(255,255,255,0.55)',
                border: activeTab === item.id ? '1px solid rgba(255,107,26,0.2)' : '1px solid transparent',
              }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}

          <div className="mt-4 mb-1 px-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>Quick Access</p>
          </div>
          {NAV_LINKS.map(item => {
            const locked = item.minPlan === 'growth' ? plan !== 'growth' : plan === 'free'
            return (
              <Link key={item.label} href={locked ? '/#pricing' : item.href}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={{ color: locked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.55)', border: '1px solid transparent' }}>
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {locked && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,107,26,0.15)', color: '#FF6B1A' }}>{item.minPlan === 'growth' ? 'Growth' : 'Starter'}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
              style={{ background: 'rgba(255,107,26,0.2)', color: '#FF6B1A' }}
            >
              {displayName[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{displayName}</p>
              <div className="mt-0.5"><PlanBadge plan={plan} /></div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-xs font-medium py-2 px-3 rounded-lg transition-all duration-150"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.45)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-[240px] px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {greeting}, {displayName}! 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <Link
            href="/create"
            className="btn-primary hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl"
          >
            Create New PromoKit →
          </Link>
        </div>

        {/* Upgrade banner */}
        {showUpgradeBanner && !upgradeSuccess && (
          <div
            className="rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{
              background: 'rgba(255,107,26,0.07)',
              border: '1px solid rgba(255,107,26,0.3)',
              boxShadow: '0 0 40px rgba(255,107,26,0.06)',
            }}
          >
            <div>
              <p className="font-bold text-white text-sm mb-1">
                ⚡ You&apos;ve used {used} of 3 free generations this month
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                Upgrade to Starter for unlimited generations + all AI tools — ₹499/month
              </p>
            </div>
            <div className="flex-shrink-0 w-48">
              <RazorpayButton
                plan="starter"
                label="Upgrade Now →"
                onSuccess={() => setUpgradeSuccess(true)}
              />
            </div>
          </div>
        )}

        {upgradeSuccess && (
          <div
            className="rounded-2xl p-4 mb-8 flex items-center gap-3"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <span style={{ color: '#22C55E', fontSize: '20px' }}>✓</span>
            <p className="text-sm font-semibold" style={{ color: '#22C55E' }}>
              Payment successful! Your plan has been upgraded. Refresh to see your new limits.
            </p>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Generations this month',
              value: `${used} / ${limit > 9999 ? '∞' : limit}`,
              sub: plan === 'free' ? `${limit - used} remaining` : 'Unlimited',
            },
            {
              label: 'Businesses saved',
              value: String(businesses.length),
              sub: businesses.length === 0 ? 'None yet' : 'Active profiles',
            },
            {
              label: 'Last generated',
              value: generations[0] ? timeAgo(generations[0].created_at) : '—',
              sub: generations[0]?.business_name ?? 'No activity yet',
            },
            {
              label: 'Current plan',
              value: plan.charAt(0).toUpperCase() + plan.slice(1),
              sub: plan === 'free' ? 'Upgrade for more' : 'Active',
              badge: true,
            },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 card-hover"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {stat.label}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                {stat.badge && <PlanBadge plan={plan} />}
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Command Centre */}
        {activeTab === 'overview' && (
          <>
            <OnboardingChecklist generations={generations.length} />
            <ToolsGrid plan={plan} />
          </>
        )}

        {/* My Businesses */}
        {(activeTab === 'overview' || activeTab === 'businesses') && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">My Businesses</h2>
              <Link href="/create" className="text-sm font-medium" style={{ color: '#FF6B1A' }}>
                + Add new
              </Link>
            </div>

            {businesses.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{ background: '#111', border: '1px dashed rgba(255,255,255,0.1)' }}
              >
                <p className="text-3xl mb-3">🏪</p>
                <p className="font-semibold text-white mb-1">No businesses yet</p>
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Create your first PromoKit to get started
                </p>
                <Link href="/create" className="btn-primary inline-block px-6 py-2.5 text-sm font-bold rounded-xl">
                  Get Started →
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {businesses.map(biz => (
                  <div
                    key={biz.id}
                    className="rounded-2xl p-5 card-hover cursor-default"
                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-white text-base">{biz.name}</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {biz.type}{biz.location ? ` · ${biz.location}` : ''}
                        </p>
                      </div>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(255,107,26,0.15)', color: '#FF6B1A' }}
                      >
                        {biz.language}
                      </span>
                    </div>

                    {biz.description && (
                      <p
                        className="text-xs mb-4 line-clamp-2"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                      >
                        {biz.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Link
                          href="/create"
                          className="btn-primary text-xs px-3 py-1.5 rounded-lg font-bold"
                        >
                          Generate Promo →
                        </Link>
                      </div>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {new Date(biz.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Upcoming Reminders */}
        {activeTab === 'overview' && reminders.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4">⏰ Upcoming Reminders</h2>
            <div className="space-y-2">
              {reminders.slice(0, 3).map(r => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: '#111', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{r.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(r.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}>
                    Scheduled
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Festival Planner */}
        {activeTab === 'overview' && businesses.length > 0 && (
          <section className="mb-10">
            <FestivalPlanner
              businessName={businesses[0].name}
              businessType={businesses[0].type}
            />
          </section>
        )}

        {/* Recent Generations */}
        {(activeTab === 'overview' || activeTab === 'generations') && (
          <section>
            <h2 className="text-lg font-bold text-white mb-5">Recent Generations</h2>

            {generations.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{ background: '#111', border: '1px dashed rgba(255,255,255,0.1)' }}
              >
                <p className="text-3xl mb-3">📝</p>
                <p className="font-semibold text-white mb-1">No generations yet</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Your promotional content history will appear here
                </p>
              </div>
            ) : (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {generations.map((gen, i) => (
                  <div
                    key={gen.id}
                    className="flex items-center justify-between px-5 py-4 transition-colors duration-150 hover:bg-white/[0.02]"
                    style={{
                      borderBottom: i < generations.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                        style={{ background: 'rgba(255,107,26,0.1)' }}
                      >
                        📣
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{gen.business_name}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {new Date(gen.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })} · {timeAgo(gen.created_at)}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-xs"
                      style={{ color: 'rgba(255,255,255,0.2)' }}
                    >
                      →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <section>
            <h2 className="text-lg font-bold text-white mb-6">Account Settings</h2>
            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h3 className="font-semibold text-white mb-4">Account</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Email</p>
                  <p className="text-sm font-medium text-white">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Plan</p>
                  <PlanBadge plan={plan} />
                </div>
              </div>
            </div>

            {/* Referral */}
            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: '#111', border: '1px solid rgba(255,215,0,0.15)' }}
            >
              <h3 className="font-semibold text-white mb-1">🎁 Refer & Earn</h3>
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Share your referral link. Each friend who signs up gives you <strong className="text-white/70">3 extra free generations</strong>.
              </p>
              {profile?.referral_credits != null && profile.referral_credits > 0 && (
                <div className="rounded-xl px-4 py-2.5 mb-4 text-sm font-semibold" style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                  ✓ You&apos;ve earned {profile.referral_credits} bonus generation{profile.referral_credits !== 1 ? 's' : ''} from referrals
                </div>
              )}
              <div className="flex gap-2">
                <input
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/auth/signup?ref=${profile?.referral_code ?? ''}` : ''}
                  className="form-input flex-1 text-xs"
                  style={{ color: 'rgba(255,255,255,0.5)', cursor: 'text' }}
                />
                <button
                  onClick={async () => {
                    const url = `${window.location.origin}/auth/signup?ref=${profile?.referral_code ?? ''}`
                    await navigator.clipboard.writeText(url)
                    setReferralCopied(true)
                    setTimeout(() => setReferralCopied(false), 2000)
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0 transition-all"
                  style={
                    referralCopied
                      ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
                      : { background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.25)' }
                  }
                >
                  {referralCopied ? 'Copied ✓' : 'Copy'}
                </button>
              </div>
            </div>

            {plan === 'free' && (
              <div
                className="rounded-2xl p-6"
                style={{ background: '#111', border: '1px solid rgba(255,107,26,0.2)' }}
              >
                <h3 className="font-semibold text-white mb-1">Upgrade your plan</h3>
                <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Get unlimited generations and save all your businesses
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { plan: 'starter' as const, name: 'Starter', price: '₹499/mo', perks: ['Unlimited generations', 'Video · Card · Caption AI', 'Auto-publish scheduling'] },
                    { plan: 'growth' as const, name: 'Growth', price: '₹999/mo', perks: ['Everything in Starter', 'All 8 reel styles', 'Broadcast + Referral rewards'] },
                  ].map(tier => (
                    <div
                      key={tier.plan}
                      className="rounded-xl p-5"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-white">{tier.name}</p>
                        <p className="font-bold text-sm" style={{ color: '#FF6B1A' }}>{tier.price}</p>
                      </div>
                      <ul className="flex flex-col gap-1.5 mb-4">
                        {tier.perks.map(p => (
                          <li key={p} className="text-xs flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                            <span style={{ color: '#22C55E' }}>✓</span> {p}
                          </li>
                        ))}
                      </ul>
                      <RazorpayButton
                        plan={tier.plan}
                        label={`Upgrade to ${tier.name} →`}
                        onSuccess={() => setUpgradeSuccess(true)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
