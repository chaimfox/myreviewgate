'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  LogOut, Edit2, Copy, Check, ExternalLink, RefreshCw, Store,
  Clock, Star, BarChart2, Settings, Home, ChevronRight, AlertCircle,
  MapPin, Plus, Trash2, X,
} from 'lucide-react'
import StoreForm from '@/components/StoreForm'
import Logo from '@/components/Logo'
import Image from 'next/image'

/* ── helpers ─────────────────────────────────────── */
const ev     = (arr, type) => arr.filter(e => e.event_type === type).length

function monthlyData(eventsArr, types, rangeDays = 30) {
  const days = Array.from({length:rangeDays}, (_,i) => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-(rangeDays-1)+i); return d })
  return days.map(day => {
    const next = new Date(day); next.setDate(next.getDate()+1)
    const counts = {}
    types.forEach(t => {
      counts[t] = eventsArr.filter(e => e.event_type===t && new Date(e.created_at)>=day && new Date(e.created_at)<next).length
    })
    return { label: day.toLocaleDateString('he-IL',{day:'numeric',month:'numeric'}), ...counts }
  })
}

function thisMonth(arr) {
  const d = new Date(); d.setDate(1); d.setHours(0,0,0,0)
  return arr.filter(f => new Date(f.created_at) >= d).length
}

