'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Star, Store, Link, Mail, Lock, User, Clock } from 'lucide-react'
import NextLink from 'next/link'

const STEPS = ['account', 'business', 'done']

export default function RegisterPage() {
  const supabase = createClientComponentClient()
  const [step, setStep] = useState('account')

  // Account fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Business fields
  const [storeName, setStoreName] = useState('')
  const [slug, setSlug] = useState('')
  const [googleUrl, setGoogleUrl] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)

  // Auto-generate slug from store name
  function handleStoreName(val) {
    setStoreName(val)
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  async function handleAccountStep(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role: 'store_owner' },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setUserId(data.user?.id)
    setOwnerEmail(email)
    setLoading(false)
    setStep('business')
  }

  async function handleBusinessStep(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/register/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: storeName,
          slug,
          googleUrl,
          ownerEmail,
          fullName: name,
          email,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      setStep('done')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-5" dir="rtl">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 shadow-lg mb-4">
            <Star size={22} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ReviewGate</h1>
          <p className="text-indigo-300 text-sm mt-1">הצטרף כבעל עסק</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {['פרטי חשבון', 'פרטי העסק', 'סיום'].map((label, i) => {
            const stepKey = STEPS[i]
            const active = step === stepKey
            const done = STEPS.indexOf(step) > i
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition
                  ${done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-500 text-white' : 'bg-white/10 text-indigo-300'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={`text-xs ${active ? 'text-white font-semibold' : 'text-indigo-400'}`}>{label}</span>
                {i < 2 && <div className="w-6 h-px bg-white/20" />}
              </div>
            )
          })}
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-2xl">

          {/* STEP 1: Account */}
          {step === 'account' && (
            <form onSubmit={handleAccountStep} className="flex flex-col gap-4">
              <h2 className="text-white font-semibold text-lg mb-1">פרטי הכניסה שלך</h2>

              <div>
                <label className="block text-xs font-semibold text-indigo-200 mb-1.5">שם מלא</label>
                <div className="relative">
                  <User size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="ישראל ישראלי"
                    className="w-full ps-9 pe-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-indigo-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-200 mb-1.5">אימייל</label>
                <div className="relative">
                  <Mail size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@store.com" dir="ltr"
                    className="w-full ps-9 pe-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-indigo-300 text-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-200 mb-1.5">סיסמה</label>
                <div className="relative">
                  <Lock size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="לפחות 6 תווים"
                    className="w-full ps-9 pe-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-indigo-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                </div>
              </div>

              {error && <p className="text-sm text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20 text-center">{error}</p>}

              <button type="submit" disabled={loading}
                className="mt-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm disabled:opacity-50 transition">
                {loading ? 'יוצר חשבון...' : 'המשך →'}
              </button>
            </form>
          )}

          {/* STEP 2: Business */}
          {step === 'business' && (
            <form onSubmit={handleBusinessStep} className="flex flex-col gap-4">
              <h2 className="text-white font-semibold text-lg mb-1">פרטי העסק שלך</h2>

              <div>
                <label className="block text-xs font-semibold text-indigo-200 mb-1.5">שם העסק <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <Store size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                  <input type="text" value={storeName} onChange={(e) => handleStoreName(e.target.value)} required placeholder="קפה סנוק"
                    className="w-full ps-9 pe-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-indigo-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-200 mb-1.5">
                  כתובת הדף שלך <span className="text-rose-400">*</span>
                  <span className="text-indigo-400 font-normal mr-1">(מה שמופיע אחרי /)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 text-xs whitespace-nowrap">reviewgate.app/</span>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required
                    placeholder="cafe-sanuk" dir="ltr"
                    className="flex-1 px-3 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-indigo-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-200 mb-1.5">קישור לגוגל ביקורות <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <Link size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                  <input type="url" value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} required placeholder="https://g.page/r/..." dir="ltr"
                    className="w-full ps-9 pe-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-indigo-300 text-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                </div>
                <p className="text-xs text-indigo-400 mt-1">איך מוצאים את הקישור? גוגל מפות → העסק שלך → שתף → העתק קישור</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-200 mb-1.5">אימייל לקבלת התראות</label>
                <div className="relative">
                  <Mail size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                  <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required dir="ltr"
                    className="w-full ps-9 pe-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-indigo-300 text-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                </div>
              </div>

              {error && <p className="text-sm text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20 text-center">{error}</p>}

              <button type="submit" disabled={loading}
                className="mt-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm disabled:opacity-50 transition">
                {loading ? 'שולח בקשה...' : 'שלח לאישור ✓'}
              </button>
            </form>
          )}

          {/* STEP 3: Done */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-16 h-16 bg-amber-400/20 rounded-full flex items-center justify-center">
                <Clock size={32} className="text-amber-400" />
              </div>
              <h2 className="text-white font-bold text-xl">הבקשה נשלחה!</h2>
              <p className="text-indigo-200 text-sm leading-relaxed">
                קיבלנו את פרטי העסק שלך.<br />
                המנהל יבדוק את הבקשה ויאשר אותה בהקדם.<br />
                תקבל מייל ברגע שהחשבון יאושר.
              </p>
              <div className="mt-2 bg-white/5 rounded-xl px-4 py-3 text-xs text-indigo-300 border border-white/10">
                בינתיים, תוכל להכנס ב: <span className="text-white font-semibold">/login</span>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-indigo-400 mt-6">
          כבר יש לך חשבון?{' '}
          <NextLink href="/login" className="text-indigo-300 hover:text-white transition">כניסה</NextLink>
        </p>
      </div>
    </main>
  )
}
