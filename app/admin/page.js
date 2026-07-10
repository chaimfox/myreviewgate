'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  LogOut, Edit2, RefreshCw, Store, Users,
  Clock, CheckCircle, XCircle, Ban, Unlock,
  Eye, MousePointerClick, Star, TrendingUp, X,
  Settings, Save, Mail, Phone, MessageSquare, Copy, Link, Network, Building2, CreditCard,
} from 'lucide-react'
import StoreForm from '@/components/StoreForm'
import Logo from '@/components/Logo'

/* ── NFC Link copy button ────────────────────────────────────── */
function NfcLinkButton({ slug }) {
  const [copied, setCopied] = useState(false)
  const url = `https://myreviewgate.com/${slug}`
  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mt-2">
      <Link size={13} className="text-slate-400 flex-shrink-0" />
      <span className="text-xs font-mono text-slate-600 flex-1 truncate" dir="ltr">{url}</span>
      <button
        onClick={handleCopy}
        title="העתק קישור NFC"
        className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition flex-shrink-0 ${
          copied
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
        }`}
      >
        {copied ? <><CheckCircle size={12} /> הועתק!</> : <><Copy size={12} /> העתק</>}
      </button>
    </div>
  )
}

/* ── Block Modal ─────────────────────────────────────────────── */
function BlockModal({ store, onConfirm, onClose }) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" dir="rtl">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-black text-slate-900">השעיית חשבון</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} className="text-slate-500" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            אתה עומד להשעות את <strong>{store.name}</strong>.<br />
            הלקוח יראה הודעת חסימה ולא יוכל לגשת לדשבורד שלו.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">סיבה (אופציונלי)</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)}
              placeholder="לא שילם, הפרת תנאים..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm
                focus:outline-none focus:ring-2 focus:ring-red-400 transition placeholder-slate-400" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn-secondary">ביטול</button>
            <button onClick={() => onConfirm(reason)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl
                bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition">
              <Ban size={15} /> השעה
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Place ID Input ──────────────────────────────────────────── */
function PlaceIdInput({ store, onSave }) {
  const [val, setVal] = useState(store.google_place_id || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    const ok = await onSave(store.id, val.trim())
    setSaving(false)
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  return (
    <div className="flex items-center gap-2 mt-2 mb-3">
      <svg viewBox="0 0 24 24" width="14" height="14" className="flex-shrink-0">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <input
        type="text" value={val} onChange={e => setVal(e.target.value)}
        placeholder="Place ID (ChIJ...)"
        dir="ltr"
        className="flex-1 text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-400"
      />
      <button onClick={handleSave} disabled={saving}
        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition flex-shrink-0 ${
          saved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-400'
        } disabled:opacity-50`}>
        {saving ? '...' : saved ? '✓' : 'שמור'}
      </button>
    </div>
  )
}

/* ── Location Manager Assignment ─────────────────────────────── */
function LocationManagerAssign({ location }) {
  const [email,   setEmail]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState(null)

  async function handleAssign(e) {
    e.preventDefault()
    setSaving(true); setMsg(null)
    const res = await fetch('/api/admin/assign-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, location_id: location.id }),
    })
    const d = await res.json()
    setSaving(false)
    if (res.ok) { setMsg({ ok: true, text: `${d.user_email} הוקצה בהצלחה` }); setEmail('') }
    else setMsg({ ok: false, text: d.error })
  }

  async function handleRemove() {
    if (!confirm('להסיר את מנהל הסניף?')) return
    await fetch('/api/admin/assign-location', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_id: location.id }),
    })
    setMsg({ ok: true, text: 'מנהל הוסר' })
  }

  return (
    <div className="mt-1.5">
      <p className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
        <Users size={10}/> מנהל סניף
      </p>
      <form onSubmit={handleAssign} className="flex gap-2">
        <input
          type="email" value={email} required
          onChange={e => setEmail(e.target.value)}
          placeholder="מייל של המנהל"
          dir="ltr"
          className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-400 bg-slate-50"
        />
        <button type="submit" disabled={saving}
          className="text-xs font-bold px-2.5 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-400 disabled:opacity-50 transition">
          {saving ? '...' : 'הקצה'}
        </button>
        <button type="button" onClick={handleRemove}
          className="text-xs font-bold px-2.5 py-1.5 border border-slate-200 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition">
          הסר
        </button>
      </form>
      {msg && <p className={`text-[10px] mt-1 font-semibold ${msg.ok ? 'text-emerald-600' : 'text-red-500'}`}>{msg.text}</p>}
    </div>
  )
}

