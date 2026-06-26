'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  LogOut, Edit2, Copy, Check, ExternalLink,
  RefreshCw, Store, Clock, Star, Eye, MousePointerClick,
  MessageSquare, BarChart2, TrendingUp
} from 'lucide-react'
import StoreForm from '@/components/StoreForm'
import FeedbackTable from '@/components/FeedbackTable'
import Logo from '@/components/Logo'
import Image from 'next/image'

/* ── Helpers ──────────────────────────────────────────────────── */
function QRLink({ slug }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/${slug}`
    : `https://reviewgate.app/${slug}`
  async function copy() { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
      <span className="text-xs text-amber-800 font-mono truncate flex-1 text-left" dir="ltr">{url}</span>
      <button onClick={copy} aria-label={copied ? 'הקישור הועתק' : 'העתק קישור'} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-amber-100 transition">
        {copied ? <Check size={14} className="text-emerald-600" aria-hidden="true" /> : <Copy size={14} className="text-amber-600" aria-hidden="true" />}
      </button>
      <a href={`/${slug}`} target="_blank" rel="noreferrer" aria-label="פתח דף לקוחות בדפדפן"
        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-amber-100 transition">
        <ExternalLink size={14} className="text-amber-600" aria-hidden="true" />
      </a>
    </div>
  )
}

function StatBox({ icon: Icon, label, value, sub, color = 'text-slate-900' }) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
        <Icon size={13} />
        {label}
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

