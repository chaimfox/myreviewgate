'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Star, Eye, EyeOff } from 'lucide-react'

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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-5" dir="rtl">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4">
            <Star size={22} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ReviewGate</h1>
          <p className="text-indigo-300 text-sm mt-1">התחבר ללוח הניהול שלך</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-indigo-200 mb-1.5">כתובת אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white
                  placeholder-indigo-300 text-sm text-left
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-200 mb-1.5">סיסמה</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white
                    placeholder-indigo-300 text-sm text-left
                    focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white transition"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white
                font-semibold text-sm shadow-lg shadow-indigo-500/30
                disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'מתחבר...' : 'כניסה'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-indigo-400 mt-6">
          בעל עסק חדש?{' '}
          <a href="/register" className="text-indigo-300 hover:text-white transition">הצטרף עכשיו</a>
        </p>
      </div>
    </main>
  )
}
