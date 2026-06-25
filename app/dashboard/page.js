'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  LogOut, Edit2, Copy, Check, ExternalLink,
  RefreshCw, Store, Clock, BarChart2, MessageSquare, Star
} from 'lucide-react'
import StoreForm from '@/components/StoreForm'
import StatsCards from '@/components/StatsCards'
import FeedbackTable from '@/components/FeedbackTable'
import Logo from '@/components/Logo'
import Image from 'next/image'

function QRLink({ slug }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/${slug}`
    : `https://reviewgate.app/${slug}`

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
      <span className="text-xs text-amber-800 font-mono truncate flex-1 text-left" dir="ltr">{url}</span>
      <button onClick={copy} title="העתק קישור"
        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-amber-100 transition">
        {copied
          ? <Check size={14} className="text-emerald-600" />
          : <Copy size={14} className="text-amber-600" />}
      </button>
      <a href={`/${slug}`} target="_blank" rel="noreferrer" title="פתח בדפדפן"
        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-amber-100 transition">
        <ExternalLink size={14} className="text-amber-600" />
      </a>
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
            <LogOut size={14} />
            <span>התנתק</span>
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
              נודיע לך במייל ברגע שהמנהל יאשר.
            </p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm text-slate-600 w-full shadow-sm">
            <p className="font-bold mb-2 text-slate-800">מה קורה עכשיו?</p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />המנהל בודק את פרטי העסק שלך</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />לאחר אישור תקבל גישה מלאה לדשבורד</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />בממוצע: עד 24 שעות</li>
            </ul>
          </div>
        </div>
      </div>
      <footer className="text-center py-4 text-xs text-slate-400">
        © {new Date().getFullYear()} ReviewGate · כל הזכויות שמורות
      </footer>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [user, setUser] = useState(null)
  const [store, setStore] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
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
      const { data: feedbackData } = await supabase
        .from('feedback').select('*').eq('store_id', storeData.id)
        .order('created_at', { ascending: false })
      setFeedback(feedbackData ?? [])
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

  const avgRating = feedback.length
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : '—'

  return (
    <div className="min-h-screen bg-[#f7f6f3]" dir="rtl">
      {/* Header */}
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
              {/* Logo preview */}
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
                <p className="text-xs text-slate-400 mt-2">שים קישור זה על ה-NFC / QR על הדלפק שלך</p>
              </div>

              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 btn-secondary flex-shrink-0">
                <Edit2 size={14} />
                <span>עריכה</span>
              </button>
            </div>
          </section>
        ) : (
          <div className="card border-dashed p-12 text-center">
            <Store size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">אין חנות מקושרת לחשבון שלך עדיין.</p>
          </div>
        )}

        {/* Analytics */}
        {store?.status === 'approved' && (
          <section className="animate-fadeIn">
            {/* Tabs */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1">
                {[
                  { id: 'overview', label: 'סקירה', icon: BarChart2 },
                  { id: 'feedback', label: 'משובים', icon: MessageSquare },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
              <button onClick={fetchData}
                className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-slate-700 transition border border-transparent hover:border-slate-100">
                <RefreshCw size={15} />
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="flex flex-col gap-5">
                {/* Quick stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="card p-4 text-center">
                    <p className="text-2xl font-black text-slate-900">{feedback.length}</p>
                    <p className="text-xs text-slate-400 mt-1">משובים</p>
                  </div>
                  <div className="card p-4 text-center">
                    <p className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                      {avgRating}
                      {avgRating !== '—' && <Star size={16} className="fill-amber-400 text-amber-400" />}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">דירוג ממוצע</p>
                  </div>
                  <div className="card p-4 text-center">
                    <p className="text-2xl font-black text-slate-900">
                      {feedback.filter(f => (f.rating || 0) >= 4).length}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">מדרגים גבוה</p>
                  </div>
                </div>
                <StatsCards feedback={feedback} />
              </div>
            )}

            {activeTab === 'feedback' && (
              <FeedbackTable rows={feedback} />
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400 mt-4">
        © {new Date().getFullYear()} ReviewGate · כל הזכויות שמורות
      </footer>

      {showForm && store && (
        <StoreForm initial={store} onSave={handleSaveStore} onCancel={() => setShowForm(false)} />
      )}
    </div>
  )
}
