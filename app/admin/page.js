'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Star, LogOut, Plus, Edit2, Copy, Check, ExternalLink,
  RefreshCw, Store, Users, MessageSquare, TrendingUp, Mail, X,
  Clock, CheckCircle, XCircle
} from 'lucide-react'
import StoreForm from '@/components/StoreForm'
import FeedbackTable from '@/components/FeedbackTable'

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">הזמן בעל חנות</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        {done ? (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Mail size={22} className="text-emerald-600" />
            </div>
            <p className="font-semibold text-gray-900">הזמנה נשלחה!</p>
            <p className="text-sm text-gray-500">בעל החנות יקבל מייל עם קישור להגדרת סיסמה.</p>
            <button onClick={onClose} className="mt-2 text-sm text-indigo-600 hover:underline">סגור</button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="p-6 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">אימייל בעל החנות <span className="text-rose-500">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="owner@store.com" dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">שייך לחנות</label>
              <select value={storeId} onChange={(e) => setStoreId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white">
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={loading}
              className="py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
              <Mail size={15} />
              {loading ? 'שולח...' : 'שלח הזמנה'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/* ── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}><Icon size={20} className="text-white" /></div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

/* ── QR Link ──────────────────────────────────────────────────── */
function QRLink({ slug }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `https://yourdomain.com/${slug}`
  async function copy() { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="flex items-center gap-2 bg-indigo-50 rounded-xl px-3 py-2 border border-indigo-100">
      <span className="text-xs text-indigo-700 font-mono truncate flex-1 text-left" dir="ltr">{url}</span>
      <button onClick={copy} className="flex-shrink-0 p-1 rounded hover:bg-indigo-100 transition">
        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-indigo-500" />}
      </button>
      <a href={`/${slug}`} target="_blank" rel="noreferrer" className="flex-shrink-0 p-1 rounded hover:bg-indigo-100 transition">
        <ExternalLink size={14} className="text-indigo-500" />
      </a>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────────── */
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
  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'stores' | 'feedback' | 'customers'
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
      .from('stores')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
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

  const storeFeedback = selectedStore
    ? allFeedback.filter((f) => f.store_id === selectedStore.id)
    : []

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <RefreshCw size={24} className="animate-spin text-indigo-400" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Star size={14} className="text-white fill-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900">ReviewGate</span>
              <span className="mr-2 text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">Super Admin</span>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition px-3 py-1.5 rounded-lg hover:bg-gray-100">
            <LogOut size={15} />
            <span className="hidden sm:block">התנתק</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Platform Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Store} label="חנויות" value={stores.length} color="bg-indigo-500" />
          <StatCard icon={Users} label="לקוחות רשומים" value={customers.length} color="bg-violet-500" />
          <StatCard icon={MessageSquare} label="תלונות פרטיות" value={allFeedback.length} color="bg-rose-500" />
          <StatCard icon={TrendingUp} label="ממוצע דירוג"
            value={allFeedback.length > 0 ? (allFeedback.reduce((s, r) => s + r.rating, 0) / allFeedback.length).toFixed(1) : '–'}
            color="bg-amber-400" />
        </section>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
          {[
            { key: 'pending', label: `ממתינים לאישור ${pendingStores.length > 0 ? `(${pendingStores.length})` : ''}` },
            { key: 'stores', label: 'חנויות מאושרות' },
            { key: 'feedback', label: 'משוב' },
            { key: 'customers', label: 'לקוחות' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition
                ${activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* PENDING TAB */}
        {activeTab === 'pending' && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">בקשות ממתינות לאישור</h2>
            {pendingStores.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <CheckCircle size={36} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">אין בקשות ממתינות — הכל מאושר!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingStores.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} className="text-amber-500 flex-shrink-0" />
                          <p className="font-bold text-gray-900">{s.name}</p>
                          <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full border border-amber-200">ממתין</span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5 mt-2">
                          <p>📧 מייל: <span className="text-gray-700 font-mono" dir="ltr">{s.owner_email}</span></p>
                          <p>🔗 Slug: <span className="text-indigo-600 font-mono" dir="ltr">/{s.slug}</span></p>
                          <p>⭐ Google: <a href={s.google_review_url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline" dir="ltr">{s.google_review_url?.slice(0, 45)}...</a></p>
                          <p>📅 נרשם: <span className="text-gray-600">{new Date(s.created_at).toLocaleDateString('he-IL')}</span></p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => handleApprove(s.id)}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
                          <CheckCircle size={14} />
                          אשר
                        </button>
                        <button onClick={() => handleReject(s.id)}
                          className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-4 py-2 rounded-xl border border-rose-200 transition">
                          <XCircle size={14} />
                          דחה
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* STORES TAB */}
        {activeTab === 'stores' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">ניהול חנויות</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowInvite(true)} disabled={stores.length === 0}
                  className="flex items-center gap-1.5 border border-indigo-200 text-indigo-600 text-sm font-semibold
                    px-4 py-2 rounded-xl hover:bg-indigo-50 transition disabled:opacity-40">
                  <Mail size={15} />
                  הזמן בעל חנות
                </button>
                <button onClick={() => { setEditingStore(null); setShowStoreForm(true) }}
                  className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold
                    px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-sm">
                  <Plus size={15} />
                  הוסף חנות
                </button>
              </div>
            </div>

            {stores.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                <Store size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">אין חנויות. לחץ <strong>הוסף חנות</strong> כדי להתחיל.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {stores.map((store) => (
                  <div key={store.id}
                    onClick={() => { setSelectedStore(store); setActiveTab('feedback') }}
                    className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:border-indigo-200 hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-gray-900">{store.name}</p>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">/{store.slug}</span>
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                            {allFeedback.filter((f) => f.store_id === store.id).length} תלונות
                          </span>
                        </div>
                        <QRLink slug={store.slug} />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setEditingStore(store); setShowStoreForm(true) }}
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition">
                        <Edit2 size={15} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'feedback' && (
          <section>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900">משוב לקוחות</h2>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setSelectedStore(null)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition
                    ${!selectedStore ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  כל החנויות ({allFeedback.length})
                </button>
                {stores.map((s) => (
                  <button key={s.id} onClick={() => setSelectedStore(s)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition
                      ${selectedStore?.id === s.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s.name} ({allFeedback.filter((f) => f.store_id === s.id).length})
                  </button>
                ))}
              </div>
            </div>
            <FeedbackTable rows={selectedStore ? storeFeedback : allFeedback} showStore />
          </section>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">לקוחות רשומים ({customers.length})</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {customers.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Users size={32} className="mx-auto mb-3 opacity-40" />
                  <p>אין לקוחות רשומים עדיין.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-right">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-500">שם</th>
                      <th className="px-4 py-3 font-semibold text-gray-500">טלפון</th>
                      <th className="px-4 py-3 font-semibold text-gray-500">תאריך הרשמה</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{c.full_name || <span className="text-gray-400 italic">אנונימי</span>}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono">{c.phone || '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
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

      {showStoreForm && (
        <StoreForm initial={editingStore} onSave={handleSaveStore} onCancel={() => { setShowStoreForm(false); setEditingStore(null) }} />
      )}
      {showInvite && <InviteModal stores={stores} onClose={() => setShowInvite(false)} />}
    </div>
  )
}
