'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  LogOut, Edit2, Copy, Check, ExternalLink, RefreshCw, Store,
  Clock, Star, Eye, MousePointerClick, MessageSquare, BarChart2,
  TrendingUp, Settings, Home, ChevronRight,
} from 'lucide-react'
import StoreForm from '@/components/StoreForm'
import Logo from '@/components/Logo'
import Image from 'next/image'

/* ── helpers ─────────────────────────────────────── */
const ev    = (arr, type) => arr.filter(e => e.event_type === type).length
const evDay = (arr, type) => { const d = new Date(); d.setHours(0,0,0,0); return arr.filter(e => e.event_type === type && new Date(e.created_at) >= d).length }
const evWeek= (arr, type) => { const d = new Date(); d.setDate(d.getDate()-7); return arr.filter(e => e.event_type === type && new Date(e.created_at) >= d).length }

function weeklyData(events, type) {
  const days = Array.from({length:7}, (_,i) => { const d = new Date(); d.setDate(d.getDate()-6+i); return d })
  return days.map(day => {
    const next = new Date(day); next.setDate(next.getDate()+1)
    return { label: day.toLocaleDateString('he-IL',{weekday:'short'}), count: events.filter(e => e.event_type===type && new Date(e.created_at)>=day && new Date(e.created_at)<next).length }
  })
}

/* ── Stat Card ───────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, accent = '#6366f1' }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accent + '18' }}>
          <Icon size={17} style={{ color: accent }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs text-emerald-500 font-semibold mt-1">{sub}</p>}
      </div>
    </div>
  )
}

/* ── Mini Line Chart (SVG) ──────────────────────── */
function LineChart({ data, color = '#6366f1' }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const W = 300, H = 80, pad = 10
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - 2 * pad)
    const y = pad + (1 - d.count / max) * (H - 2 * pad)
    return `${x},${y}`
  }).join(' ')
  const area = `${pad},${H - pad} ` + pts + ` ${W - pad},${H - pad}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#lg)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (W - 2 * pad)
        const y = pad + (1 - d.count / max) * (H - 2 * pad)
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="white" strokeWidth="2" />
      })}
    </svg>
  )
}

/* ── Donut Chart (SVG) ──────────────────────────── */
function DonutChart({ segments }) {
  const total = segments.reduce((s, g) => s + g.value, 0) || 1
  const R = 40, cx = 50, cy = 50, stroke = 14
  let offset = 0
  const circ = 2 * Math.PI * R
  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32">
      {total === 0
        ? <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        : segments.map((seg, i) => {
            const pct = seg.value / total
            const dash = pct * circ
            const el = (
              <circle key={i} cx={cx} cy={cy} r={R} fill="none"
                stroke={seg.color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset * circ / 1}
                transform="rotate(-90 50 50)"
                strokeLinecap="butt"
                style={{ strokeDashoffset: -(offset * circ) }}
              />
            )
            offset += pct
            return el
          })
      }
      <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0f172a">
        {total}
      </text>
    </svg>
  )
}

/* ── Pending / Suspended screens ─────────────────── */
function PendingScreen({ store, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 p-6" dir="rtl">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
        <Clock size={36} className="text-amber-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900">ממתין לאישור</h2>
      <p className="text-slate-500 text-sm text-center">
        בקשת ההצטרפות של <strong>{store?.name}</strong> נמצאת בבדיקה.<br />בממוצע עד 24 שעות.
      </p>
      <button onClick={onLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
        <LogOut size={14} /> התנתק
      </button>
    </div>
  )
}

/* ── Sidebar ─────────────────────────────────────── */
function Sidebar({ active, setActive, onLogout }) {
  const nav = [
    { id: 'overview',  label: 'דשבורד',    icon: Home },
    { id: 'analytics', label: 'אנליטיקה',  icon: BarChart2 },
    { id: 'feedback',  label: 'ביקורות',   icon: MessageSquare },
    { id: 'settings',  label: 'הגדרות',    icon: Settings },
  ]
  return (
    <aside className="w-56 shrink-0 bg-slate-900 min-h-screen flex flex-col py-6 px-3 gap-1">
      <div className="px-3 mb-8">
        <Logo size="sm" theme="dark" />
      </div>
      {nav.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => setActive(id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-right ${
            active === id
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/8'
          }`}>
          <Icon size={16} />
          {label}
        </button>
      ))}
      <div className="mt-auto">
        <button onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/8 transition-all w-full text-right">
          <LogOut size={16} /> התנתק
        </button>
      </div>
    </aside>
  )
}

