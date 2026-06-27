'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  LogOut, Edit2, RefreshCw, Store, Users,
  Clock, CheckCircle, XCircle, Ban, Unlock,
  Eye, MousePointerClick, Star, TrendingUp, X,
  Settings, Save, Mail, Phone, MessageSquare,
} from 'lucide-react'
import StoreForm from '@/components/StoreForm'
import Logo from '@/components/Logo'

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
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteSettings),
    })
    setSettingsSaving(false)
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 3000)
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
                          <p>🔗 <span className="font-mono text-amber-700" dir="ltr">/{s.slug}</span></p>
                          <p>📅 {new Date(s.created_at).toLocaleDateString('he-IL')}</p>
                        </div>
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
                          <span className="text-xs font-mono text-slate-400" dir="ltr">/{s.slug}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-3" dir="ltr">{s.owner_email}</p>
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
