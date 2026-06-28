'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  LogOut, Edit2, Copy, Check, ExternalLink, RefreshCw, Store,
  Clock, Star, BarChart2, Settings, Home, MousePointerClick, ChevronRight, AlertCircle,
} from 'lucide-react'
import StoreForm from '@/components/StoreForm'
import Logo from '@/components/Logo'
import Image from 'next/image'

/* ── helpers ─────────────────────────────────────── */
const ev     = (arr, type) => arr.filter(e => e.event_type === type).length
const evDay  = (arr, type) => { const d = new Date(); d.setHours(0,0,0,0); return arr.filter(e => e.event_type === type && new Date(e.created_at) >= d).length }
const evWeek = (arr, type) => { const d = new Date(); d.setDate(d.getDate()-7); return arr.filter(e => e.event_type === type && new Date(e.created_at) >= d).length }

function monthlyData(events, types) {
  const days = Array.from({length:30}, (_,i) => { const d = new Date(); d.setDate(d.getDate()-29+i); return d })
  return days.map(day => {
    const next = new Date(day); next.setDate(next.getDate()+1)
    const counts = {}
    types.forEach(t => {
      counts[t] = events.filter(e => e.event_type===t && new Date(e.created_at)>=day && new Date(e.created_at)<next).length
    })
    return { label: day.toLocaleDateString('he-IL',{day:'numeric',month:'numeric'}), ...counts }
  })
}

function thisMonth(arr) {
  const d = new Date(); d.setDate(1); d.setHours(0,0,0,0)
  return arr.filter(f => new Date(f.created_at) >= d).length
}

/* ── Area Chart (SVG) ──────────────────────────── */
function ReviewsOverviewChart({ data, series }) {
  const W = 500, H = 140, padL = 28, padR = 8, padT = 12, padB = 24
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const maxVal = Math.max(...data.flatMap(d => series.map(s => d[s.key] || 0)), 1)
  const xStep = chartW / (data.length - 1)

  // Show only every 5th label
  const labelInterval = Math.ceil(data.length / 6)

  const gridLines = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{overflow:'visible'}}>
      {/* Grid lines */}
      {gridLines.map(pct => {
        const y = padT + (1 - pct) * chartH
        return (
          <g key={pct}>
            <line x1={padL} x2={W - padR} y1={y} y2={y}
              stroke="#f1f5f9" strokeWidth="1"/>
            {pct > 0 && (
              <text x={padL - 4} y={y + 3.5} textAnchor="end"
                fontSize="7" fill="#94a3b8">
                {Math.round(pct * maxVal)}
              </text>
            )}
          </g>
        )
      })}

      {/* Area fills */}
      {[...series].reverse().map(s => {
        const pts = data.map((d, i) => {
          const x = padL + i * xStep
          const y = padT + (1 - (d[s.key]||0) / maxVal) * chartH
          return [x, y]
        })
        const pathD = `M ${pts[0][0]},${pts[0][1]} ` +
          pts.slice(1).map(p => `L ${p[0]},${p[1]}`).join(' ') +
          ` L ${pts[pts.length-1][0]},${padT + chartH} L ${pts[0][0]},${padT + chartH} Z`
        return (
          <path key={`area-${s.key}`} d={pathD}
            fill={s.color} opacity="0.08"/>
        )
      })}

      {/* Lines */}
      {series.map(s => {
        const pts = data.map((d, i) => {
          const x = padL + i * xStep
          const y = padT + (1 - (d[s.key]||0) / maxVal) * chartH
          return `${x},${y}`
        }).join(' ')
        return (
          <polyline key={s.key} points={pts}
            fill="none" stroke={s.color} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"/>
        )
      })}

      {/* Dots on last point */}
      {series.map(s => {
        const last = data[data.length - 1]
        const x = padL + (data.length - 1) * xStep
        const y = padT + (1 - (last[s.key]||0) / maxVal) * chartH
        return (
          <circle key={`dot-${s.key}`} cx={x} cy={y} r="3"
            fill={s.color} stroke="white" strokeWidth="1.5"/>
        )
      })}

      {/* X labels */}
      {data.map((d, i) => {
        if (i % labelInterval !== 0 && i !== data.length - 1) return null
        const x = padL + i * xStep
        return (
          <text key={i} x={x} y={H - 4} textAnchor="middle"
            fontSize="7" fill="#94a3b8">
            {d.label}
          </text>
        )
      })}

      {/* Baseline */}
      <line x1={padL} x2={W - padR} y1={padT + chartH} y2={padT + chartH}
        stroke="#e2e8f0" strokeWidth="1"/>
    </svg>
  )
}