/* ── Chain Locations List (for admin view) ───────────────────── */
function ChainLocationsList({ store }) {
  const [locations, setLocations] = useState(null)
  const [open,      setOpen]      = useState(false)

  async function load() {
    if (locations !== null) { setOpen(o => !o); return }
    const res = await fetch(`/api/admin/chain-locations?store_id=${store.id}`)
    const d = await res.json()
    setLocations(d.locations ?? [])
    setOpen(true)
  }

  if (store.type !== 'chain') return null

  return (
    <div className="mt-2">
      <button onClick={load}
        className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1">
        <Network size={11}/> {open ? 'הסתר סניפים' : `הצג סניפים (${store.max_locations} מקס׳)`}
      </button>
      {open && locations !== null && (
        <div className="mt-2 flex flex-col gap-2 pl-2 border-r-2 border-amber-100 mr-1">
          {locations.length === 0
            ? <p className="text-xs text-slate-400">אין סניפים עדיין</p>
            : locations.map(loc => (
                <div key={loc.id} className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{loc.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono" dir="ltr">/{loc.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{loc.nfc_scans ?? 0} סריקות</span>
                    </div>
                  </div>
                  <LocationManagerAssign location={loc} />
                </div>
              ))
          }
        </div>
      )}
    </div>
  )
}

/* ── Chain Settings per store ────────────────────────────────── */
function ChainSettings({ store, onSave }) {
  const [type,    setType]    = useState(store.type || 'single')
  const [maxLoc,  setMaxLoc]  = useState(store.max_locations ?? 1)
  const [prefix,  setPrefix]  = useState(store.location_slug_prefix || store.slug || '')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  async function handleSave() {
    setSaving(true)
    const ok = await onSave(store.id, { type, max_locations: Number(maxLoc), location_slug_prefix: prefix })
    setSaving(false)
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <p className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
        <Network size={11}/> סוג חשבון ורשת
      </p>
      <div className="flex flex-wrap items-end gap-3">
        {/* Type */}
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2">
          <button onClick={() => setType('single')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition ${type === 'single' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
            <Building2 size={12}/> סניף בודד
          </button>
          <button onClick={() => setType('chain')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition ${type === 'chain' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <Network size={12}/> רשת
          </button>
        </div>

        {/* Max locations — only relevant for chains */}
        {type === 'chain' && (
          <>
            <div>
              <p className="text-[10px] text-slate-400 mb-1">מקס׳ סניפים</p>
              <input type="number" min={1} max={500} value={maxLoc}
                onChange={e => setMaxLoc(e.target.value)}
                className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"/>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 mb-1">prefix</p>
              <input type="text" value={prefix} dir="ltr"
                onChange={e => setPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="ampm"
                className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"/>
            </div>
            <p className="text-[10px] text-slate-400 self-end pb-2">→ {prefix || 'prefix'}-tlv</p>
          </>
        )}

        <button onClick={handleSave} disabled={saving}
          className={`text-xs font-bold px-3 py-2 rounded-lg transition self-end ${
            saved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-400'
          } disabled:opacity-50`}>
          {saving ? '...' : saved ? '✓ נשמר' : 'שמור'}
        </button>
      </div>
    </div>
  )
}

/* ── Billing (manual tracking — no payment gateway yet) ──────── */
function BillingSettings({ store, onSave }) {
  const [price,   setPrice]   = useState(store.billing_price_monthly ?? '')
  const [cycle,   setCycle]   = useState(store.billing_cycle || 'monthly')
  const [status,  setStatus]  = useState(store.billing_status || 'none')
  const [nextDate,setNextDate]= useState(store.next_billing_date || '')
  const [notes,   setNotes]   = useState(store.billing_notes || '')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  async function handleSave() {
    setSaving(true)
    const ok = await onSave(store.id, {
      billing_price_monthly: price === '' ? null : Number(price),
      billing_cycle: cycle,
      billing_status: status,
      next_billing_date: nextDate || null,
      billing_notes: notes || null,
    })
    setSaving(false)
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <p className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
        <CreditCard size={11}/> גבייה
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="text-[10px] text-slate-400 mb-1">מחיר חודשי (₪)</p>
          <input type="number" min={0} value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="350"
            className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"/>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2">
          <button onClick={() => setCycle('monthly')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${cycle === 'monthly' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
            חודשי
          </button>
          <button onClick={() => setCycle('annual')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${cycle === 'annual' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
            שנתי
          </button>
        </div>

        <div>
          <p className="text-[10px] text-slate-400 mb-1">סטטוס</p>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="none">לא פעיל</option>
            <option value="active">פעיל</option>
            <option value="overdue">באיחור</option>
          </select>
        </div>

        <div>
          <p className="text-[10px] text-slate-400 mb-1">חיוב הבא</p>
          <input type="date" value={nextDate}
            onChange={e => setNextDate(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"/>
        </div>

        <button onClick={handleSave} disabled={saving}
          className={`text-xs font-bold px-3 py-2 rounded-lg transition self-end ${
            saved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-400'
          } disabled:opacity-50`}>
          {saving ? '...' : saved ? '✓ נשמר' : 'שמור'}
        </button>
      </div>

      <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="הערות על העסקה (אופציונלי)"
        className="w-full mt-2 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"/>
    </div>
  )
}

/* ── Stat Card ────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, bgClass }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bgClass}`}><Icon size={20} className="text-white" /></div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

/* ── Per-store analytics mini card ───────────────────────────── */
function MiniStat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <Icon size={12} className="text-slate-400" />
      <span className="font-bold text-slate-700">{value}</span>
      <span>{label}</span>
    </div>
  )
}

/* ── Main Page ────────────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [user,          setUser]          = useState(null)
  const [pending,       setPending]       = useState([])
  const [active,        setActive]        = useState([])
  const [suspended,     setSuspended]     = useState([])
  const [allEvents,     setAllEvents]     = useState([])
  const [showStoreForm, setShowStoreForm] = useState(false)
  const [editingStore,  setEditingStore]  = useState(null)
  const [blockTarget,   setBlockTarget]   = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [activeTab,     setActiveTab]     = useState('pending')
  const [siteSettings,  setSiteSettings]  = useState({})
  const [settingsSaving,setSettingsSaving]= useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [contactMsgs,   setContactMsgs]   = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (!profile || profile.role !== 'super_admin') { router.replace('/dashboard'); return }
      setUser(session.user)
    })
  }, [router, supabase])

  const fetchAll = useCallback(async () => {
    if (!user) return
    const [{ data: stores }, { data: events }] = await Promise.all([
      supabase.from('stores').select('*').order('created_at', { ascending: false }),
      supabase.from('analytics_events').select('store_id, event_type, link_label, created_at'),
    ])
    const all = stores ?? []
    setPending(all.filter(s => s.status === 'pending'))
    setActive(all.filter(s => s.status === 'approved'))
    setSuspended(all.filter(s => s.status === 'suspended' || s.status === 'rejected'))
    setAllEvents(events ?? [])
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      fetchAll().finally(() => setLoading(false))
      fetch('/api/admin/settings').then(r => r.json()).then(setSiteSettings).catch(() => {})
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
        .then(({ data }) => setContactMsgs(data ?? []))
    }
  }, [user, fetchAll, supabase])

  async function saveSettings() {
    setSettingsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה')
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 3000)
    } catch (e) {
      alert('שגיאה בשמירה: ' + e.message)
    } finally {
      setSettingsSaving(false)
    }
  }

  async function updateStoreStatus(storeId, status, blockedReason) {
    const res = await fetch('/api/admin/store-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, status, blockedReason }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      alert(`שגיאה: ${error}`)
      return false
    }
    return true
  }

  async function handleApprove(id)  { if (await updateStoreStatus(id, 'approved'))  fetchAll() }
  async function handleReject(id)   { if (await updateStoreStatus(id, 'rejected'))  fetchAll() }
  async function handleUnblock(id)  { if (await updateStoreStatus(id, 'approved'))  fetchAll() }

  async function handleBlock(store, reason) {
    if (await updateStoreStatus(store.id, 'suspended', reason)) {
      setBlockTarget(null)
      fetchAll()
    }
  }

  async function savePlaceId(storeId, placeId) {
    const { error } = await supabase.from('stores').update({ google_place_id: placeId || null }).eq('id', storeId)
    if (!error) fetchAll()
    return !error
  }

  async function saveChainSettings(storeId, settings) {
    const { error } = await supabase.from('stores').update(settings).eq('id', storeId)
    if (!error) fetchAll()
    return !error
  }

  async function saveBilling(storeId, settings) {
    const { error } = await supabase.from('stores').update(settings).eq('id', storeId)
    if (!error) fetchAll()
    return !error
  }

  async function handleSaveStore(form) {
    if (editingStore) {
      const { error } = await supabase.from('stores').update({ ...form }).eq('id', editingStore.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('stores').insert({ ...form, user_id: user.id, status: 'approved' })
      if (error) throw error
    }
    setShowStoreForm(false); setEditingStore(null); fetchAll()
  }

  async function handleLogout() { await supabase.auth.signOut(); router.replace('/login') }

  /* per-store event helpers */
  function storeEvents(storeId) { return allEvents.filter(e => e.store_id === storeId) }
  function ev(storeId, type) { return storeEvents(storeId).filter(e => e.event_type === type).length }
  function evToday(storeId, type) {
    const t = new Date(); t.setHours(0,0,0,0)
    return storeEvents(storeId).filter(e => e.event_type === type && new Date(e.created_at) >= t).length
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f6f3]">
      <RefreshCw size={22} className="animate-spin text-amber-400" />
    </div>
  )

  const tabs = [
    { key: 'pending',   label: pending.length > 0 ? `ממתינים (${pending.length})` : 'ממתינים' },
    { key: 'active',    label: `לקוחות פעילים (${active.length})` },
    { key: 'suspended', label: suspended.length > 0 ? `מושעים (${suspended.length})` : 'מושעים' },
    { key: 'stats',     label: 'סטטיסטיקות' },
    { key: 'settings',  label: 'הגדרות אתר' },
  ]

  /* platform totals */
  const totalViews    = allEvents.filter(e => e.event_type === 'view').length
  const totalGoogle   = allEvents.filter(e => e.event_type === 'click_google').length
  const totalPrivate  = allEvents.filter(e => e.event_type === 'click_private').length

  return (
    <div className="min-h-screen bg-[#f7f6f3]" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-xs bg-slate-900 text-white font-bold px-2.5 py-1 rounded-full">Super Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
              <RefreshCw size={15} />
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition px-3 py-1.5 rounded-lg hover:bg-slate-100">
              <LogOut size={14} />
              <span className="hidden sm:block">התנתק</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Platform summary */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slideUp">
          <StatCard icon={Store}            label="לקוחות פעילים"  value={active.length}    bgClass="bg-amber-400" />
          <StatCard icon={Users}            label="ממתינים"         value={pending.length}   bgClass="bg-slate-600" />
          <StatCard icon={Eye}              label="כניסות (הכל)"   value={totalViews}       bgClass="bg-indigo-500" />
          <StatCard icon={MousePointerClick} label="קליקים גוגל"   value={totalGoogle}      bgClass="bg-emerald-500" />
        </section>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-100 p-1 rounded-xl w-fit shadow-sm flex-wrap">
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              } ${key === 'pending' && pending.length > 0 && activeTab !== key ? 'text-amber-600' : ''}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── PENDING ── */}
        {activeTab === 'pending' && (
          <section className="animate-fadeIn">
            <h2 className="text-lg font-black text-slate-900 mb-4">בקשות ממתינות לאישור</h2>
            {pending.length === 0 ? (
              <div className="card p-12 text-center">
                <CheckCircle size={36} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">אין בקשות ממתינות!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pending.map(s => (
                  <div key={s.id} className="card border-amber-100 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Clock size={14} className="text-amber-500" />
                          <p className="font-black text-slate-900">{s.name}</p>
                          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">ממתין</span>
                        </div>
                        <div className="text-xs text-slate-500 space-y-1">
                          <p>📧 <span className="font-mono text-slate-700" dir="ltr">{s.owner_email}</span></p>
                          <p>📅 {new Date(s.created_at).toLocaleDateString('he-IL')}</p>
                        </div>
                        <NfcLinkButton slug={s.slug} />
                        <ChainSettings store={s} onSave={saveChainSettings} />
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => handleApprove(s.id)}
                          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
                          <CheckCircle size={13} /> אשר
                        </button>
                        <button onClick={() => handleReject(s.id)}
                          className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-500 text-xs font-bold px-4 py-2 rounded-xl border border-red-200 transition">
                          <XCircle size={13} /> דחה
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── ACTIVE CLIENTS ── */}
        {activeTab === 'active' && (
          <section className="animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">לקוחות פעילים</h2>
              <button onClick={() => { setEditingStore(null); setShowStoreForm(true) }} className="btn-primary text-xs px-3 py-2">
                + הוסף לקוח
              </button>
            </div>
            {active.length === 0 ? (
              <div className="card border-dashed p-10 text-center">
                <Store size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">אין לקוחות פעילים עדיין.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {active.map(s => (
                  <div key={s.id} className="card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <p className="font-black text-slate-900">{s.name}</p>
                          <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">פעיל</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2" dir="ltr">{s.owner_email}</p>
                        <NfcLinkButton slug={s.slug} />
                        <PlaceIdInput store={s} onSave={savePlaceId} />
                        <ChainSettings store={s} onSave={saveChainSettings} />
                        <ChainLocationsList store={s} />
                        <BillingSettings store={s} onSave={saveBilling} />
                        {/* Mini analytics */}
                        <div className="flex flex-wrap gap-3">
                          <MiniStat icon={Eye}              value={ev(s.id,'view')}         label="כניסות" />
                          <MiniStat icon={Eye}              value={evToday(s.id,'view')}     label="היום" />
                          <MiniStat icon={MousePointerClick} value={ev(s.id,'click_google')} label="קליקים גוגל" />
                          <MiniStat icon={MousePointerClick} value={ev(s.id,'click_private')} label="קליקים פרטי" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => { setEditingStore(s); setShowStoreForm(true) }}
                          className="flex items-center gap-1.5 btn-secondary text-xs px-3 py-2">
                          <Edit2 size={12} /> ערוך
                        </button>
                        <button onClick={() => setBlockTarget(s)}
                          className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-500 text-xs font-bold px-3 py-2 rounded-xl border border-red-200 transition">
                          <Ban size={12} /> השעה
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── SUSPENDED ── */}
        {activeTab === 'suspended' && (
          <section className="animate-fadeIn">
            <h2 className="text-lg font-black text-slate-900 mb-4">חשבונות מושעים / נדחים</h2>
            {suspended.length === 0 ? (
              <div className="card p-12 text-center">
                <CheckCircle size={36} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">אין חשבונות מושעים</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {suspended.map(s => (
                  <div key={s.id} className="card border-red-100 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Ban size={14} className="text-red-400" />
                          <p className="font-black text-slate-900">{s.name}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'rejected' ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-600'
                          }`}>
                            {s.status === 'rejected' ? 'נדחה' : 'מושעה'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono" dir="ltr">{s.owner_email}</p>
                        {s.blocked_reason && (
                          <p className="text-xs text-red-500 mt-1.5 bg-red-50 px-2 py-1 rounded-lg">
                            סיבה: {s.blocked_reason}
                          </p>
                        )}
                      </div>
                      <button onClick={() => handleUnblock(s.id)}
                        className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl border border-emerald-200 transition flex-shrink-0">
                        <Unlock size={12} /> שחרר
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── STATS ── */}
        {activeTab === 'stats' && (
          <section className="animate-fadeIn">
            <h2 className="text-lg font-black text-slate-900 mb-4">סטטיסטיקות פלטפורמה</h2>
            <div className="flex flex-col gap-4">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card p-4 text-center">
                  <p className="text-2xl font-black text-slate-900">{totalViews}</p>
                  <p className="text-xs text-slate-400 mt-1">סה״כ כניסות</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-black text-amber-500">{totalGoogle}</p>
                  <p className="text-xs text-slate-400 mt-1">קליקים גוגל</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-black text-slate-700">{totalPrivate}</p>
                  <p className="text-xs text-slate-400 mt-1">קליקים פרטי</p>
                </div>
              </div>

              {/* Per-client table */}
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="text-sm font-black text-slate-800">ביצועים לפי לקוח</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500">שם העסק</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500">כניסות</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500">גוגל</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500">פרטי</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500">סטטוס</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[...active, ...suspended].map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-bold text-slate-900">{s.name}</td>
                          <td className="px-4 py-3 text-slate-600">{ev(s.id,'view')}</td>
                          <td className="px-4 py-3 text-amber-600 font-bold">{ev(s.id,'click_google')}</td>
                          <td className="px-4 py-3 text-slate-600">{ev(s.id,'click_private')}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              s.status === 'approved'  ? 'bg-emerald-100 text-emerald-700' :
                              s.status === 'suspended' ? 'bg-red-100 text-red-600'         :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {s.status === 'approved' ? 'פעיל' : s.status === 'suspended' ? 'מושעה' : 'נדחה'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === 'settings' && (
          <section className="animate-fadeIn flex flex-col gap-6">
            <h2 className="text-lg font-black text-slate-900">הגדרות אתר</h2>

            {/* Contact info */}
            <div className="card p-6">
              <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <Mail size={16} className="text-amber-500" /> פרטי יצירת קשר
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">אימייל</label>
                  <input type="email" dir="ltr" value={siteSettings.contact_email ?? ''}
                    onChange={e => setSiteSettings(s => ({ ...s, contact_email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">טלפון</label>
                  <input type="tel" dir="ltr" value={siteSettings.contact_phone ?? ''}
                    onChange={e => setSiteSettings(s => ({ ...s, contact_phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                </div>
              </div>
            </div>

            {/* Accessibility coordinator */}
            <div className="card p-6">
              <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <Settings size={16} className="text-amber-500" /> אחראי נגישות (לדף הצהרת נגישות)
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">שם</label>
                  <input type="text" value={siteSettings.accessibility_coordinator_name ?? ''}
                    onChange={e => setSiteSettings(s => ({ ...s, accessibility_coordinator_name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">אימייל</label>
                  <input type="email" dir="ltr" value={siteSettings.accessibility_coordinator_email ?? ''}
                    onChange={e => setSiteSettings(s => ({ ...s, accessibility_coordinator_email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">טלפון</label>
                  <input type="tel" dir="ltr" value={siteSettings.accessibility_coordinator_phone ?? ''}
                    onChange={e => setSiteSettings(s => ({ ...s, accessibility_coordinator_phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                </div>
              </div>
            </div>

            {/* Privacy policy */}
            <div className="card p-6">
              <h3 className="font-black text-slate-800 mb-3">מדיניות פרטיות (תוכן עברית)</h3>
              <textarea rows={10} value={siteSettings.privacy_policy_he ?? ''}
                onChange={e => setSiteSettings(s => ({ ...s, privacy_policy_he: e.target.value }))}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-y font-mono" />
            </div>

            {/* Terms */}
            <div className="card p-6">
              <h3 className="font-black text-slate-800 mb-3">תקנון שימוש (תוכן עברית)</h3>
              <textarea rows={10} value={siteSettings.terms_he ?? ''}
                onChange={e => setSiteSettings(s => ({ ...s, terms_he: e.target.value }))}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-y font-mono" />
            </div>

            <button onClick={saveSettings} disabled={settingsSaving}
              className="self-start flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black px-6 py-3 rounded-xl transition shadow-sm shadow-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600">
              {settingsSaving ? 'שומר...' : settingsSaved ? <><CheckCircle size={15} /> נשמר!</> : <><Save size={15} /> שמור הגדרות</>}
            </button>

            {/* Contact messages */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <MessageSquare size={15} className="text-amber-500" />
                <p className="text-sm font-black text-slate-800">הודעות מיצירת קשר ({contactMsgs.length})</p>
              </div>
              {contactMsgs.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">אין הודעות עדיין</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {contactMsgs.map(m => (
                    <div key={m.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{m.name}</p>
                          <p className="text-slate-400 text-xs" dir="ltr">{m.email}</p>
                          {m.subject && <p className="text-amber-600 text-xs font-medium mt-0.5">{m.subject}</p>}
                        </div>
                        <p className="text-xs text-slate-400">{new Date(m.created_at).toLocaleDateString('he-IL')}</p>
                      </div>
                      <p className="text-slate-600 text-sm mt-2 leading-relaxed">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      <footer className="text-center py-6 text-xs text-slate-400 mt-4">
        © {new Date().getFullYear()} myReviewGate · כל הזכויות שמורות
      </footer>

      {showStoreForm && (
        <StoreForm initial={editingStore} onSave={handleSaveStore} onCancel={() => { setShowStoreForm(false); setEditingStore(null) }} />
      )}
      {blockTarget && (
        <BlockModal store={blockTarget} onConfirm={(reason) => handleBlock(blockTarget, reason)} onClose={() => setBlockTarget(null)} />
      )}
    </div>
  )
}