/* ── CSV export (opens natively in Excel) ─────────── */
function reviewsToCSV(rows) {
  const headers = ['תאריך', 'מקור', 'דירוג', 'שם/אימייל', 'טלפון', 'הערה', 'תגובת בעל העסק']
  const cell = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`
  const lines = [headers.map(cell).join(',')]
  rows.forEach(r => {
    lines.push([
      new Date(r.published_at || r.created_at).toLocaleDateString('he-IL'),
      r.source === 'google' ? 'Google' : 'פרטי',
      r.rating ?? '',
      r.author_name || r.customer_email || r.customer_name || '',
      r.customer_phone || '',
      r.comment || r.feedback || '',
      r.owner_reply || '',
    ].map(cell).join(','))
  })
  // Leading BOM so Excel detects UTF-8 and renders Hebrew correctly.
  return '﻿' + lines.join('\r\n')
}

function downloadReviewsCSV(rows, filename) {
  const blob = new Blob([reviewsToCSV(rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/* ── Scan Outcome Chart (SVG stacked bars) ──────────
   Each bar = scans that day. Segments show what happened after the
   scan: routed to Google, sent private feedback, or no action taken.
   This reframes the panel around the funnel instead of 3 crossing
   lines that were hard to read together. ── */
const FUNNEL_COLORS = { google: '#4285F4', private: '#10b981', none: '#e2e8f0' }

function ReviewsOverviewChart({ data }) {
  const W = 500, H = 140, padL = 28, padR = 8, padT = 12, padB = 24
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  // Total is at least scans, but never lets a click outnumber its own scan count
  // hide the click — some stores' scan tracking undercounts, and the clicks are the
  // ground truth for "something happened that day".
  const dayTotal = d => Math.max(d.view || 0, (d.click_google || 0) + (d.click_private || 0))
  const maxVal = Math.max(...data.map(dayTotal), 1)
  const n = data.length
  const slot = chartW / n
  const barW = Math.max(slot * 0.55, 1.5)

  const labelInterval = Math.ceil(n / 6)
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

      {/* Stacked bars: google → private → no action, per day */}
      {data.map((d, i) => {
        const google  = d.click_google || 0
        const priv    = d.click_private || 0
        const total   = dayTotal(d)
        const none    = Math.max(total - google - priv, 0)
        const x = padL + i * slot + (slot - barW) / 2
        const scale = v => (v / maxVal) * chartH

        let yCursor = padT + chartH
        const segments = [
          { key:'google',  value: google, color: FUNNEL_COLORS.google },
          { key:'private', value: priv,   color: FUNNEL_COLORS.private },
          { key:'none',    value: none,   color: FUNNEL_COLORS.none },
        ].map(seg => {
          const h = scale(seg.value)
          yCursor -= h
          return { ...seg, y: yCursor, h }
        })

        return (
          <g key={i}>
            <title>{`${d.label} — ${total} סריקות · ${google} לגוגל · ${priv} פידבק פרטי`}</title>
            {segments.map(seg => seg.h > 0 && (
              <rect key={seg.key} x={x} y={seg.y} width={barW} height={seg.h}
                fill={seg.color} rx="1"/>
            ))}
          </g>
        )
      })}

      {/* X labels */}
      {data.map((d, i) => {
        if (i % labelInterval !== 0 && i !== n - 1) return null
        const x = padL + i * slot + slot / 2
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
function Sidebar({ active, setActive, onLogout, isChain }) {
  const nav = [
    { id: 'overview',    label: 'דשבורד',      icon: Home },
    ...(isChain ? [{ id: 'locations', label: 'סניפים', icon: MapPin }] : []),
    { id: 'all_reviews', label: 'כל הביקורות', icon: Star },
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
  const [chartRangeDays,   setChartRangeDays]   = useState(30)
  const [googleReviews,    setGoogleReviews]    = useState([])
  const [googleConnected,  setGoogleConnected]  = useState(false)
  const [googleSyncing,    setGoogleSyncing]    = useState(false)
  const [googleRating,     setGoogleRating]     = useState(null)
  const [googleTotal,      setGoogleTotal]      = useState(null)
  const [placeId,          setPlaceId]          = useState('')
  const [placeIdMsg,       setPlaceIdMsg]       = useState(null)
  const [showForm,         setShowForm]         = useState(false)
  const [loading,          setLoading]          = useState(true)
  const [activeTab,        setActiveTab]        = useState('overview')
  const [copied,           setCopied]           = useState(false)
  const [googleBanner,     setGoogleBanner]     = useState(null) // 'connected' | 'error'
  const [locations,        setLocations]        = useState([])
  const [chainInfo,        setChainInfo]        = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null) // null = all chain
  const [showAddLocation,  setShowAddLocation]  = useState(false)
  const [locationForm,     setLocationForm]     = useState({ name: '', suffix: '', address: '', google_review_url: '' })
  const [locationSaving,   setLocationSaving]   = useState(false)
  const [locationMsg,      setLocationMsg]      = useState(null)
  const [replyOpenId,      setReplyOpenId]      = useState(null)
  const [replyDraft,       setReplyDraft]       = useState('')
  const [replySaving,      setReplySaving]      = useState(false)

  useEffect(() => {
    if (searchParams.get('google_connected') === '1') {
      setGoogleBanner('connected')
      setTimeout(() => setGoogleBanner(null), 5000)
      window.history.replaceState({}, '', '/dashboard')
      // Auto-sync all reviews after connecting
      fetch('/api/google/oauth-sync', { method: 'POST' })
        .then(r => r.json())
        .then(() => fetch('/api/google/reviews', { cache: 'no-store' }).then(r => r.json()))
        .then(d => {
          setGoogleConnected(d.connected ?? false)
          setGoogleReviews(d.reviews ?? [])
          setGoogleRating(d.google_rating ?? null)
          setGoogleTotal(d.google_review_count ?? null)
        })
        .catch(() => {})
    }
    if (searchParams.get('google_error')) {
      setGoogleBanner('error')
      setTimeout(() => setGoogleBanner(null), 5000)
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams])

  const [isBranchManager, setIsBranchManager] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role, location_id').eq('id', session.user.id).single()
      if (profile?.role === 'super_admin') { router.replace('/admin'); return }
      if (profile?.role === 'branch_manager' && profile?.location_id) {
        setIsBranchManager(true)
      }
      setUser({ ...session.user, _location_id: profile?.location_id ?? null })
    })
  }, [router, supabase])

  const fetchData = useCallback(async () => {
    if (!user) return

    // Branch manager — load location data directly (no store)
    if (user._location_id) {
      const { createClient: createSvc } = await import('@supabase/supabase-js').catch(() => ({}))
      // Use public client — RLS will allow reading their own location
      const { data: loc } = await supabase
        .from('locations')
        .select('*, stores(id, name, logo_url, google_review_url, custom_links, status, type, slug)')
        .eq('id', user._location_id)
        .single()

      if (loc) {
        const parentStore = loc.stores
        // Build a synthetic store object so the rest of the UI works
        setStore({
          ...parentStore,
          _is_branch_manager: true,
        })
        setSelectedLocation(loc)
        setLocations([loc])

        const [{ data: fbData }, { data: evData }] = await Promise.all([
          supabase.from('feedback').select('*').eq('location_id', loc.id).order('created_at', { ascending: false }),
          supabase.from('analytics_events').select('*').eq('location_id', loc.id).order('created_at', { ascending: false }),
        ])
        setFeedback(fbData ?? [])
        setEvents(evData ?? [])
      }
      return
    }

    const { data: storeData } = await supabase.from('stores').select('*').eq('user_id', user.id).single()
    setStore(storeData ?? null)
    if (storeData?.status === 'approved') {
      const [{ data: fbData }, { data: evData }] = await Promise.all([
        supabase.from('feedback').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false }),
        supabase.from('analytics_events').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false }),
      ])
      setFeedback(fbData ?? [])
      setEvents(evData ?? [])

      fetch('/api/google/reviews', { cache: 'no-store' })
        .then(r => r.json())
        .then(d => {
          setGoogleConnected(d.connected ?? false)
          setGoogleReviews(d.reviews ?? [])
          setGoogleRating(d.google_rating ?? null)
          setGoogleTotal(d.google_review_count ?? null)
        })
        .catch(() => {})

      if (storeData.google_place_id) setPlaceId(storeData.google_place_id)

      fetch('/api/locations', { cache: 'no-store' })
        .then(r => r.json())
        .then(d => { setLocations(d.locations ?? []); setChainInfo(d.chain ?? null) })
        .catch(() => {})
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
  async function handleAddLocation(e) {
    e.preventDefault()
    setLocationSaving(true)
    setLocationMsg(null)
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationForm),  // suffix, name, address, google_review_url
      })
      const d = await res.json()
      if (!res.ok) { setLocationMsg({ ok: false, text: d.error ?? 'שגיאה' }); return }
      setLocations(prev => [...prev, d.location])
      setChainInfo(prev => prev ? { ...prev, used: prev.used + 1 } : prev)
      setShowAddLocation(false)
      setLocationForm({ name: '', suffix: '', address: '', google_review_url: '' })
    } finally {
      setLocationSaving(false)
    }
  }

  async function handleDeleteLocation(id) {
    if (!confirm('למחוק סניף זה?')) return
    await fetch(`/api/locations/${id}`, { method: 'DELETE' })
    setLocations(prev => prev.filter(l => l.id !== id))
  }

  async function handleSendReply(feedbackId) {
    if (!replyDraft.trim() || replySaving) return
    setReplySaving(true)
    try {
      const res = await fetch(`/api/feedback/${feedbackId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyDraft.trim() }),
      })
      if (res.ok) {
        setFeedback(prev => prev.map(f => f.id === feedbackId
          ? { ...f, owner_reply: replyDraft.trim(), owner_reply_at: new Date().toISOString() }
          : f))
        setReplyOpenId(null)
        setReplyDraft('')
      } else {
        const { error } = await res.json()
        alert(`שגיאה: ${error}`)
      }
    } finally {
      setReplySaving(false)
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

  /* ── filter by selected location (for chains) ── */
  const isChain = store?.type === 'chain'
  const displayFeedback = isChain && selectedLocation
    ? feedback.filter(f => f.location_id === selectedLocation.id)
    : feedback
  const displayEvents = isChain && selectedLocation
    ? events.filter(e => e.location_id === selectedLocation.id)
    : events
  const displayNfcScans = isChain && selectedLocation
    ? (selectedLocation.nfc_scans ?? 0)
    : (store?.nfc_scans ?? 0)
  // google_reviews rows carry their own location_id, so a selected branch can be
  // filtered client-side even though the store-wide googleTotal/googleRating
  // (from Google's API) can't be split per branch.
  const displayGoogleReviews = isChain && selectedLocation
    ? googleReviews.filter(r => r.location_id === selectedLocation.id)
    : googleReviews
  const displayGoogleTotal = isChain && selectedLocation
    ? displayGoogleReviews.length
    : (googleTotal ?? 0)
  const displayGoogleRating = isChain && selectedLocation
    ? (displayGoogleReviews.length
        ? displayGoogleReviews.reduce((s,r) => s + (r.rating||0), 0) / displayGoogleReviews.length
        : null)
    : (googleRating ? Number(googleRating) : null)

  /* ── computed data ── */
  const avgRating      = displayFeedback.length ? (displayFeedback.reduce((s,f) => s + (f.rating||0), 0) / displayFeedback.length).toFixed(1) : '—'
  const avgRatingNum   = displayFeedback.length ? displayFeedback.reduce((s,f) => s + (f.rating||0), 0) / displayFeedback.length : 0
  const totalScans     = ev(displayEvents, 'view')
  const googleClicks   = ev(displayEvents, 'click_google')
  const privateClicks  = ev(displayEvents, 'click_private')
  const customClicks   = ev(displayEvents, 'click_custom')
  const newThisMonth   = thisMonth(displayFeedback)
  const responseRate   = totalScans > 0 ? Math.round(((googleClicks + privateClicks + customClicks) / totalScans) * 100) : 0

  const chartData = monthlyData(displayEvents, ['view','click_google','click_private'], chartRangeDays)
  const chartLegend = [
    { key:'google',  color: FUNNEL_COLORS.google,  label:'הופנו לגוגל' },
    { key:'private', color: FUNNEL_COLORS.private, label:'פידבק פרטי' },
    { key:'none',    color: FUNNEL_COLORS.none,    label:'ללא פעולה' },
  ]
  const chartTotals = chartData.reduce((acc, d) => ({
    scans:   acc.scans   + (d.view || 0),
    google:  acc.google  + (d.click_google || 0),
    private: acc.private + (d.click_private || 0),
  }), { scans:0, google:0, private:0 })

  const donutData = [
    { label:'Google',   value: googleClicks,  color: FUNNEL_COLORS.google },
    { label:'פרטי',     value: privateClicks, color: FUNNEL_COLORS.private },
    { label:'קישורים',  value: customClicks,  color:'#6366f1' },
    { label:'WhatsApp', value: ev(displayEvents,'click_whatsapp'), color:'#25D366' },
  ].filter(s => s.value > 0)

  const today = new Date().toLocaleDateString('he-IL', { year:'numeric', month:'long', day:'numeric' })
  const dateRange = (() => {
    const now = new Date()
    if (chartRangeDays === 1) return now.toLocaleDateString('he-IL',{day:'numeric',month:'short',year:'numeric'})
    const start = new Date(now); start.setDate(start.getDate() - (chartRangeDays - 1))
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
              {activeTab === 'overview' ? 'דשבורד' : activeTab === 'locations' ? 'סניפים' : activeTab === 'all_reviews' ? 'כל הביקורות' : 'הגדרות'}
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

        {/* Branch selector — chains only, not for branch managers */}
        {isChain && locations.length > 0 && !isBranchManager && (
          <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center gap-2 overflow-x-auto" dir="rtl">
            <span className="text-[11px] font-bold text-slate-400 flex-shrink-0">סניף:</span>
            <button
              onClick={() => setSelectedLocation(null)}
              className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                !selectedLocation ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}>
              כל הרשת
            </button>
            {locations.map(loc => (
              <button key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                  selectedLocation?.id === loc.id ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}>
                {loc.name}
              </button>
            ))}
          </div>
        )}

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
                <div className="bg-white border border-blue-100 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">חבר את הביקורות שלך מ-Google</p>
                      <p className="text-xs text-slate-400">
                        הדבק את ה-Place ID של העסק שלך —{' '}
                        <a href="https://developers.google.com/maps/documentation/places/web-service/place-id#find-id"
                          target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          איך מוצאים את זה?
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={placeId} onChange={e => setPlaceId(e.target.value)}
                      placeholder="ChIJ..." dir="ltr"
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition" />
                    <button onClick={syncGoogleReviews} disabled={googleSyncing || !placeId.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50 flex-shrink-0">
                      {googleSyncing ? 'מתחבר...' : 'התחבר'}
                    </button>
                  </div>
                  {placeIdMsg && (
                    <p className={`text-xs mt-2 font-semibold ${placeIdMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>{placeIdMsg.text}</p>
                  )}
                </div>
              )}
              {googleConnected && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <p className="text-sm font-semibold text-emerald-800 flex-1">Google Business מחובר ✓</p>
                    <span className="text-xs text-emerald-600 hidden sm:block">מתעדכן אוטומטית כל יום</span>
                    <button
                      onClick={placeId ? syncGoogleReviews : async () => {
                        setGoogleSyncing(true)
                        try {
                          await fetch('/api/google/oauth-sync', { method: 'POST' })
                          const d = await fetch('/api/google/reviews', { cache: 'no-store' }).then(r => r.json())
                          setGoogleReviews(d.reviews ?? [])
                          setGoogleRating(d.google_rating ?? null)
                          setGoogleTotal(d.google_review_count ?? null)
                        } finally {
                          setGoogleSyncing(false)
                        }
                      }}
                      disabled={googleSyncing}
                      className="text-xs text-emerald-600 hover:text-emerald-800 transition flex-shrink-0 font-semibold disabled:opacity-50">
                      {googleSyncing ? 'מסנכרן...' : 'סנכרן עכשיו'}
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('להתנתק מ-Google Business?')) return
                        await fetch('/api/google/disconnect', { method: 'POST' })
                        setGoogleConnected(false)
                        setGoogleReviews([])
                        setGoogleRating(null)
                        setGoogleTotal(null)
                        setPlaceId('')
                        setPlaceIdMsg(null)
                      }}
                      className="text-xs text-slate-400 hover:text-red-500 transition flex-shrink-0 underline">
                      התנתק
                    </button>
                  </div>
                  {placeIdMsg && (
                    <p className={`text-xs mt-2 font-semibold ${placeIdMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>{placeIdMsg.text}</p>
                  )}
                </div>
              )}

              {/* NFC link bar — hidden for chain with no branch selected */}
              {(!isChain || selectedLocation) && (() => {
                const nfcSlug = selectedLocation ? selectedLocation.slug : store.slug
                const nfcUrl  = `https://myreviewgate.com/${nfcSlug}`
                return (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                    <span className="text-xs font-bold text-amber-600 whitespace-nowrap">קישור NFC/QR:</span>
                    <span className="text-xs font-mono text-amber-800 flex-1 truncate" dir="ltr">{nfcUrl}</span>
                    <button onClick={async () => {
                      await navigator.clipboard.writeText(nfcUrl)
                      setCopied(true); setTimeout(() => setCopied(false), 2000)
                    }} className="flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-400 transition flex-shrink-0">
                      {copied ? <><Check size={12}/> הועתק!</> : <><Copy size={12}/> העתק</>}
                    </button>
                    <a href={`/${nfcSlug}`} target="_blank" rel="noreferrer"
                      className="p-1.5 text-amber-500 hover:text-amber-700 transition flex-shrink-0">
                      <ExternalLink size={14}/>
                    </a>
                  </div>
                )
              })()}

              {/* Stats — 4 cards */}
              {(() => {
                const totalGoogleReviews = displayGoogleTotal
                const totalPrivate = displayFeedback.length
                const combinedTotal = totalGoogleReviews + totalPrivate
                const googleAvg = displayGoogleRating || 0
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
                      { label:'סריקות NFC', value: displayNfcScans.toLocaleString(), sub: selectedLocation ? selectedLocation.name : 'סה"כ כניסות לדף' },
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

              {/* Scan activity chart */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <h3 className="font-black text-slate-800 text-sm">פעילות סריקות — {chartRangeDays} יום</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                      {[1,7,30,90].map(d => (
                        <button key={d} onClick={() => setChartRangeDays(d)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${chartRangeDays===d ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                          {d === 1 ? 'היום' : `${d} ימים`}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap hidden sm:inline">{dateRange}</span>
                  </div>
                </div>
                {(chartTotals.scans === 0 && chartTotals.google === 0 && chartTotals.private === 0) ? (
                  <div className="flex items-center justify-center h-32 text-slate-300 text-sm">אין נתונים עדיין</div>
                ) : (
                  <>
                    <p className="text-[11px] text-slate-400 mb-2">
                      <span className="font-bold text-slate-700">{chartTotals.scans}</span> סריקות ·{' '}
                      <span className="font-bold text-slate-700">{chartTotals.google}</span> הופנו לגוגל ·{' '}
                      <span className="font-bold text-slate-700">{chartTotals.private}</span> פידבק פרטי
                    </p>
                    <ReviewsOverviewChart data={chartData}/>
                    <div className="flex items-center gap-4 mt-3">
                      {chartLegend.map(s => (
                        <div key={s.key} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{background:s.color}}/>
                          <span className="text-[10px] text-slate-500">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Breakdown donuts */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Reviews by Platform */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <h3 className="font-black text-slate-800 text-sm mb-3">ביקורות לפי פלטפורמה</h3>
                  <p className="text-[11px] text-slate-400 -mt-2 mb-3">כמה ביקורות התקבלו בכל ערוץ</p>
                  {(() => {
                    const platformData = [
                      { label: 'Google', value: displayGoogleTotal, color: FUNNEL_COLORS.google },
                      { label: 'פרטיות', value: displayFeedback.length, color: FUNNEL_COLORS.private },
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

                {/* Click breakdown */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <h3 className="font-black text-slate-800 text-sm mb-3">פילוח לחיצות</h3>
                  <p className="text-[11px] text-slate-400 -mt-2 mb-3">מה קרה אחרי שסרקו את הקוד</p>
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

              {/* Latest Reviews — unified */}
              {(() => {
                const allLatest = [
                  ...displayGoogleReviews.map(r => ({ ...r, source: 'google' })),
                  ...displayFeedback.map(f => ({ ...f, source: 'private' })),
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
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm overflow-hidden ${r.source==='google' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {r.author_photo
                                ? <img src={r.author_photo} alt="" className="w-full h-full object-cover"/>
                                : (r.author_name||r.customer_name||'א').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-sm font-semibold text-slate-800">{r.author_name||r.customer_name||'אנונימי'}</p>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${r.source==='google' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-600'}`}>
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
                  ...displayGoogleReviews.filter(r => r.rating).map(r => ({ rating: r.rating })),
                  ...displayFeedback.filter(f => f.rating).map(f => ({ rating: f.rating })),
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

          {/* ── LOCATIONS ── */}
          {activeTab === 'locations' && (
            <div className="flex flex-col gap-5 max-w-5xl">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">סניפים</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {chainInfo ? `${chainInfo.used} / ${chainInfo.max_locations} סניפים` : `${locations.length} סניפים פעילים`}
                  </p>
                </div>
                <button
                  onClick={() => { setShowAddLocation(true); setLocationMsg(null) }}
                  disabled={chainInfo && chainInfo.used >= chainInfo.max_locations}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                  <Plus size={15}/> הוסף סניף
                </button>
              </div>

              {/* Limit banner */}
              {chainInfo && chainInfo.used >= chainInfo.max_locations && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 text-amber-800 text-sm font-semibold">
                  הגעת למגבלה של {chainInfo.max_locations} סניפים. לשדרוג — צור קשר איתנו.
                </div>
              )}

              {/* Add location form */}
              {showAddLocation && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-800">סניף חדש</h3>
                    <button onClick={() => setShowAddLocation(false)} className="text-slate-300 hover:text-slate-500">
                      <X size={18}/>
                    </button>
                  </div>
                  <form onSubmit={handleAddLocation} className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">שם הסניף *</label>
                        <input
                          value={locationForm.name}
                          onChange={e => setLocationForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="סניף תל אביב"
                          required
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">מזהה סניף *</label>
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-400">
                          <span className="bg-slate-50 px-2.5 py-2.5 text-xs font-mono text-slate-500 border-r border-slate-200 whitespace-nowrap">
                            {chainInfo?.prefix || store?.slug || 'brand'}-
                          </span>
                          <input
                            value={locationForm.suffix}
                            onChange={e => setLocationForm(p => ({ ...p, suffix: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                            placeholder="tlv"
                            required
                            dir="ltr"
                            className="flex-1 px-2.5 py-2.5 text-sm focus:outline-none bg-white"
                          />
                        </div>
                        {locationForm.suffix && (
                          <p className="text-[10px] text-slate-400 mt-1" dir="ltr">
                            myreviewgate.com/{chainInfo?.prefix || store?.slug || 'brand'}-{locationForm.suffix}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">כתובת הסניף</label>
                      <input
                        value={locationForm.address}
                        onChange={e => setLocationForm(p => ({ ...p, address: e.target.value }))}
                        placeholder="רחוב דיזנגוף 1, תל אביב"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">קישור Google ביקורות</label>
                      <input
                        value={locationForm.google_review_url}
                        onChange={e => setLocationForm(p => ({ ...p, google_review_url: e.target.value }))}
                        placeholder="https://g.page/r/..."
                        dir="ltr"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    {locationMsg && (
                      <p className={`text-sm font-semibold ${locationMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>{locationMsg.text}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={locationSaving}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold py-2.5 rounded-xl transition disabled:opacity-50">
                        {locationSaving ? 'שומר...' : 'צור סניף'}
                      </button>
                      <button type="button" onClick={() => setShowAddLocation(false)}
                        className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition">
                        ביטול
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Locations grid */}
              {locations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 flex flex-col items-center gap-3">
                  <MapPin size={32} className="text-slate-200"/>
                  <p className="text-slate-400 text-sm font-semibold">אין סניפים עדיין</p>
                  <button onClick={() => setShowAddLocation(true)}
                    className="text-amber-500 text-sm font-bold hover:underline">+ הוסף את הסניף הראשון</button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locations.map(loc => (
                    <div key={loc.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-black text-slate-900 text-sm">{loc.name}</p>
                          {loc.address && <p className="text-[11px] text-slate-400 mt-0.5">{loc.address}</p>}
                        </div>
                        <button onClick={() => handleDeleteLocation(loc.id)}
                          className="text-slate-200 hover:text-red-400 transition flex-shrink-0">
                          <Trash2 size={14}/>
                        </button>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                          <p className="text-base font-black text-slate-900">{(loc.nfc_scans ?? 0).toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 font-medium">סריקות</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                          <p className="text-base font-black text-slate-900">{(loc.private_review_count ?? 0).toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 font-medium">פרטיות</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                          <p className="text-base font-black text-slate-900">{(loc.google_review_count_local ?? 0).toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 font-medium">Google</p>
                        </div>
                      </div>

                      {/* NFC link */}
                      <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2">
                        <span className="text-[10px] font-mono text-amber-700 flex-1 truncate" dir="ltr">/{loc.slug}</span>
                        <button onClick={async () => {
                          await navigator.clipboard.writeText(`https://myreviewgate.com/${loc.slug}`)
                        }} className="text-amber-500 hover:text-amber-700 transition flex-shrink-0">
                          <Copy size={12}/>
                        </button>
                        <a href={`/${loc.slug}`} target="_blank" rel="noreferrer"
                          className="text-amber-500 hover:text-amber-700 transition flex-shrink-0">
                          <ExternalLink size={12}/>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ALL REVIEWS ── */}
          {activeTab === 'all_reviews' && (() => {
            const allReviews = [
              ...displayGoogleReviews.map(r => ({ ...r, source: 'google' })),
              ...displayFeedback.map(f => ({ ...f, source: 'private' })),
            ].sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))

            return (
              <div className="flex flex-col gap-4 max-w-5xl">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[11px] text-slate-400 mb-1">סה"כ ביקורות Google</p>
                    <p className="text-2xl font-black text-slate-900">{displayGoogleTotal.toLocaleString()}</p>
                    {displayGoogleRating && <p className="text-xs text-amber-500 font-bold mt-0.5">{displayGoogleRating.toFixed(1)} ★</p>}
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[11px] text-slate-400 mb-1">ביקורות פרטיות</p>
                    <p className="text-2xl font-black text-slate-900">{displayFeedback.length}</p>
                    {displayFeedback.length > 0 && <p className="text-xs text-amber-500 font-bold mt-0.5">{avgRating} ★</p>}
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[11px] text-slate-400 mb-1">מוצגות כאן</p>
                    <p className="text-2xl font-black text-slate-900">{allReviews.length}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{displayGoogleReviews.length} Google + {displayFeedback.length} פרטיות</p>
                  </div>
                </div>

                {/* Unified list */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-black text-slate-800">כל הביקורות</h3>
                    {allReviews.length > 0 && (
                      <button
                        onClick={() => downloadReviewsCSV(allReviews, `ביקורות-${store.slug}-${new Date().toISOString().slice(0,10)}.csv`)}
                        className="text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 hover:border-slate-300 transition">
                        ייצוא ל-Excel
                      </button>
                    )}
                  </div>
                  {allReviews.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-sm">אין ביקורות עדיין</div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {allReviews.map(r => (
                        <div key={r.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm overflow-hidden ${r.source === 'google' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {r.author_photo
                              ? <img src={r.author_photo} alt="" className="w-full h-full object-cover" />
                              : (r.author_name || r.customer_name || 'א').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-slate-800 text-sm">{r.author_name || r.customer_name || 'אנונימי'}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.source === 'google' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
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
                            {(r.customer_email || r.customer_phone) && (
                              <p className="text-[11px] text-slate-400 mt-1" dir="ltr">
                                {[r.customer_email, r.customer_phone].filter(Boolean).join(' · ')}
                              </p>
                            )}

                            {r.source === 'private' && (
                              r.owner_reply ? (
                                <div className="mt-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                                  <p className="text-[10px] font-bold text-slate-400 mb-0.5">התגובה שלך</p>
                                  <p className="text-xs text-slate-600 leading-relaxed">{r.owner_reply}</p>
                                </div>
                              ) : replyOpenId === r.id ? (
                                <div className="mt-2 flex flex-col gap-2">
                                  <textarea value={replyDraft} onChange={e => setReplyDraft(e.target.value)}
                                    rows={2} placeholder="כתוב תגובה ללקוח..."
                                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none" />
                                  <div className="flex gap-2">
                                    <button onClick={() => handleSendReply(r.id)} disabled={replySaving || !replyDraft.trim()}
                                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-400 disabled:opacity-50 transition">
                                      {replySaving ? 'שולח...' : 'שלח תגובה'}
                                    </button>
                                    <button onClick={() => { setReplyOpenId(null); setReplyDraft('') }}
                                      className="text-xs text-slate-400 hover:text-slate-600 transition">
                                      ביטול
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => { setReplyOpenId(r.id); setReplyDraft('') }}
                                  className="text-[11px] text-amber-600 font-bold hover:underline mt-1.5">
                                  הגב ללקוח
                                </button>
                              )
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
        <Sidebar active={activeTab} setActive={setActiveTab} onLogout={handleLogout} isChain={store?.type === 'chain'}/>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 flex items-center justify-around py-2 z-20" dir="rtl">
        {[
          { id:'overview',    icon: Home,              label:'דשבורד' },
          ...(store?.type === 'chain' ? [{ id:'locations', icon: MapPin, label:'סניפים' }] : []),
          { id:'all_reviews', icon: Star,              label:'ביקורות' },
          { id:'settings',    icon: Settings,          label:'הגדרות' },
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
