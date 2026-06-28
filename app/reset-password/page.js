'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import Logo from '@/components/Logo'
import SiteFooter from '@/components/SiteFooter'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [done,      setDone]      = useState(false)
  const [ready,     setReady]     = useState(false)

  useEffect(() => {
    // 1. Check if Supabase already resolved the session from the URL hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    // 2. Also listen — in case the token is still being exchanged
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('הסיסמאות אינן תואמות'); return }
    if (password.length < 6)  { setError('הסיסמה חייבת להכיל לפחות 6 תווים'); return }
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (authError) {
      setError('לא הצלחנו לעדכן את הסיסמה. נסה לבקש קישור חדש.')
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f6f3]" dir="rtl">
      <main id="main-content" className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {done ? (
            <div className="card p-8 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-black text-slate-900">הסיסמה עודכנה!</h2>
              <p className="text-slate-500 text-sm">מעביר אותך ללוח הניהול...</p>
            </div>

          ) : !ready ? (
            <div className="card p-8 text-center flex flex-col items-center gap-5">
              <div className="w-10 h-10 border-[3px] border-amber-400 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-slate-700 font-bold text-sm">מאמת את הקישור...</p>
                <p className="text-slate-400 text-xs mt-2">
                  אם העמוד לא נפתח תוך כמה שניות,<br />
                  ייתכן שהקישור פג תוקף.
                </p>
              </div>
              <a href="/login"
                className="text-xs text-amber-600 font-bold hover:underline">
                בקש קישור חדש
              </a>
            </div>

          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900">בחר סיסמה חדשה</h1>
                <p className="text-slate-500 text-sm mt-1">לפחות 6 תווים</p>
              </div>

              <div className="card p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">סיסמה חדשה</label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="לפחות 6 תווים"
                        required
                        dir="ltr"
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition"
                      />
                      <button type="button" onClick={() => setShowPw(p => !p)}
                        aria-label={showPw ? 'הסתר' : 'הצג'}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">אימות סיסמה</label>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="הקלד שוב"
                      required
                      dir="ltr"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-xl border border-red-100">
                      <AlertCircle size={15} className="flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn-primary mt-1">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        שומר...
                      </span>
                    ) : 'שמור סיסמה חדשה'}
                  </button>
                </form>
              </div>
            </>
          )}

        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
