'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  LogOut, Plus, Edit2, Copy, Check, ExternalLink,
  RefreshCw, Store, Users, MessageSquare, TrendingUp, Mail, X,
  Clock, CheckCircle, XCircle, Star
} from 'lucide-react'
import StoreForm from '@/components/StoreForm'
import FeedbackTable from '@/components/FeedbackTable'
import Logo from '@/components/Logo'

/* ── Invite Modal ─────────────────────────────────────────────── */
function InviteModal({ stores, onClose }) {
  const [email, setEmail] = useState('')
  const [storeId, setStoreId] = useState(stores[0]?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  async function handleInvite(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const store = stores.find((s) => s.id === storeId)
    const res = await fetch('/api/admin/invite-owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, storeName: store?.name }),
    })
    const json = await res.json()
    if (!res.ok) setError(json.error)
    else setDone(true)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" dir="rtl">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">הזמן בעל חנות</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        {done ? (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Mail size={22} className="text-emerald-600" />
            </div>
            <p className="font-bold text-slate-900">הזמנה נשלחה!</p>
            <p className="text-sm text-slate-500">בעל החנות יקבל מייל עם קישור.</p>
            <button onClick={onClose} className="mt-2 text-sm text-amber-600 font-bold hover:underline">סגור</button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="p-6 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">אימייל בעל החנות <span className="text-red-500">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="owner@store.com" dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">שייך לחנות</label>
              <select value={storeId} onChange={(e) => setStoreId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition bg-white">
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary">
              <Mail size={15} />
              {loading ? 'שולח...' : 'שלח הזמנה'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/* ── Stat Card ────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, bgClass }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bgClass}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

/* ── QR Link ──────────────────────────────────────────────────── */
function QRLink({ slug }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `https://reviewgate.app/${slug}`
  async function copy() { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">
      <span className="text-xs text-amber-800 font-mono truncate flex-1 text-left" dir="ltr">{url}</span>
      <button onClick={copy} className="flex-shrink-0 p-1 rounded hover:bg-amber-100 transition">
        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-amber-600" />}
      </button>
      <a href={`/${slug}`} target="_blank" rel="noreferrer" className="flex-shrink-0 p-1 rounded hover:bg-amber-100 transition">
        <ExternalLink size={14} className="text-amber-600" />
      </a>
    </div>
  )
}

/* ── Main Page ────────────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [user, setUser] = useState(null)
  const [stores, setStores] = useState([])
  const [allFeedback, setAllFeedback] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [showStoreForm, setShowStoreForm] = useState(false)
  const [editingStore, setEditingStore] = useState(null)
  const [showInvite, setShowInvite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingStores, setPendingStores] = useState([])

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
    const [{ data: storeData }, { data: feedbackData }, { data: customerData }] = await Promise.all([
      supabase.from('stores').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
      supabase.from('feedback').select('*, stores(name, slug)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false }),
    ])
    setStores(storeData ?? [])
    setAllFeedback(feedbackData ?? [])
    setCustomers(customerData ?? [])
    if (storeData?.length && !selectedStore) setSelectedStore(storeData[0])

    const { data: pendingData } = await supabase
      .from('stores').select('*').eq('status', 'pending').order('created_at', { ascending: false })
    setPendingStores(pendingData ?? [])
  }, [user, supabase, selectedStore])

  useEffect(() => { if (user) fetchAll().finally(() => setLoading(false)) }, [user, fetchAll])

  async function handleSaveStore(form) {
    if (editingStore) {
      const { error } = await supabase.from('stores').update({ ...form }).eq('id', editingStore.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('stores').insert({ ...form, user_id: user.id })
      if (error) throw error
    }
    setShowStoreForm(false); setEditingStore(null); await fetchAll()
  }

  async function handleApprove(storeId) {
    await supabase.from('stores').update({ status: 'approved' }).eq('id', storeId)
    await fetchAll()
  }

  async function handleReject(storeId) {
    await supabase.from('stores').update({ status: 'rejected' }).eq('id', storeId)
    await fetchAll()
  }

  async function handleLogout() { await supabase.auth.signOut(); router.replace('/login') }

  const storeFeedback = selectedStore ? allFeedback.filter((f) => f.store_id === selectedStore.id) : []

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f6f3]">
      <RefreshCw size={22} className="animate-spin text-amber-400" />
    </div>
  )

  const tabs = [
    { key: 'pending', label: pendingStores.length > 0 ? `ממתינים (${pendingStores.length})` : 'ממתינים' },
    { key: 'stores',   label: 'חנויות' },
    { key: 'feedback', label: 'משוב' },
    { key: 'customers', label: 'לקוחות' },
  ]

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

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slideUp">
          <StatCard icon={Store}        label="חנויות פעילות"  value={stores.length}      bgClass="bg-amber-400" />
          <StatCard icon={Users}        label="לקוחות"          value={customers.length}   bgClass="bg-slate-700" />
          <StatCard icon={MessageSquare} label="משובים פרטיים" value={allFeedback.length}  bgClass="bg-rose-400" />
          <StatCard icon={Star}         label="דירוג ממוצע"
            value={allFeedback.length > 0 ? (allFeedback.reduce((s, r) => s + (r.rating || 0), 0) / allFeedback.length).toFixed(1) : '–'}
            bgClass="bg-emerald-500" />
        </section>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-100 p-1 rounded-xl w-fit shadow-sm">
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              } ${key === 'pending' && pendingStores.length > 0 && activeTab !== key ? 'text-amber-600' : ''}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── PENDING TAB ── */}
        {activeTab === 'pending' && (
          <section className="animate-fadeIn">
            <h2 className="text-lg font-black text-slate-900 mb-4">בקשות ממתינות לאישור</h2>
            {pendingStores.length === 0 ? (
              <div className="card p-12 text-center">
                <CheckCircle size={36} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">אין בקשות ממתינות — הכל מאושר!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingStores.map((s) => (
                  <div key={s.id} className="card border-amber-100 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Clock size={14} className="text-amber-500 flex-shrink-0" />
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

        {/* ── STORES TAB ── */}
        {activeTab === 'stores' && (
          <section className="animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">חנויות מאושרות ({stores.length})</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowInvite(true)} disabled={stores.length === 0}
                  className="btn-secondary text-xs px-3 py-2 disabled:opacity-40">
                  <Mail size={14} /> הזמן
                </button>
                <button onClick={() => { setEditingStore(null); setShowStoreForm(true) }}
                  className="btn-primary text-xs px-3 py-2">
                  <Plus size={14} /> הוסף חנות
                </button>
              </div>
            </div>

            {stores.length === 0 ? (
              <div className="card border-dashed p-10 text-center">
                <Store size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">אין חנויות מאושרות עדיין.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {stores.map((store) => (
                  <div key={store.id} onClick={() => { setSelectedStore(store); setActiveTab('feedback') }}
                    className="card p-4 cursor-pointer hover:border-amber-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <p className="font-black text-slate-900">{store.name}</p>
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">/{store.slug}</span>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                            {allFeedback.filter((f) => f.store_id === store.id).length} משובים
                          </span>
                        </div>
                        <QRLink slug={store.slug} />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setEditingStore(store); setShowStoreForm(true) }}
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-100 transition">
                        <Edit2 size={15} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── FEEDBACK TAB ── */}
        {activeTab === 'feedback' && (
          <section className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h2 className="text-lg font-black text-slate-900">משוב לקוחות</h2>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setSelectedStore(null)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
                    !selectedStore ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                  הכל ({allFeedback.length})
                </button>
                {stores.map((s) => (
                  <button key={s.id} onClick={() => setSelectedStore(s)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
                      selectedStore?.id === s.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                    {s.name} ({allFeedback.filter((f) => f.store_id === s.id).length})
                  </button>
                ))}
              </div>
            </div>
            <FeedbackTable rows={selectedStore ? storeFeedback : allFeedback} showStore />
          </section>
        )}

        {/* ── CUSTOMERS TAB ── */}
        {activeTab === 'customers' && (
          <section className="animate-fadeIn">
            <h2 className="text-lg font-black text-slate-900 mb-4">לקוחות רשומים ({customers.length})</h2>
            <div className="card overflow-hidden">
              {customers.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Users size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">אין לקוחות רשומים עדיין.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-500 text-xs">שם</th>
                      <th className="px-4 py-3 font-bold text-slate-500 text-xs">טלפון</th>
                      <th className="px-4 py-3 font-bold text-slate-500 text-xs">תאריך הרשמה</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-semibold text-slate-800">{c.full_name || <span className="text-slate-300 italic">אנונימי</span>}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{c.phone || '—'}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {new Date(c.created_at).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400 mt-4">
        © {new Date().getFullYear()} ReviewGate · כל הזכויות שמורות
      </footer>

      {showStoreForm && (
        <StoreForm initial={editingStore} onSave={handleSaveStore} onCancel={() => { setShowStoreForm(false); setEditingStore(null) }} />
      )}
      {showInvite && <InviteModal stores={stores} onClose={() => setShowInvite(false)} />}
    </div>
  )
}