/* ── Main Dashboard ──────────────────────────────── */
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
  const [copied,    setCopied]    = useState(false)

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
      const [{ data: fbData }, { data: evData }] = await Promise.all([
        supabase.from('feedback').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false }),
        supabase.from('analytics_events').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false }),
      ])
      setFeedback(fbData ?? [])
      setEvents(evData ?? [])
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
  async function copyLink() {
    await navigator.clipboard.writeText(`https://myreviewgate.com/${store?.slug}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <RefreshCw size={22} className="animate-spin text-indigo-500" />
    </div>
  )
  if (!store || store.status === 'pending' || store.status === 'rejected') return <PendingScreen store={store} onLogout={handleLogout} />
  if (store.status === 'suspended') return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6" dir="rtl">
      <div className="text-4xl">🚫</div>
      <h2 className="text-xl font-black text-slate-900">החשבון מושעה</h2>
      <p className="text-slate-500 text-sm text-center">{store.blocked_reason || 'צור קשר עם התמיכה.'}</p>
      <button onClick={handleLogout} className="text-sm text-slate-500 underline">התנתק</button>
    </div>
  )

  const avgRating = feedback.length ? (feedback.reduce((s,f) => s + (f.rating||0), 0) / feedback.length).toFixed(1) : '—'
  const totalScans = ev(events, 'view')
  const googleClicks = ev(events, 'click_google')
  const privateClicks = ev(events, 'click_private')
  const scansWeek = weeklyData(events, 'view')
  const donutData = [
    { label: 'גוגל',    value: googleClicks,  color: '#6366f1' },
    { label: 'פרטי',    value: privateClicks, color: '#f59e0b' },
    { label: 'קישורים', value: ev(events,'click_custom'), color: '#10b981' },
  ]
  const today = new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      {/* Sidebar */}
      <div className="hidden md:flex">
        <Sidebar active={activeTab} setActive={setActiveTab} onLogout={handleLogout} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-slate-900">
              {activeTab === 'overview' ? 'דשבורד' : activeTab === 'analytics' ? 'אנליטיקה' : activeTab === 'feedback' ? 'ביקורות' : 'הגדרות'}
            </h1>
            <p className="text-xs text-slate-400">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {store.logo_url
                  ? <Image src={store.logo_url} alt="" width={24} height={24} className="object-cover w-full h-full" />
                  : <Store size={12} className="text-indigo-500" />}
              </div>
              <span className="text-sm font-semibold text-slate-700">{store.name}</span>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm">
              <Edit2 size={13} /> ערוך עסק
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">

              {/* NFC link bar */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                <span className="text-xs font-bold text-indigo-600 whitespace-nowrap">קישור NFC/QR:</span>
                <span className="text-xs font-mono text-indigo-800 flex-1 truncate" dir="ltr">https://myreviewgate.com/{store.slug}</span>
                <button onClick={copyLink} className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition flex-shrink-0">
                  {copied ? <><Check size={12} /> הועתק!</> : <><Copy size={12} /> העתק</>}
                </button>
                <a href={`/${store.slug}`} target="_blank" rel="noreferrer"
                  className="p-1.5 text-indigo-500 hover:text-indigo-700 transition flex-shrink-0">
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="סריקות NFC"     value={totalScans}      sub={`+${evDay(events,'view')} היום`}            icon={Eye}              accent="#6366f1" />
                <StatCard label="דירוג ממוצע"     value={avgRating}       sub={feedback.length ? `מתוך ${feedback.length} ביקורות` : '—'} icon={Star}    accent="#f59e0b" />
                <StatCard label="ביקורות פרטיות"  value={feedback.length} sub={`+${evDay(events,'click_private')} היום`}  icon={MessageSquare}    accent="#10b981" />
                <StatCard label="קליקים לגוגל"    value={googleClicks}    sub={`+${evDay(events,'click_google')} היום`}   icon={MousePointerClick} accent="#ef4444" />
              </div>

              {/* Charts row */}
              <div className="grid lg:grid-cols-3 gap-4">
                {/* Line chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-800">סריקות — 7 ימים אחרונים</h3>
                    <span className="text-xs text-slate-400">{evWeek(events,'view')} סה"כ</span>
                  </div>
                  <LineChart data={scansWeek} color="#6366f1" />
                  <div className="flex justify-between mt-2">
                    {scansWeek.map((d,i) => (
                      <span key={i} className="text-xs text-slate-400">{d.label}</span>
                    ))}
                  </div>
                </div>

                {/* Donut chart */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <h3 className="font-black text-slate-800 mb-4">פילוח לחיצות</h3>
                  <div className="flex flex-col items-center gap-4">
                    <DonutChart segments={donutData} />
                    <div className="flex flex-col gap-2 w-full">
                      {donutData.map(s => (
                        <div key={s.label} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                            <span className="text-slate-600">{s.label}</span>
                          </div>
                          <span className="font-bold text-slate-800">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Latest feedback */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h3 className="font-black text-slate-800">ביקורות אחרונות</h3>
                  <button onClick={() => setActiveTab('feedback')}
                    className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:underline">
                    הצג הכל <ChevronRight size={13} />
                  </button>
                </div>
                {feedback.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">אין ביקורות עדיין</div>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {feedback.slice(0, 5).map(f => (
                        <tr key={f.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                          <td className="px-5 py-3">
                            <div className="font-semibold text-slate-800">{f.customer_name || 'אנונימי'}</div>
                            <div className="text-xs text-slate-400 truncate max-w-xs">{f.comment}</div>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <div className="flex items-center gap-0.5 justify-center">
                              {Array.from({length:5}).map((_,i) => (
                                <Star key={i} size={12} className={i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'} />
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-left text-xs text-slate-400 whitespace-nowrap">
                            {new Date(f.created_at).toLocaleDateString('he-IL')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === 'analytics' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="סריקות היום"    value={evDay(events,'view')}            icon={Eye}              accent="#6366f1" />
                <StatCard label="סריקות השבוע"   value={evWeek(events,'view')}           icon={TrendingUp}       accent="#6366f1" />
                <StatCard label="גוגל היום"       value={evDay(events,'click_google')}    icon={MousePointerClick} accent="#10b981" />
                <StatCard label="גוגל השבוע"      value={evWeek(events,'click_google')}   icon={MousePointerClick} accent="#10b981" />
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 mb-4">סריקות NFC — 7 ימים</h3>
                <LineChart data={scansWeek} color="#6366f1" />
                <div className="flex justify-between mt-2">
                  {scansWeek.map((d,i) => <span key={i} className="text-xs text-slate-400">{d.label}</span>)}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 mb-4">פילוח לחיצות</h3>
                <div className="flex flex-col gap-4">
                  {donutData.map(seg => {
                    const total = donutData.reduce((s,g) => s+g.value,0) || 1
                    const pct = Math.round((seg.value/total)*100)
                    return (
                      <div key={seg.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold text-slate-700">{seg.label}</span>
                          <span className="text-slate-400">{seg.value} · {pct}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${pct}%`, background: seg.color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── FEEDBACK ── */}
          {activeTab === 'feedback' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-black text-slate-800">כל הביקורות הפרטיות</h3>
                <p className="text-xs text-slate-400 mt-0.5">{feedback.length} ביקורות סה"כ</p>
              </div>
              {feedback.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">אין ביקורות עדיין</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500 font-semibold">
                      <th className="text-right px-5 py-3">לקוח</th>
                      <th className="text-right px-5 py-3">הודעה</th>
                      <th className="text-center px-5 py-3">דירוג</th>
                      <th className="text-left px-5 py-3">תאריך</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.map(f => (
                      <tr key={f.id} className="border-t border-slate-50 hover:bg-slate-50 transition">
                        <td className="px-5 py-3 whitespace-nowrap">
                          <p className="font-semibold text-slate-800">{f.customer_name || 'אנונימי'}</p>
                          {f.customer_phone && <p className="text-xs text-slate-400" dir="ltr">{f.customer_phone}</p>}
                        </td>
                        <td className="px-5 py-3 max-w-xs">
                          <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{f.comment}</p>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center gap-0.5 justify-center">
                            {Array.from({length:5}).map((_,i) => (
                              <Star key={i} size={12} className={i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'} />
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-left text-xs text-slate-400 whitespace-nowrap">
                          {new Date(f.created_at).toLocaleDateString('he-IL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <div className="max-w-lg">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
                <h3 className="font-black text-slate-800">פרטי העסק</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {store.logo_url
                      ? <Image src={store.logo_url} alt="" width={64} height={64} className="object-cover w-full h-full" />
                      : <Store size={24} className="text-slate-300" />}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-lg">{store.name}</p>
                    <p className="text-xs text-slate-400" dir="ltr">myreviewgate.com/{store.slug}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-sm text-slate-600">
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">מייל התראות</span>
                    <span dir="ltr">{store.owner_email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">קישור גוגל</span>
                    <a href={store.google_review_url} target="_blank" rel="noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1">
                      פתח <ExternalLink size={11} />
                    </a>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">קישורים מותאמים</span>
                    <span>{store.custom_links?.filter(l=>l.url&&l.label).length || 0} קישורים</span>
                  </div>
                </div>
                <button onClick={() => setShowForm(true)}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition">
                  <Edit2 size={14} /> ערוך פרטים
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 flex items-center justify-around py-2 z-20">
        {[
          { id:'overview', icon: Home, label:'דשבורד' },
          { id:'analytics', icon: BarChart2, label:'אנליטיקה' },
          { id:'feedback', icon: MessageSquare, label:'ביקורות' },
          { id:'settings', icon: Settings, label:'הגדרות' },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition ${activeTab===id ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Icon size={20} />
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        ))}
      </nav>

      {showForm && store && (
        <StoreForm initial={store} onSave={handleSaveStore} onCancel={() => setShowForm(false)} />
      )}
    </div>
  )
}
