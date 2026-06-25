'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  return (
    <main className="min-h-screen flex" dir="rtl">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
        <Logo size="md" theme="dark" />
        <div>
          <blockquote className="text-white text-2xl font-bold leading-snug mb-4">
            "הפוך כל לקוח<br />למדרג מרוצה."
          </blockquote>
          <p className="text-slate-400 text-sm leading-relaxed">
            ReviewGate מפנה ביקורות חיוביות לגוגל<br />
            ושומר תלונות פרטיות — בלחיצה אחת.
          </p>
        </div>
        <div className="flex items-center gap-8 text-slate-500 text-xs">
          <span>⭐ 4.9/5 דירוג ממוצע</span>
          <span>📍 מאות עסקים</span>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f7f6f3] px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size="lg" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900">ברוך הבא 👋</h1>
            <p className="text-slate-500 text-sm mt-1">היכנס ללוח הניהול שלך</p>
          </div>

          <div className="card p-6">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">כתובת אימייל</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                    text-slate-900 placeholder-slate-400 text-sm text-left
                    focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                    focus:bg-white transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-600">סיסמה</label>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                      text-slate-900 placeholder-slate-400 text-sm text-left
                      focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                      focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-xl border border-red-100 text-center">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-1"
              >
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
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 text-center py-4 text-xs text-slate-400">
          © {new Date().getFullYear()} ReviewGate · כל הזכויות שמורות
        </footer>
      </div>
    </main>
  )
}
