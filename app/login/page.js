'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import Logo from '@/components/Logo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import SiteFooter from '@/components/SiteFooter'
import { useLang } from '@/hooks/useLang'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  // forgot password state
  const [mode,        setMode]        = useState('login') // 'login' | 'forgot' | 'sent'
  const [resetEmail,  setResetEmail]  = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError,  setResetError]  = useState(null)

  const { langCode, handleLangChange } = useLang()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('אימייל או סיסמה שגויים. נסה שוב.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Always show Google's account chooser instead of silently reusing
        // whichever Google account is already signed in on this browser.
        queryParams: { prompt: 'select_account' },
      },
    })
    if (authError) {
      setError('החיבור עם Google נכשל. נסה שוב.')
      setGoogleLoading(false)
    }
    // On success the browser navigates away to Google, so no need to reset loading here.
  }

  async function handleForgot(e) {
    e.preventDefault()
    setResetLoading(true)
    setResetError(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      })
      if (!res.ok) throw new Error()
      setMode('sent')
    } catch {
      setResetError('לא הצלחנו לשלוח את המייל. בדוק את הכתובת ונסה שוב.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <main id="main-content" className="flex flex-1">
        {/* Left decorative panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
          <Logo size="md" theme="dark" />
          <div>
            <blockquote className="text-white text-2xl font-bold leading-snug mb-4">
              "הפוך כל לקוח<br />למדרג."
            </blockquote>
            <p className="text-slate-400 text-sm leading-relaxed">
              myReviewGate נותן ללקוח לבחור: ביקורת בגוגל<br />
              או הודעה פרטית אליך — בלחיצה אחת.
            </p>
          </div>
          <div className="flex items-center gap-8 text-slate-500 text-xs">
            <span>⭐ 4.9/5 דירוג ממוצע</span>
            <span>📍 מאות עסקים</span>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col bg-[#f7f6f3]">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <div className="lg:hidden"><Logo size="sm" /></div>
            <div className="lg:ms-auto">
              <LanguageSwitcher current={langCode} onChange={handleLangChange} />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 py-8">
            <div className="w-full max-w-sm">

              {/* ── LOGIN ── */}
              {mode === 'login' && (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-black text-slate-900">ברוך הבא 👋</h1>
                    <p className="text-slate-500 text-sm mt-1">היכנס ללוח הניהול שלך</p>
                  </div>

                  <div className="card p-6">
                    <button type="button" onClick={handleGoogleLogin} disabled={googleLoading}
                      className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
                      <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {googleLoading ? 'מתחבר...' : 'המשך עם Google'}
                    </button>

                    <div className="flex items-center gap-3 my-5">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs text-slate-400 font-medium">או</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">כתובת אימייל</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com" required autoComplete="email" dir="ltr"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-600">סיסמה</label>
                          <button
                            type="button"
                            onClick={() => { setResetEmail(email); setMode('forgot'); setResetError(null) }}
                            className="text-xs text-amber-600 hover:underline font-medium"
                          >
                            שכחת סיסמה?
                          </button>
                        </div>
                        <div className="relative">
                          <input type={showPw ? 'text' : 'password'} value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" required autoComplete="current-password" dir="ltr"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition" />
                          <button type="button" onClick={() => setShowPw((p) => !p)}
                            aria-label={showPw ? 'הסתר סיסמה' : 'הצג סיסמה'}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition">
                            {showPw ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-xl border border-red-100 text-center">{error}</p>
                      )}

                      <button type="submit" disabled={loading} className="btn-primary mt-1">
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            מתחבר...
                          </span>
                        ) : (
                          <>כניסה <ArrowLeft size={15} /></>
                        )}
                      </button>
                    </form>
                  </div>

                  <p className="text-center text-sm text-slate-500 mt-6">
                    בעל עסק חדש?{' '}
                    <a href="/register" className="text-amber-600 font-bold hover:underline">הצטרף בחינם</a>
                  </p>
                </>
              )}

              {/* ── FORGOT PASSWORD ── */}
              {mode === 'forgot' && (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-black text-slate-900">איפוס סיסמה</h1>
                    <p className="text-slate-500 text-sm mt-1">נשלח לך קישור לאיפוס במייל</p>
                  </div>

                  <div className="card p-6">
                    <form onSubmit={handleForgot} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">כתובת אימייל</label>
                        <div className="relative">
                          <Mail size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            dir="ltr"
                            className="w-full ps-4 pe-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition"
                          />
                        </div>
                      </div>

                      {resetError && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-xl border border-red-100 text-center">{resetError}</p>
                      )}

                      <button type="submit" disabled={resetLoading} className="btn-primary mt-1">
                        {resetLoading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            שולח...
                          </span>
                        ) : 'שלח קישור לאיפוס'}
                      </button>

                      <button type="button" onClick={() => setMode('login')}
                        className="text-sm text-slate-500 hover:text-slate-700 text-center transition">
                        ← חזור לכניסה
                      </button>
                    </form>
                  </div>
                </>
              )}

              {/* ── SENT ── */}
              {mode === 'sent' && (
                <div className="card p-8 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">המייל נשלח!</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    שלחנו קישור לאיפוס סיסמה לכתובת<br />
                    <span className="font-mono text-slate-700 dir-ltr" dir="ltr">{resetEmail}</span>
                  </p>
                  <p className="text-slate-400 text-xs">אם לא רואה את המייל, בדוק בתיקיית ספאם.</p>
                  <button onClick={() => setMode('login')}
                    className="text-sm text-amber-600 font-bold hover:underline mt-2">
                    חזור לכניסה
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