function PendingScreen({ store, onLogout }) {
  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col" dir="rtl">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <button onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition px-3 py-1.5 rounded-lg hover:bg-slate-100">
            <LogOut size={14} /> התנתק
          </button>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm flex flex-col items-center gap-5 animate-slideUp">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock size={36} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">ממתין לאישור</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              בקשת ההצטרפות של <strong className="text-slate-700">{store?.name}</strong> נמצאת בבדיקה.
            </p>
          </div>
          <div className="card p-5 text-sm text-slate-600 w-full">
            <p className="font-bold mb-2 text-slate-800">מה קורה עכשיו?</p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              {['המנהל בודק את פרטי העסק', 'לאחר אישור תקבל גישה מלאה', 'בממוצע: עד 24 שעות'].map(t => (
                <li key={t} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <footer className="text-center py-4 text-xs text-slate-400">
        © {new Date().getFullYear()} myReviewGate · כל הזכויות שמורות
      </footer>
    </div>
  )
}

/* ── Analytics helpers ───────────────────────────────────────── */
function countEvents(events, type) {
  return events.filter(e => e.event_type === type).length
}
function countEventsToday(events, type) {
  const today = new Date(); today.setHours(0,0,0,0)
  return events.filter(e => e.event_type === type && new Date(e.created_at) >= today).length
}
function countEventsThisWeek(events, type) {
  const week = new Date(); week.setDate(week.getDate() - 7)
  return events.filter(e => e.event_type === type && new Date(e.created_at) >= week).length
}
function topCustomLinks(events) {
  const counts = {}
  events.filter(e => e.event_type === 'click_custom').forEach(e => {
    counts[e.link_label] = (counts[e.link_label] || 0) + 1
  })
  return Object.entries(counts).sort((a,b) => b[1]-a[1])
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [user,      setUser]      = useState(null)
  const [store,     setStore]     = useState(null)
  const [feedback,  setFeedback]  = useState([])
  const [events,    setEvents]    = useState([])
  const [showForm,  setShowForm]  = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (profile?.role === 'super_admin') { router.replace('/admin'); return }
      setUser(session.user)
    })
  }, [router, supabase])

  const fetchData = useCallback(async () => {
    if (!user) return
    const { data: storeData } = await supabase.from('stores').select('*').eq('user_id', user.id).single()
    setStore(storeData ?? null)
    if (storeData?.status === 'approved') {
      const [{ data: feedbackData }, { data: eventsData }] = await Promise.all([
        supabase.from('feedback').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false }),
        supabase.from('analytics_events').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false }),
      ])
      setFeedback(feedbackData ?? [])
      setEvents(eventsData ?? [])
    }
  }, [user, supabase])

  useEffect(() => { if (user) fetchData().finally(() => setLoading(false)) }, [user, fetchData])

  async function handleSaveStore(form) {
    const { error } = await supabase.from('stores').update({ ...form }).eq('id', store.id)
    if (error) throw error
    setShowForm(false)
    await fetchData()
  }

  async function handleLogout() { await supabase.auth.signOut(); router.replace('/login') }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f6f3]">
      <RefreshCw size={22} className="animate-spin text-amber-400" />
    </div>
  )

  if (store?.status === 'pending' || store?.status === 'rejected') {
    return (
      <>
        <PendingScreen store={store} onLogout={handleLogout} />
        {store?.status === 'rejected' && (
          <div className="fixed bottom-4 inset-x-4 bg-red-600 text-white text-sm text-center py-3 rounded-2xl shadow-lg" dir="rtl">
            הבקשה שלך נדחתה. צור קשר עם התמיכה.
          </div>
        )}
      </>
    )
  }

  if (store?.status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#f7f6f3] flex flex-col items-center justify-center p-6 gap-5" dir="rtl">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🚫</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900">החשבון מושעה</h2>
        <p className="text-slate-500 text-sm text-center max-w-xs">
          {store.blocked_reason
            ? `סיבה: ${store.blocked_reason}`
            : 'החשבון שלך הושעה. צור קשר עם התמיכה.'}
        </p>
        <button onClick={handleLogout} className="btn-secondary text-sm">התנתק</button>
      </div>
    )
  }

  const avgRating = feedback.length
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : '—'

  const tabs = [
    { id: 'overview',  label: 'סקירה',      icon: BarChart2     },
    { id: 'analytics', label: 'אנליטיקה',   icon: TrendingUp    },
    { id: 'feedback',  label: 'משובים',     icon: MessageSquare },
  ]

  return (
    <div className="min-h-screen bg-[#f7f6f3]" dir="rtl">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">{user?.email}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition px-3 py-1.5 rounded-lg hover:bg-slate-100">
              <LogOut size={14} />
              <span className="hidden sm:block">התנתק</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Store hero card */}
        {store ? (
          <section className="card p-6 animate-slideUp">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {store.logo_url
                  ? <Image src={store.logo_url} alt={store.name} width={64} height={64} className="object-cover w-full h-full" />
                  : <Store size={26} className="text-slate-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-xl font-black text-slate-900">{store.name}</h2>
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">מאושר ✓</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">קישור ה-NFC/QR שלך</p>
                <QRLink slug={store.slug} />
              </div>
              <button onClick={() => setShowForm(true)} className="btn-secondary flex-shrink-0">
                <Edit2 size={14} /> עריכה
              </button>
            </div>

            {/* Custom links preview */}
            {store.custom_links?.filter(l => l.url && l.label).length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">קישורים מותאמים:</p>
                <div className="flex flex-wrap gap-2">
                  {store.custom_links.filter(l => l.url && l.label).map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noreferrer"
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                      <ExternalLink size={10} /> {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : (
          <div className="card border-dashed p-12 text-center">
            <Store size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">אין חנות מקושרת לחשבון שלך עדיין.</p>
          </div>
        )}

        {/* Tabs + content */}
        {store?.status === 'approved' && (
          <section className="animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      activeTab === id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}>
                    <Icon size={14} />{label}
                  </button>
                ))}
              </div>
              <button onClick={fetchData}
                className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-slate-700 transition border border-transparent hover:border-slate-100">
                <RefreshCw size={15} />
              </button>
            </div>

            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox icon={Eye}              label="כניסות (הכל)"    value={countEvents(events,'view')}           />
                <StatBox icon={Eye}              label="כניסות היום"      value={countEventsToday(events,'view')}      />
                <StatBox icon={Star}             label="דירוג ממוצע"      value={avgRating}    color="text-amber-500"  />
                <StatBox icon={MessageSquare}    label="משובים פרטיים"    value={feedback.length}                      />
              </div>
            )}

            {/* ── Analytics ── */}
            {activeTab === 'analytics' && (
              <div className="flex flex-col gap-5">
                {/* Click breakdown */}
                <div className="card p-5">
                  <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                    <MousePointerClick size={15} className="text-amber-500" />
                    פילוח לחיצות
                  </h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: 'גוגל ביקורות',  type: 'click_google',  color: 'bg-amber-400' },
                      { label: 'משוב פרטי',      type: 'click_private', color: 'bg-slate-400'  },
                    ].map(({ label, type, color }) => {
                      const total = countEvents(events, type)
                      const allClicks = countEvents(events,'click_google') + countEvents(events,'click_private') + countEvents(events,'click_custom')
                      const pct = allClicks > 0 ? Math.round((total / allClicks) * 100) : 0
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700">{label}</span>
                            <span className="text-slate-500">{total} לחיצות · {pct}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                    {topCustomLinks(events).map(([label, count]) => {
                      const allClicks = countEvents(events,'click_google') + countEvents(events,'click_private') + countEvents(events,'click_custom')
                      const pct = allClicks > 0 ? Math.round((count / allClicks) * 100) : 0
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700">{label}</span>
                            <span className="text-slate-500">{count} לחיצות · {pct}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Time stats */}
                <div className="grid grid-cols-3 gap-3">
                  <StatBox icon={Eye} label="כניסות היום"    value={countEventsToday(events,'view')}    />
                  <StatBox icon={Eye} label="כניסות השבוע"   value={countEventsThisWeek(events,'view')} />
                  <StatBox icon={Eye} label="כניסות הכל"     value={countEvents(events,'view')}         />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <StatBox icon={MousePointerClick} label="קליקים גוגל היום"   value={countEventsToday(events,'click_google')}    color="text-amber-500" />
                  <StatBox icon={MousePointerClick} label="קליקים גוגל השבוע"  value={countEventsThisWeek(events,'click_google')} color="text-amber-500" />
                  <StatBox icon={MousePointerClick} label="קליקים גוגל הכל"    value={countEvents(events,'click_google')}         color="text-amber-500" />
                </div>
              </div>
            )}

            {/* ── Feedback ── */}
            {activeTab === 'feedback' && (
              <FeedbackTable rows={feedback} />
            )}
          </section>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-slate-400 mt-4">
        © {new Date().getFullYear()} myReviewGate · כל הזכויות שמורות
      </footer>

      {showForm && store && (
        <StoreForm initial={store} onSave={handleSaveStore} onCancel={() => setShowForm(false)} />
      )}
    </div>
  )
}
