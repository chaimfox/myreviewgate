'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Star, LogOut, Edit2, Copy, Check, ExternalLink, RefreshCw, Store, Clock } from 'lucide-react'
import StoreForm from '@/components/StoreForm'
import StatsCards from '@/components/StatsCards'
import FeedbackTable from '@/components/FeedbackTable'

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

function PendingScreen({ store }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Star size={14} className="text-white fill-white" />
          </div>
          <span className="font-bold text-gray-900">ReviewGate</span>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock size={36} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">ממתין לאישור</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            בקשת ההצטרפות שלך עבור <strong>{store?.name}</strong> נמצאת בבדיקה.
            נודיע לך במייל ברגע שהמנהל יאשר את החשבון.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-700 text-right w-full">
            <p className="font-semibold mb-1">מה קורה עכשיו?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>המנהל בודק את פרטי העסק שלך</li>
              <li>לאחר אישור תקבל גישה מלאה לדשבורד</li>
              <li>בממוצע: עד 24 שעות</li>
            </ul>
          </div>
        </div>
      </div>
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
      const { data: feedbackData } = await supabase.from('feedback').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false })
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <RefreshCw size={24} className="animate-spin text-indigo-400" />
    </div>
  )

  // Pending approval screen
  if (store?.status === 'pending' || store?.status === 'rejected') {
    return (
      <>
        <PendingScreen store={store} />
        {store?.status === 'rejected' && (
          <div className="fixed bottom-4 inset-x-4 bg-rose-600 text-white text-sm text-center py-3 rounded-2xl shadow-lg" dir="rtl">
            הבקשה שלך נדחתה. צור קשר עם התמיכה.
          </div>
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Star size={14} className="text-white fill-white" />
            </div>
            <span className="font-bold text-gray-900">ReviewGate</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition px-3 py-1.5 rounded-lg hover:bg-gray-100">
              <LogOut size={15} />
              <span className="hidden sm:block">התנתק</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Store Card */}
        {store && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">החנות שלך</h2>
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition">
                <Edit2 size={14} />
                עריכה
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900 text-lg">{store.name}</p>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">מאושר ✓</span>
              </div>
              <QRLink slug={store.slug} />
              <p className="text-xs text-gray-400">שים את הקישור הזה ב-NFC או QR על הדלפק שלך</p>
            </div>
          </section>
        )}

        {/* No store yet */}
        {!store && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <Store size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">אין חנות מקושרת לחשבון שלך עדיין.</p>
          </div>
        )}

        {/* Analytics */}
        {store?.status === 'approved' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">הנתונים שלך</h2>
              <button onClick={fetchData} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
                <RefreshCw size={15} />
              </button>
            </div>
            <div className="flex flex-col gap-5">
              <StatsCards feedback={feedback} />
              <FeedbackTable rows={feedback} />
            </div>
          </section>
        )}
      </main>

      {showForm && store && (
        <StoreForm initial={store} onSave={handleSaveStore} onCancel={() => setShowForm(false)} />
      )}
    </div>
  )
}