/* ── Donut Chart (SVG) ──────────────────────────── */
function DonutChart({ segments }) {
  const total = segments.reduce((s, g) => s + g.value, 0) || 1
  const R = 40, cx = 50, cy = 50, stroke = 16
  const circ = 2 * Math.PI * R
  let offset = 0
  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28 mx-auto">
      {total === 0
        ? <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        : segments.map((seg, i) => {
            const pct = seg.value / total
            const dash = pct * circ
            const el = (
              <circle key={i} cx={cx} cy={cy} r={R} fill="none"
                stroke={seg.color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-(offset * circ)}
                transform="rotate(-90 50 50)"
                strokeLinecap="butt"
              />
            )
            offset += pct
            return el
          })
      }
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
    { id: 'overview',    label: 'דשבורד',      icon: Home },
    { id: 'all_reviews', label: 'כל הביקורות', icon: Star },
    { id: 'analytics',   label: 'אנליטיקה',    icon: MousePointerClick },
    { id: 'settings',    label: 'הגדרות',       icon: Settings },
  ]
  return (
    <aside className="w-52 shrink-0 bg-slate-900 min-h-screen flex flex-col py-6 px-3 gap-1" dir="rtl">
      <div className="px-2 mb-6">
        <Logo size="sm" theme="dark" />
      </div>
      {nav.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => setActive(id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-right ${
            active === id
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}>
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active === id ? 'bg-white' : 'bg-slate-600'}`} />
          {label}
        </button>
      ))}
      <div className="mt-auto">
        <button onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-all w-full text-right">
          <LogOut size={15} /> התנתק
        </button>
      </div>
    </aside>
  )
}

/* ── Main Dashboard ──────────────────────────────── */
function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  const [user,             setUser]             = useState(null)
  const [store,            setStore]            = useState(null)
  const [feedback,         setFeedback]         = useState([])
  const [events,           setEvents]           = useState([])
  const [googleReviews,    setGoogleReviews]    = useState([])
  const [googleConnected,  setGoogleConnected]  = useState(false)
  const [googleSyncing,    setGoogleSyncing]    = useState(false)
  const [googleRating,     setGoogleRating]     = useState(null)
  const [googleTotal,      setGoogleTotal]      = useState(null)
  const [placeId,          setPlaceId]          = useState('')
  const [placeIdSaving,    setPlaceIdSaving]    = useState(false)
  const [placeIdMsg,       setPlaceIdMsg]       = useState(null)
  const [showForm,         setShowForm]         = useState(false)
  const [loading,          setLoading]          = useState(true)
  const [activeTab,        setActiveTab]        = useState('overview')
  const [copied,           setCopied]           = useState(false)
  const [googleBanner,     setGoogleBanner]     = useState(null) // 'connected' | 'error'

  useEffect(() => {
    if (searchParams.get('google_connected') === '1') {
      setGoogleBanner('connected')
      setTimeout(() => setGoogleBanner(null), 5000)
      window.history.replaceState({}, '', '/dashboard')
    }
    if (searchParams.get('google_error')) {
      setGoogleBanner('error')
      setTimeout(() => setGoogleBanner(null), 5000)
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams])

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

      // Fetch Google reviews
      fetch('/api/google/reviews', { cache: 'no-store' })
        .then(r => r.json())
        .then(d => {
          setGoogleConnected(d.connected ?? false)
          setGoogleReviews(d.reviews ?? [])
          setGoogleRating(d.google_rating ?? null)
          setGoogleTotal(d.google_review_count ?? null)
        })
        .catch(() => {})

      // Load saved place_id
      if (storeData.google_place_id) setPlaceId(storeData.google_place_id)
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

  async function syncGoogleReviews() {
    if (!store || googleSyncing || !placeId) return
    setGoogleSyncing(true)
    setPlaceIdMsg(null)
    try {
      const res = await fetch('/api/google/places-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ place_id: placeId }),
      })
      const d = await res.json()
      if (res.ok) {
        setGoogleConnected(true)
        setPlaceIdMsg({ ok: true, text: `נמשכו ${d.synced} ביקורות${d.business_name ? ` מ-${d.business_name}` : ''}${d.overall_rating ? ` · דירוג ${d.overall_rating}★ מתוך ${d.total_reviews} ביקורות` : ''}` })
        const gr = await fetch('/api/google/reviews', { cache: 'no-store' }).then(r => r.json())
        setGoogleReviews(gr.reviews ?? [])
        setGoogleRating(gr.google_rating ?? null)
        setGoogleTotal(gr.google_review_count ?? null)
      } else {
        setPlaceIdMsg({ ok: false, text: d.error ?? 'שגיאה' })
      }
    } finally {
      setGoogleSyncing(false)
    }
  }
  async function copyLink() {
    await navigator.clipboard.writeText(`https://myreviewgate.com/${store?.slug}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <RefreshCw size={22} className="animate-spin text-amber-500" />
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

  /* ── computed data ── */
  const avgRating      = feedback.length ? (feedback.reduce((s,f) => s + (f.rating||0), 0) / feedback.length).toFixed(1) : '—'
  const avgRatingNum   = feedback.length ? feedback.reduce((s,f) => s + (f.rating||0), 0) / feedback.length : 0
  const totalScans     = ev(events, 'view')
  const googleClicks   = ev(events, 'click_google')
  const privateClicks  = ev(events, 'click_private')
  const customClicks   = ev(events, 'click_custom')
  const newThisMonth   = thisMonth(feedback)
  const responseRate   = totalScans > 0 ? Math.round(((googleClicks + privateClicks + customClicks) / totalScans) * 100) : 0

  const chartData = monthlyData(events, ['view','click_google','click_private'])
  const chartSeries = [
    { key:'view',          color:'#f59e0b', label:'סריקות' },
    { key:'click_google',  color:'#6366f1', label:'Google' },
    { key:'click_private', color:'#10b981', label:'פרטי' },
  ]

  const donutData = [
    { label:'Google',   value: googleClicks,  color:'#f59e0b' },
    { label:'פרטי',     value: privateClicks, color:'#6366f1' },
    { label:'קישורים',  value: customClicks,  color:'#10b981' },
    { label:'WhatsApp', value: ev(events,'click_whatsapp'), color:'#25D366' },
  ].filter(s => s.value > 0)

  const today = new Date().toLocaleDateString('he-IL', { year:'numeric', month:'long', day:'numeric' })
  const dateRange = (() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return `${start.toLocaleDateString('he-IL',{day:'numeric',month:'short'})} – ${now.toLocaleDateString('he-IL',{day:'numeric',month:'short',year:'numeric'})}`
  })()

  return (
    <div className="flex min-h-screen bg-slate-50" dir="ltr">

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between" dir="rtl">
          <div>
            <h1 className="text-lg font-black text-slate-900">
              {activeTab === 'overview' ? 'דשבורד' : activeTab === 'all_reviews' ? 'כל הביקורות' : activeTab === 'analytics' ? 'אנליטיקה' : 'הגדרות'}
            </h1>
            <p className="text-xs text-slate-400">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {store.logo_url
                  ? <Image src={store.logo_url} alt="" width={24} height={24} className="object-cover w-full h-full" />
                  : <Store size={12} className="text-amber-500" />}
              </div>
              <span className="text-sm font-semibold text-slate-700">{store.name}</span>
            </div>
            <button onClick={() => setActiveTab('settings')}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm">
              <Edit2 size={13} /> ערוך עסק
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6" dir="rtl">

          {/* Google connection banner */}
          {googleBanner === 'connected' && (
            <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5 text-emerald-800 text-sm font-semibold">
              <Check size={16} className="text-emerald-600 flex-shrink-0" />
              חשבון Google Business חובר בהצלחה! הביקורות נמשכות...
            </div>
          )}
          {googleBanner === 'error' && (
            <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 text-red-800 text-sm font-semibold">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
              אירעה שגיאה בחיבור Google. נסה שוב.
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-5 max-w-5xl">

              {/* Google connect banner */}
              {!googleConnected && (
                <a href="/api/google/auth"
                  className="flex items-center gap-3 bg-white border border-blue-100 rounded-2xl px-5 py-3.5 hover:bg-blue-50 transition group">
                  <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">חבר את Google Business שלך</p>
                    <p className="text-xs text-slate-400">משוך ביקורות Google ישירות לדשבורד</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 transition flex-shrink-0" />
                </a>
              )}
              {googleConnected && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3.5">
                  <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <p className="text-sm font-semibold text-emerald-800 flex-1">Google Business מחובר ✓</p>
                  <span className="text-xs text-emerald-600">מתעדכן אוטומטית כל יום</span>
                </div>
              )}

              {/* NFC link bar */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                <span className="text-xs font-bold text-amber-600 whitespace-nowrap">קישור NFC/QR:</span>
                <span className="text-xs font-mono text-amber-800 flex-1 truncate" dir="ltr">https://myreviewgate.com/{store.slug}</span>
                <button onClick={copyLink} className="flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-400 transition flex-shrink-0">
                  {copied ? <><Check size={12}/> הועתק!</> : <><Copy size={12}/> העתק</>}
                </button>
                <a href={`/${store.slug}`} target="_blank" rel="noreferrer"
                  className="p-1.5 text-amber-500 hover:text-amber-700 transition flex-shrink-0">
                  <ExternalLink size={14}/>
                </a>
              </div>

              {/* Stats — 4 cards */}
              {(() => {
                const totalGoogleReviews = googleTotal ?? 0
                const totalPrivate = feedback.length
                const combinedTotal = totalGoogleReviews + totalPrivate
                const googleAvg = googleRating ? Number(googleRating) : 0
                const privateAvg = avgRatingNum
                const combinedAvg = (googleAvg && privateAvg)
                  ? ((googleAvg * totalGoogleReviews + privateAvg * totalPrivate) / (combinedTotal || 1)).toFixed(1)
                  : (googleAvg || privateAvg || 0).toFixed(1)
                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label:'סה"כ ביקורות', value: combinedTotal.toLocaleString(), sub: `${totalGoogleReviews} Google · ${totalPrivate} פרטיות` },
                      { label:'דירוג ממוצע', value: combinedAvg, stars: parseFloat(combinedAvg), sub: 'ממוצע כולל' },
                      { label:'חדשות החודש', value: newThisMonth.toString(), sub: 'ביקורות פרטיות' },
                      { label:'סריקות NFC', value: (store.nfc_scans ?? 0).toLocaleString(), sub: 'סה"כ כניסות לדף' },
                    ].map(s => (
                      <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-[11px] text-slate-400 mb-1 font-medium">{s.label}</p>
                        <p className="text-2xl font-black text-slate-900 leading-none">{s.value}</p>
                        {s.stars > 0 && s.label === 'דירוג ממוצע' && (
                          <p className="text-amber-400 text-sm leading-tight mt-0.5">
                            {'★'.repeat(Math.round(s.stars))}{'☆'.repeat(5 - Math.round(s.stars))}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {/* Charts row */}
              <div className="grid lg:grid-cols-5 gap-4">
                {/* Reviews Overview */}
                <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-black text-slate-800 text-sm">ביקורות — 30 יום</h3>
                    <span className="text-[10px] text-slate-400 border border-slate-200 rounded-lg px-2 py-1">{dateRange}</span>
                  </div>
                  <ReviewsOverviewChart data={chartData} series={chartSeries}/>
                  <div className="flex items-center gap-4 mt-3">
                    {chartSeries.map(s => (
                      <div key={s.key} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{background:s.color}}/>
                        <span className="text-[10px] text-slate-500">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews by Platform donut */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <h3 className="font-black text-slate-800 text-sm mb-3">ביקורות לפי פלטפורמה</h3>
                  {(() => {
                    const platformData = [
                      { label: 'Google', value: googleTotal ?? 0, color: '#4285F4' },
                      { label: 'פרטיות', value: feedback.length, color: '#f59e0b' },
                    ].filter(s => s.value > 0)
                    return platformData.length > 0 ? (
                      <>
                        <DonutChart segments={platformData}/>
                        <div className="flex flex-col gap-1.5 mt-3">
                          {platformData.map(s => {
                            const total = platformData.reduce((a,b) => a+b.value, 0) || 1
                            return (
                              <div key={s.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:s.color}}/>
                                  <span className="text-[10px] text-slate-500">{s.label}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-600">{s.value.toLocaleString()} ({Math.round(s.value/total*100)}%)</span>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-slate-300 text-sm">אין נתונים עדיין</div>
                    )
                  })()}
                </div>
              </div>

              {/* Latest Reviews — unified */}
              {(() => {
                const allLatest = [
                  ...googleReviews.map(r => ({ ...r, source: 'google' })),
                  ...feedback.map(f => ({ ...f, source: 'private' })),
                ].sort((a,b) => new Date(b.published_at||b.created_at) - new Date(a.published_at||a.created_at)).slice(0,8)
                return (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                      <h3 className="font-black text-slate-800 text-sm">ביקורות אחרונות</h3>
                      <button onClick={() => setActiveTab('all_reviews')}
                        className="text-[11px] text-amber-500 font-bold hover:underline flex items-center gap-1">
                        כל הביקורות <ChevronRight size={12}/>
                      </button>
                    </div>
                    {allLatest.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-sm">אין ביקורות עדיין</div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {allLatest.map(r => (
                          <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm overflow-hidden ${r.source==='google' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                              {r.author_photo
                                ? <img src={r.author_photo} alt="" className="w-full h-full object-cover"/>
                                : (r.author_name||r.customer_name||'א').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-sm font-semibold text-slate-800">{r.author_name||r.customer_name||'אנונימי'}</p>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${r.source==='google' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
                                  {r.source==='google' ? 'Google' : 'פרטי'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 truncate">{r.comment||r.feedback||''}</p>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {Array.from({length:5}).map((_,i) => (
                                <span key={i} className={`text-xs ${i < r.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-300 flex-shrink-0 whitespace-nowrap">
                              {new Date(r.published_at||r.created_at).toLocaleDateString('he-IL')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Rating distribution — all sources */}
              {(() => {
                const allRated = [
                  ...googleReviews.filter(r => r.rating).map(r => ({ rating: r.rating })),
                  ...feedback.filter(f => f.rating).map(f => ({ rating: f.rating })),
                ]
                const total = allRated.length
                return (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-slate-800 text-sm">פילוח דירוגים</h3>
                      <span className="text-[10px] text-slate-400">{total} ביקורות עם דירוג</span>
                    </div>
                    {total === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-4">אין ביקורות עדיין</p>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {[5,4,3,2,1].map(star => {
                          const count = allRated.filter(r => Math.round(r.rating) === star).length
                          const pct = Math.round((count / total) * 100)
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-xs font-semibold text-slate-500 w-3 text-left">{star}</span>
                              <span className="text-amber-400 text-xs">★</span>
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full transition-all" style={{width:`${pct}%`}}/>
                              </div>
                              <span className="text-xs text-slate-400 w-8 text-left">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* ── ALL REVIEWS ── */}
          {activeTab === 'all_reviews' && (() => {
            const allReviews = [
              ...googleReviews.map(r => ({ ...r, source: 'google' })),
              ...feedback.map(f => ({ ...f, source: 'private' })),
            ].sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))

            return (
              <div className="flex flex-col gap-4 max-w-5xl">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[11px] text-slate-400 mb-1">סה"כ ביקורות Google</p>
                    <p className="text-2xl font-black text-slate-900">{googleTotal?.toLocaleString() ?? '—'}</p>
                    {googleRating && <p className="text-xs text-amber-500 font-bold mt-0.5">{Number(googleRating).toFixed(1)} ★</p>}
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[11px] text-slate-400 mb-1">ביקורות פרטיות</p>
                    <p className="text-2xl font-black text-slate-900">{feedback.length}</p>
                    {feedback.length > 0 && <p className="text-xs text-amber-500 font-bold mt-0.5">{avgRating} ★</p>}
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[11px] text-slate-400 mb-1">מוצגות כאן</p>
                    <p className="text-2xl font-black text-slate-900">{allReviews.length}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">5 Google + כל הפרטיות</p>
                  </div>
                </div>

                {/* Unified list */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="font-black text-slate-800">כל הביקורות</h3>
                  </div>
                  {allReviews.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-sm">אין ביקורות עדיין</div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {allReviews.map(r => (
                        <div key={r.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm overflow-hidden ${r.source === 'google' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                            {r.author_photo
                              ? <img src={r.author_photo} alt="" className="w-full h-full object-cover" />
                              : (r.author_name || r.customer_name || 'א').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-slate-800 text-sm">{r.author_name || r.customer_name || 'אנונימי'}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.source === 'google' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                {r.source === 'google' ? 'Google' : 'פרטי'}
                              </span>
                              <div className="flex items-center gap-0.5">
                                {Array.from({length:5}).map((_,i) => (
                                  <span key={i} className={`text-xs ${i < r.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                                ))}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(r.published_at || r.created_at).toLocaleDateString('he-IL')}
                              </span>
                            </div>
                            {(r.comment || r.feedback) && (
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.comment || r.feedback}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}


          {/* ── ANALYTICS ── */}
          {activeTab === 'analytics' && (
            <div className="flex flex-col gap-4 max-w-5xl">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label:'סריקות היום',   value: evDay(events,'view'),           color:'#f59e0b' },
                  { label:'סריקות השבוע',  value: evWeek(events,'view'),          color:'#f59e0b' },
                  { label:'גוגל היום',      value: evDay(events,'click_google'),   color:'#6366f1' },
                  { label:'גוגל השבוע',     value: evWeek(events,'click_google'),  color:'#6366f1' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <p className="text-[11px] text-slate-400 mb-1">{s.label}</p>
                    <p className="text-2xl font-black text-slate-900">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-slate-800 text-sm">Reviews Overview — 30 יום</h3>
                  <div className="flex items-center gap-4">
                    {chartSeries.map(s => (
                      <div key={s.key} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{background:s.color}}/>
                        <span className="text-[10px] text-slate-500">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ReviewsOverviewChart data={chartData} series={chartSeries}/>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 text-sm mb-4">פילוח לחיצות</h3>
                <div className="flex flex-col gap-3">
                  {donutData.length === 0
                    ? <p className="text-slate-400 text-sm text-center py-4">אין נתונים עדיין</p>
                    : donutData.map(seg => {
                        const total = donutData.reduce((s,g) => s+g.value,0) || 1
                        const pct = Math.round((seg.value/total)*100)
                        return (
                          <div key={seg.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-700">{seg.label}</span>
                              <span className="text-slate-400">{seg.value} · {pct}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{width:`${pct}%`, background:seg.color}}/>
                            </div>
                          </div>
                        )
                      })
                  }
                </div>
              </div>
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
                      ? <Image src={store.logo_url} alt="" width={64} height={64} className="object-cover w-full h-full"/>
                      : <Store size={24} className="text-slate-300"/>}
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
                      className="text-amber-500 hover:underline flex items-center gap-1">
                      פתח <ExternalLink size={11}/>
                    </a>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">קישורים מותאמים</span>
                    <span>{store.custom_links?.filter(l=>l.url&&l.label).length || 0} קישורים</span>
                  </div>
                </div>
                <button onClick={() => setShowForm(true)}
                  className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 rounded-xl transition">
                  <Edit2 size={14}/> ערוך פרטים
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Sidebar — RIGHT */}
      <div className="hidden md:flex">
        <Sidebar active={activeTab} setActive={setActiveTab} onLogout={handleLogout}/>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 flex items-center justify-around py-2 z-20" dir="rtl">
        {[
          { id:'overview',    icon: Home,             label:'דשבורד' },
          { id:'all_reviews', icon: Star,             label:'ביקורות' },
          { id:'analytics',   icon: MousePointerClick, label:'אנליטיקה' },
          { id:'settings',    icon: Settings,         label:'הגדרות' },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition ${activeTab===id ? 'text-amber-500' : 'text-slate-400'}`}>
            <Icon size={20}/>
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        ))}
      </nav>

      {showForm && store && (
        <StoreForm initial={store} onSave={handleSaveStore} onCancel={() => setShowForm(false)}/>
      )}
    </div>
  )
}

export default function DashboardPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/></div>}>
      <DashboardPage />
    </Suspense>
  )
}
